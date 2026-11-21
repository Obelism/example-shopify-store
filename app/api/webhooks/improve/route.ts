import { revalidateTag } from "next/cache";

import { verifyImproveWebhook } from "@/lib/improve/request";

const IMPROVE_WEBHOOK_SECRET = process.env.IMPROVE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!IMPROVE_WEBHOOK_SECRET) return new Response(null, { status: 404 });
  const body = await request.text();
  if (!verifyImproveWebhook(request.headers, body, IMPROVE_WEBHOOK_SECRET)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }
  revalidateTag("improve", { expire: 0 });
  return Response.json({ success: true });
}
