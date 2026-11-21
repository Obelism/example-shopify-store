import { PREVIEW_PARAMS } from "@obelism/content";
import { SITE_TOKEN_COOKIE } from "@obelism/content/site";
import type { NextRequest } from "next/server";

export function isDraftRequest(request: NextRequest): boolean {
  return (
    request.nextUrl.searchParams.has(PREVIEW_PARAMS.token) || request.cookies.has(SITE_TOKEN_COOKIE)
  );
}
