import { type ReactNode, Suspense } from "react";

import { CollectionViewedTracker } from "@/components/analytics/trackers";
import { BrowseResultsFallback } from "@/components/collections/browse";
import { CollectionBrowseFrame } from "@/components/collections/collection-browse-provider";
import { BreadcrumbSchema } from "@/components/schema/breadcrumb-schema";
import { CollectionSchema } from "@/components/schema/collection-schema";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { Skeleton } from "@/components/ui/skeleton";
import type { Collection } from "@/lib/collections/types";

interface CollectionLayoutProps {
  children: ReactNode;
  collection: Collection;
  handle: string;
}

// The static and refine routes share this layout, so the header, toolbar, and filter sheet stay mounted when a filter switches between them.
export function CollectionLayout({ children, collection, handle }: CollectionLayoutProps) {
  return (
    <>
      {collection.id ? (
        <CollectionViewedTracker collection={{ handle: collection.handle, id: collection.id }} />
      ) : null}
      <Page className="pt-5 md:pt-10">
        <Container>
          <Sections className="gap-10">
            <CollectionHeader collection={collection} handle={handle} homeLabel="Home" />
            <CollectionBrowseFrame handle={handle} path={`/collections/${handle}`}>
              {children}
            </CollectionBrowseFrame>
          </Sections>
        </Container>
      </Page>
    </>
  );
}

interface CollectionBrowseBoundaryProps {
  children: ReactNode;
}

// Wraps every collection page's results; the first filter from the default view shows this grid skeleton while the refine route loads, and later changes keep the current grid.
export function CollectionBrowseBoundary({ children }: CollectionBrowseBoundaryProps) {
  return <Suspense fallback={<BrowseResultsFallback />}>{children}</Suspense>;
}

// The static default view otherwise renders from the client cache for any search string; reading search params makes the router ask the server, which proxy.ts rewrites to the refine route.
export function SearchParamsProbe({ searchParams }: { searchParams: Promise<unknown> }) {
  return (
    <Suspense fallback={null}>
      <SearchParamsRead searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchParamsRead({ searchParams }: { searchParams: Promise<unknown> }) {
  await searchParams;
  return null;
}

export function CollectionDetailSkeleton() {
  return (
    <Page aria-busy="true" className="pt-5 md:pt-10">
      <Container>
        <Sections className="gap-10">
          <div className="grid max-w-2xl gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-64 md:h-12 md:w-80" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <BrowseResultsFallback />
        </Sections>
      </Container>
    </Page>
  );
}

function CollectionHeader({
  collection,
  handle,
  homeLabel,
}: {
  collection: Collection;
  handle: string;
  homeLabel: string;
}) {
  const { title, description, updatedAt } = collection;

  const breadcrumbItems = [
    { name: homeLabel, path: "/" },
    { name: title, path: `/collections/${handle}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <CollectionSchema collection={{ handle, title, description, updatedAt }} />
      <div className="grid max-w-2xl gap-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Series</p>
        <h1 className="font-serif text-4xl tracking-tight md:text-5xl">
          <Link href={`/collections/${handle}`}>{title}</Link>
        </h1>
        {description && <p className="leading-7 text-muted-foreground">{description}</p>}
      </div>
    </>
  );
}
