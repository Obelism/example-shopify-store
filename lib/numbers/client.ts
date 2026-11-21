"use client";

import { PREVIEW_PARAMS } from "@obelism/content";
import { SITE_EDITING_COOKIE } from "@obelism/content/site";
import { createNumbers, type NumbersClient, type TrackOptions } from "@obelism/numbers-sdk";
import { useEffect, useState } from "react";

import { getNumbersConfig } from "./index";

let numbers: NumbersClient | null | undefined;

// Content's canvas puts the editor's token in the URL and site editing sets this cookie: neither the token nor editors' visits belong in analytics.
function isEditingContent() {
  return (
    new URLSearchParams(window.location.search).has(PREVIEW_PARAMS.token) ||
    document.cookie.split("; ").some((cookie) => cookie.startsWith(`${SITE_EDITING_COOKIE}=`))
  );
}

export function getNumbers(): NumbersClient | null {
  if (typeof window === "undefined") return null;
  if (numbers !== undefined) return numbers;
  const config = getNumbersConfig();
  numbers = config && !isEditingContent() ? createNumbers(config) : null;
  return numbers;
}

export function trackEvent(event: string, scope: string, options?: TrackOptions) {
  void getNumbers()?.track(event, scope, options);
}

export function useVisitorId(): string | null {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  useEffect(() => setVisitorId(getNumbers()?.visitor()?.id ?? null), []);
  return visitorId;
}
