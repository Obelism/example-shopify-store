import { resolveBlocks } from "@/lib/cms";
import type { CmsBodyEntry } from "@/lib/cms/types";
import { getCollectionsListing } from "@/lib/collections/server";
import { getProductsByIds } from "@/lib/product/server";

import { CmsBodyClient } from "./cms-body-client";

interface CmsBodyProps {
  className?: string;
  entry: CmsBodyEntry;
  introHeading?: "h1" | "h2";
}

// The client renderer re-renders on live edits and can't read Shopify, so the cards featured blocks need come from here.
export async function CmsBody({ className, entry, introHeading = "h2" }: CmsBodyProps) {
  const productIds = new Set<string>();
  const collectionIds = new Set<string>();
  for (const block of resolveBlocks(entry.fields.body)) {
    if (block._type === "featuredPrint" && block.product) productIds.add(block.product.id);
    if (block._type === "featuredSeries") {
      for (const collection of block.collections ?? []) collectionIds.add(collection.id);
    }
  }
  const [products, collections] = await Promise.all([
    productIds.size ? getProductsByIds([...productIds]) : [],
    collectionIds.size ? getCollectionsListing({}) : [],
  ]);
  return (
    <CmsBodyClient
      className={className}
      collections={collections.filter(({ id }) => id && collectionIds.has(id))}
      entry={entry}
      introHeading={introHeading}
      products={products}
    />
  );
}
