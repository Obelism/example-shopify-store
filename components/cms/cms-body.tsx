import type { Block, Entry, ImproveBlock } from "@obelism/content";

import { getCollectionsListing } from "@/lib/collections/server";
import { getProductsByIds } from "@/lib/product/server";

import { type CmsBodyBlock, CmsBodyClient } from "./cms-body-client";

export type CmsBodyEntry = Entry<{ body: (CmsBodyBlock | ImproveBlock<CmsBodyBlock>)[] | null }>;

interface CmsBodyProps {
  className?: string;
  entry: CmsBodyEntry;
}

// Featured blocks name Shopify items by id; their cards are read here so the client renderer gets plain data.
export async function CmsBody({ className, entry }: CmsBodyProps) {
  const productIds = new Set<string>();
  const collectionHandles = new Set<string>();
  collectShopifyItems(entry.fields.body, productIds, collectionHandles);
  const [products, collections] = await Promise.all([
    productIds.size ? getProductsByIds([...productIds]) : [],
    collectionHandles.size ? getCollectionsListing({}) : [],
  ]);
  return (
    <CmsBodyClient
      className={className}
      collections={collections.filter(({ handle }) => collectionHandles.has(handle))}
      entry={entry}
      products={products}
    />
  );
}

function collectShopifyItems(value: unknown, products: Set<string>, collections: Set<string>) {
  if (Array.isArray(value)) {
    for (const item of value) collectShopifyItems(item, products, collections);
    return;
  }
  if (!value || typeof value !== "object") return;
  const block = value as Block & Record<string, unknown>;
  if (block._type === "featuredPrint") {
    const product = block.product as { id?: string } | null;
    if (product?.id) products.add(product.id);
  }
  if (block._type === "featuredSeries") {
    for (const item of (block.collections as { handle?: string }[] | null) ?? []) {
      if (item.handle) collections.add(item.handle);
    }
  }
  for (const child of Object.values(block)) collectShopifyItems(child, products, collections);
}
