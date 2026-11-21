"use client";

import { PREVIEW_PARAMS } from "@obelism/content";
import { SITE_EDITING_COOKIE } from "@obelism/content/site";

// Content's canvas puts the editor's token in the URL and site editing sets this cookie: editors' visits stay out of analytics and test results.
export function isEditingContent(): boolean {
  return (
    new URLSearchParams(window.location.search).has(PREVIEW_PARAMS.token) ||
    document.cookie.split("; ").some((cookie) => cookie.startsWith(`${SITE_EDITING_COOKIE}=`))
  );
}
