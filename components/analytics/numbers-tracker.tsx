"use client";

import { useEffect } from "react";

import { getNumbers } from "@/lib/numbers/client";

interface NumbersTrackerProps {
  release?: string;
}

export function NumbersTracker({ release }: NumbersTrackerProps) {
  useEffect(() => getNumbers()?.autoTrack({ outbound: true, webVitals: { release } }), [release]);
  return null;
}
