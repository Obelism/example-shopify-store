import type { Environment } from "@obelism/numbers-sdk";

const ENVIRONMENTS: Environment[] = ["develop", "staging", "production"];

/** The Obelism space this site sends to, shared by Numbers and Improve. */
export interface ObelismConfig {
  environment: Environment;
  organizationId: string;
  spaceId: string;
}

export function getObelismConfig(): ObelismConfig | null {
  const organizationId = process.env.NEXT_PUBLIC_OBELISM_ORGANIZATION_ID;
  const spaceId = process.env.NEXT_PUBLIC_OBELISM_SPACE_ID;
  const environment = ENVIRONMENTS.find(
    (candidate) => candidate === process.env.NEXT_PUBLIC_OBELISM_ENVIRONMENT,
  );
  if (!organizationId || !spaceId || !environment) return null;
  return { environment, organizationId, spaceId };
}
