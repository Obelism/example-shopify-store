import { createSiteEditing } from "@obelism/content/site";
import { draftMode } from "next/headers";

import { parseContentEnvironment } from "@/lib/cms";

const handler = createSiteEditing({
  environment: parseContentEnvironment(process.env.CONTENT_ENVIRONMENT),
  onSignIn: async () => (await draftMode()).enable(),
  onSignOut: async () => (await draftMode()).disable(),
  spaceId: process.env.CONTENT_SPACE_ID ?? "",
});

export { handler as GET, handler as POST };
