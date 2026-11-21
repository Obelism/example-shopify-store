import type { Block, ImproveBlock } from "@obelism/content";
import { isImproveBlock, pickImproveVariant } from "@obelism/content";

export const HOME_PATH = "home";

export function resolveBlocks<TBlock extends Block>(
  blocks: (TBlock | ImproveBlock<TBlock>)[] | null | undefined,
): TBlock[] {
  return (blocks ?? []).flatMap((block) =>
    isImproveBlock(block)
      ? pickImproveVariant(block as ImproveBlock<TBlock>, null)
      : [block as TBlock],
  );
}

/** Every block any visitor can see: each improve block's variants, not only its fallback. */
export function everyBlock<TBlock extends Block>(
  blocks: (TBlock | ImproveBlock<TBlock>)[] | null | undefined,
): TBlock[] {
  return (blocks ?? []).flatMap((block) =>
    isImproveBlock(block)
      ? Object.values((block as ImproveBlock<TBlock>).variants ?? {}).flat()
      : [block as TBlock],
  );
}

const ENVIRONMENTS = ["develop", "staging", "production"] as const;

export function parseContentEnvironment(value: string | undefined): (typeof ENVIRONMENTS)[number] {
  const environment = ENVIRONMENTS.find((candidate) => candidate === value);
  if (!environment)
    throw new Error(`CONTENT_ENVIRONMENT must be one of ${ENVIRONMENTS.join(", ")}.`);
  return environment;
}
