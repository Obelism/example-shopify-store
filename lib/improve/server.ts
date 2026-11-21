import { ImproveServerSDK } from "@obelism/improve-sdk/server";
import type { ImproveConfiguration } from "@obelism/improve-sdk/types";
import { cacheLife, cacheTag } from "next/cache";

import { getObelismConfig } from "@/lib/obelism";

export async function getImproveConfig(): Promise<ImproveConfiguration | null> {
  "use cache: remote";
  cacheLife("minutes");
  cacheTag("improve");
  const config = getObelismConfig();
  if (!config) return null;
  const improve = new ImproveServerSDK({ ...config, token: process.env.OBELISM_API_TOKEN ?? "" });
  // An unreachable Improve shows every placement's default rather than failing the root layout.
  return (await improve.fetchConfig().catch(() => undefined)) ?? null;
}
