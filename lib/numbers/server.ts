import { DEFAULT_ENDPOINT, detectDevice } from "@obelism/numbers-sdk";

import { getNumbersConfig } from "./index";

interface ServerEvent {
  country?: string;
  currency?: string;
  event: string;
  params?: Record<string, unknown>;
  path?: string;
  scope: string;
  userAgent?: string;
  value?: number;
  visitorId: string;
}

// Server events carry the environment's API token and no Origin header; a browser could not send them.
export async function sendServerEvent({ userAgent, visitorId, ...event }: ServerEvent) {
  const config = getNumbersConfig();
  const token = process.env.NUMBERS_API_TOKEN;
  if (!config || !token) return false;
  try {
    const response = await fetch(DEFAULT_ENDPOINT, {
      body: JSON.stringify({
        ...config,
        ...detectDevice(userAgent ?? ""),
        ...event,
        screen: "",
        type: "event",
        visitor: "recurring",
        visitorId,
      }),
      headers: { "Content-Type": "application/json", token },
      method: "POST",
    });
    if (!response.ok) console.error(`Numbers refused ${event.event}: ${response.status}`);
    return response.ok;
  } catch {
    console.error(`Numbers unreachable for ${event.event}`);
    return false;
  }
}
