import { createWebhookHandler } from "@obelism/content/webhooks";
import { revalidateTag } from "next/cache";

const CONTENT_WEBHOOK_SECRET = process.env.CONTENT_WEBHOOK_SECRET;

const handler = CONTENT_WEBHOOK_SECRET
  ? createWebhookHandler({
      onEvent: () => {
        revalidateTag("cms", { expire: 0 });
      },
      secret: CONTENT_WEBHOOK_SECRET,
    })
  : null;

export async function POST(request: Request) {
  if (!handler) return new Response(null, { status: 404 });
  return handler(request);
}
