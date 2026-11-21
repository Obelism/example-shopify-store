"use client";

import { createNumbers, type NumbersClient, type TrackOptions } from "@obelism/numbers-sdk";
import { useSyncExternalStore } from "react";

import { getNumbersConfig } from "./index";

let numbers: NumbersClient | null | undefined;

// Content's canvas puts the editor's token in the URL and site editing sets this cookie: neither the token nor editors' visits belong in analytics.
function isEditingContent() {
  return (
    new URLSearchParams(window.location.search).has("cms_token") ||
    document.cookie.split("; ").some((cookie) => cookie.startsWith("obelism_content_editing="))
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

const subscribeNoop = () => () => {};

export function useVisitorId(): string | null {
  return useSyncExternalStore(
    subscribeNoop,
    () => getNumbers()?.visitor()?.id ?? null,
    () => null,
  );
}
