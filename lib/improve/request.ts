import crypto from "node:crypto";

import { ImproveServerSDK } from "@obelism/improve-sdk/server";
import type { ImproveConfiguration } from "@obelism/improve-sdk/types";
import type { NextRequest, NextResponse } from "next/server";

import { getObelismConfig } from "@/lib/obelism";

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview/i;
const CONFIG_TTL_MS = 30_000;

let configCache: { config: ImproveConfiguration; fetchedAt: number } | null = null;

async function loadConfig(): Promise<ImproveConfiguration | null> {
  if (configCache && Date.now() - configCache.fetchedAt < CONFIG_TTL_MS) return configCache.config;
  const config = getObelismConfig();
  if (!config) return null;
  const improve = new ImproveServerSDK({
    ...config,
    configRetries: 0,
    fetchTimeout: 1500,
    token: process.env.OBELISM_API_TOKEN ?? "",
  });
  const datafile = await improve.fetchConfig().catch(() => undefined);
  if (datafile) configCache = { config: datafile, fetchedAt: Date.now() };
  return datafile ?? configCache?.config ?? null;
}

function isPageRequest(request: NextRequest) {
  return (
    request.method === "GET" &&
    !request.headers.has("rsc") &&
    (request.headers.get("accept") ?? "").includes("text/html") &&
    !BOT.test(request.headers.get("user-agent") ?? "")
  );
}

// Prerendered pages are the same for everyone, so the visitor's variants are decided here and travel as cookies; bots keep the defaults.
export async function seedImproveCookies(request: NextRequest, response: NextResponse) {
  if (!isPageRequest(request)) return;
  const datafile = await loadConfig();
  const config = getObelismConfig();
  if (!datafile || !config) return;
  const improve = new ImproveServerSDK({ ...config, config: datafile });
  const { cookies } = improve.seedTestCookies({
    cookieHeader: request.headers.get("cookie"),
    geo: { country: request.headers.get("x-vercel-ip-country") ?? undefined },
    secure: request.nextUrl.protocol === "https:",
    userAgent: request.headers.get("user-agent") ?? "",
  });
  for (const { header } of cookies) response.headers.append("Set-Cookie", header);
}

const WEBHOOK_TOLERANCE_SECONDS = 300;

/** Standard Webhooks: `v1,` and the base64 HMAC-SHA256 of `{id}.{timestamp}.{body}`, keyed with the secret after `whsec_`. */
export function verifyImproveWebhook(headers: Headers, body: string, secret: string): boolean {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatures = headers.get("webhook-signature");
  if (!id || !timestamp || !signatures) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > WEBHOOK_TOLERANCE_SECONDS) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto.createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();
  return signatures.split(" ").some((entry) => {
    const [version, signature] = entry.split(",");
    if (version !== "v1" || !signature) return false;
    const received = Buffer.from(signature, "base64");
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
  });
}
