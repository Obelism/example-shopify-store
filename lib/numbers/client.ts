"use client";

import {
  createNumbers,
  type NumbersClient,
  type TrackOptions,
  VISITOR_COOKIE,
} from "@obelism/numbers-sdk";
import { useSyncExternalStore } from "react";

import { getObelismConfig } from "@/lib/obelism";
import { isEditingContent } from "@/lib/obelism/client";

let numbers: NumbersClient | null | undefined;

export function getNumbers(): NumbersClient | null {
  if (typeof window === "undefined") return null;
  if (numbers !== undefined) return numbers;
  const config = getObelismConfig();
  numbers = config && !isEditingContent() ? createNumbers(config) : null;
  return numbers;
}

export function trackEvent(event: string, scope: string, options?: TrackOptions) {
  void getNumbers()?.track(event, scope, options);
}

const subscribeNoop = () => () => {};

function readVisitorCookie() {
  const prefix = `${VISITOR_COOKIE}=`;
  return (
    document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(prefix))
      ?.slice(prefix.length) ?? null
  );
}

export function useVisitorId(): string | null {
  return useSyncExternalStore(subscribeNoop, readVisitorCookie, () => null);
}
