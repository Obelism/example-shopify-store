import type { Environment } from "@obelism/numbers-sdk";

/** Hidden cart-line attribute carrying the visitor id into the order, so a paid order counts for the visitor who placed it. */
export const VISITOR_LINE_ATTRIBUTE = "_obelism_visitor_id";

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
