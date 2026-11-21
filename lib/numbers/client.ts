"use client";

import { createNumbers, type NumbersClient, type TrackOptions } from "@obelism/numbers-sdk";
import { useEffect, useState } from "react";

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

export function useVisitorId(): string | null {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  useEffect(() => setVisitorId(getNumbers()?.visitor()?.id ?? null), []);
  return visitorId;
}
