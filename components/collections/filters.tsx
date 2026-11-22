import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { Facets } from "@/lib/filters/types";

import { CollectionFilterSidebar } from "./filters-client";

import styles from "./filters.module.css";

interface CollectionFiltersProps {
  facets: Facets | Promise<Facets>;
}

interface ResolvedCollectionFiltersProps {
  facets: Promise<Facets>;
}

export function CollectionFilters({ facets }: CollectionFiltersProps) {
  if (!(facets instanceof Promise)) {
    return <CollectionFilterSidebar filters={facets.filters} priceRange={facets.priceRange} />;
  }
  return (
    <Suspense fallback={<CollectionFiltersSkeleton />}>
      <ResolvedCollectionFilters facets={facets} />
    </Suspense>
  );
}

async function ResolvedCollectionFilters({ facets }: ResolvedCollectionFiltersProps) {
  const { filters, priceRange } = await facets;
  return <CollectionFilterSidebar filters={filters} priceRange={priceRange} />;
}

export function CollectionFiltersSkeleton() {
  return (
    <div aria-busy="true" className={styles.root}>
      {[0, 1, 2].map((section) => (
        <div key={section} className={styles.section}>
          <Skeleton className={styles.title} />
          {[0, 1, 2, 3].map((option) => (
            <Skeleton key={option} className={styles.option} />
          ))}
        </div>
      ))}
    </div>
  );
}
