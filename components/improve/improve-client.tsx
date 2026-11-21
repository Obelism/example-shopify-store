"use client";

import { useEffect } from "react";

import { recordExposure } from "@/lib/improve/client";

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
