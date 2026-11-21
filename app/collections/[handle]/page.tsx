import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeriesStory } from "@/components/cms/cms-stories";
import { CollectionResults } from "@/components/collections/browse";
import {
  CollectionBrowseBoundary,
  SearchParamsProbe,
} from "@/components/collections/collection-page";
import {
  getCollection,
  getCollectionMetadata,
  getCollectionResults,
} from "@/lib/collections/server";
import { PLACEHOLDER_HANDLE } from "@/lib/static-params";

export async function generateMetadata({
  params,
}: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  if (handle === PLACEHOLDER_HANDLE) notFound();
  return getCollectionMetadata(handle);
}

export default function CollectionPage({
  params,
  searchParams,
}: PageProps<"/collections/[handle]">) {
  return (
    <CollectionBrowseBoundary>
      <DefaultCollectionResults params={params} searchParams={searchParams} />
    </CollectionBrowseBoundary>
  );
}

async function DefaultCollectionResults({
  params,
  searchParams,
}: PageProps<"/collections/[handle]">) {
  const { handle } = await params;
  const collection = await getCollection({ handle });
  return (
    <div className="grid gap-12">
      {collection?.id ? (
        <SeriesStory collection={{ handle, id: collection.id }} searchParams={searchParams} />
      ) : null}
      <CollectionResults results={getCollectionResults({ handle })} />
      <SearchParamsProbe searchParams={searchParams} />
    </div>
  );
}
