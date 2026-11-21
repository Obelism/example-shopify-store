"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { recordExposure } from "@/lib/improve/client";

declare global {
  interface Window {
    __obelismImprove?: () => void;
  }
}

interface ImproveExposureProps {
  kind: "flag" | "test";
  slug: string;
}

export function ImproveExposure({ kind, slug }: ImproveExposureProps) {
  useEffect(() => {
    void recordExposure(kind, slug);
  }, [kind, slug]);
  return null;
}

// The head script runs once per document; cookies the edge set on a later request apply after client navigations too.
export function ImproveSync() {
  const pathname = usePathname();
  useEffect(() => window.__obelismImprove?.(), [pathname]);
  return null;
}
