import crypto from "node:crypto";

import { isVisitorId } from "@obelism/numbers-sdk";
import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

import { VISITOR_LINE_ATTRIBUTE } from "@/lib/numbers";
import { sendServerEvent } from "@/lib/numbers/server";
import { getNumericShopifyId } from "@/lib/shopify/id/server";

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

const paidOrderSchema = z.object({
  client_details: z.object({ user_agent: z.string().nullish() }).nullish(),
  currency: z.string(),
  id: z.number(),
  line_items: z.array(
    z.object({
      price: z.string(),
      product_id: z.number().nullish(),
      properties: z.array(z.object({ name: z.string(), value: z.unknown() })).nullish(),
      quantity: z.number(),
      variant_id: z.number().nullish(),
    }),
  ),
  shipping_address: z.object({ country_code: z.string().nullish() }).nullish(),
  subtotal_price: z.string(),
  total_shipping_price_set: z.object({ shop_money: z.object({ amount: z.string() }) }).nullish(),
  total_tax: z.string().nullish(),
});

// Numbers counts the purchase for the visitor who added the prints: their id rides along as a hidden line property.
async function sendPurchase(body: string) {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    payload = null;
  }
  const order = paidOrderSchema.safeParse(payload);
  if (!order.success) {
    console.error("[Shopify Webhook] Unexpected orders/paid payload");
    return false;
  }
  const { data } = order;
  const visitorId = data.line_items
    .flatMap((line) => line.properties ?? [])
    .find((property) => property.name === VISITOR_LINE_ATTRIBUTE)?.value;
  if (typeof visitorId !== "string" || !isVisitorId(visitorId)) return false;
  return sendServerEvent({
    country: data.shipping_address?.country_code ?? undefined,
    currency: data.currency,
    event: "purchase",
    params: {
      items: data.line_items.map((line) => ({
        item_id: line.product_id ? String(line.product_id) : null,
        item_variant_id: line.variant_id ? String(line.variant_id) : null,
        price: Number(line.price),
        quantity: line.quantity,
      })),
      order_id: data.id,
      shipping: Number(data.total_shipping_price_set?.shop_money.amount ?? 0),
      tax: Number(data.total_tax ?? 0),
    },
    path: "/checkout",
    scope: "checkout",
    userAgent: data.client_details?.user_agent ?? undefined,
    value: Number(data.subtotal_price),
    visitorId,
  });
}

function verifyWebhook(body: string, hmacHeader: string | null, secret: string): boolean {
  if (!hmacHeader) return false;

  const expected = crypto.createHmac("sha256", secret).update(body, "utf8").digest();
  const received = Buffer.from(hmacHeader, "base64");

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  if (!SHOPIFY_WEBHOOK_SECRET) return new Response(null, { status: 404 });

  const body = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic");

  if (!verifyWebhook(body, hmacHeader, SHOPIFY_WEBHOOK_SECRET)) {
    console.error("Invalid Shopify webhook signature");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!topic) {
    return Response.json({ error: "Missing topic header" }, { status: 400 });
  }

  const tagsInvalidated: string[] = [];

  if (topic.startsWith("products/")) {
    // Product tags cascade through every surface without purging the full catalog.
    const productTags: string[] = [];

    if (topic === "products/create" || topic === "products/delete") {
      productTags.push("products-index");
    }

    try {
      const payload = JSON.parse(body);
      if (payload.handle) {
        productTags.push(`product-${payload.handle}`);
        productTags.push(`recommendations-${payload.handle}`);
      }
      if (payload.admin_graphql_api_id) {
        const numericId = getNumericShopifyId(payload.admin_graphql_api_id);
        if (numericId) {
          productTags.push(`product-${numericId}`);
        }
      } else if (payload.id) {
        productTags.push(`product-${payload.id}`);
      }
    } catch {
      console.error("[Shopify Webhook] Could not parse products payload; no tags invalidated");
    }

    for (const tag of productTags) {
      revalidateTag(tag, { expire: 0 });
      tagsInvalidated.push(tag);
    }
  }

  if (topic.startsWith("collections/")) {
    // Create/delete also invalidate the collection index; the broad tag is break-glass only.
    const collectionTags: string[] = [];

    if (topic === "collections/create" || topic === "collections/delete") {
      collectionTags.push("collections-index");
    }

    try {
      const payload = JSON.parse(body);
      if (payload.handle) {
        collectionTags.push(`collection-${payload.handle}`);
      }
      if (payload.admin_graphql_api_id) {
        const numericId = getNumericShopifyId(payload.admin_graphql_api_id);
        if (numericId) {
          collectionTags.push(`collection-${numericId}`);
        }
      } else if (payload.id) {
        collectionTags.push(`collection-${payload.id}`);
      }
    } catch {
      console.error("[Shopify Webhook] Could not parse collections payload");
    }

    for (const tag of collectionTags) {
      revalidateTag(tag, { expire: 0 });
      tagsInvalidated.push(tag);
    }
  }

  if (topic.startsWith("metaobjects/")) {
    // Metaobjects are low-cardinality, so fire the broad tag too (unlike catalog) — aggregate reads refresh without per-type index tags.
    const metaobjectTags = ["metaobjects"];

    try {
      const payload = JSON.parse(body);
      if (payload.handle) {
        metaobjectTags.push(`metaobject-${payload.handle}`);
      }
    } catch {
      console.error("[Shopify Webhook] Could not parse metaobjects payload");
    }

    for (const tag of metaobjectTags) {
      revalidateTag(tag, { expire: 0 });
      tagsInvalidated.push(tag);
    }
  }

  // Answer before Numbers does: a slow send would trip Shopify's timeout and its retry would count the order twice.
  if (topic === "orders/paid") after(() => sendPurchase(body));

  return Response.json({
    success: true,
    topic,
    tagsInvalidated,
  });
}
