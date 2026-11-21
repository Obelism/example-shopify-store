"use client";

import { ImproveClientSDK } from "@obelism/improve-sdk/client";

import { getObelismConfig } from "@/lib/obelism";
import { isEditingContent } from "@/lib/obelism/client";

let ready: Promise<ImproveClientSDK | null> | undefined;
const recorded = new Set<string>();

function getImprove(): Promise<ImproveClientSDK | null> {
  ready ??= (async () => {
    const config = getObelismConfig();
    if (!config || isEditingContent()) return null;
    const improve = new ImproveClientSDK(config);
    await improve.fetchConfig();
    return improve;
  })().catch(() => null);
  return ready;
}

// The edge already decided the variant: reading it with the client SDK records the exposure without bucketing again, once per subject.
export async function recordExposure(kind: "flag" | "test", slug: string) {
  if (recorded.has(slug) || !document.documentElement.hasAttribute(`data-imp-${slug}`)) return;
  recorded.add(slug);
  const improve = await getImprove();
  if (kind === "flag") improve?.getFlagValue(slug);
  else improve?.getTestValue(slug);
}
