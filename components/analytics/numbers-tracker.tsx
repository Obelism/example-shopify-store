"use client";

import { useEffect } from "react";

import { getNumbers } from "@/lib/numbers/client";

export function NumbersTracker() {
  useEffect(() => getNumbers()?.autoTrack({ outbound: true }), []);
  return null;
}
