import type { Environment } from "@obelism/numbers-sdk";

/** Hidden cart-line attribute carrying the visitor id into the order, so a paid order counts for the visitor who placed it. */
export const VISITOR_LINE_ATTRIBUTE = "_obelism_visitor_id";

/** Shopify's numeric id from a gid, the form orders/paid uses, so item ids match across every event. */
export function shopifyItemId(gid: string): string {
  return gid.slice(gid.lastIndexOf("/") + 1).split("?")[0] ?? gid;
}

const ENVIRONMENTS: Environment[] = ["develop", "staging", "production"];

export interface NumbersConfig {
  environment: Environment;
  organizationId: string;
  spaceId: string;
}

export function getNumbersConfig(): NumbersConfig | null {
  const organizationId = process.env.NEXT_PUBLIC_OBELISM_ORGANIZATION_ID;
  const spaceId = process.env.NEXT_PUBLIC_OBELISM_SPACE_ID;
  const environment = ENVIRONMENTS.find(
    (candidate) => candidate === process.env.NEXT_PUBLIC_OBELISM_ENVIRONMENT,
  );
  if (!organizationId || !spaceId || !environment) return null;
  return { environment, organizationId, spaceId };
}
