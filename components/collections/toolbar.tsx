import type { ReactNode } from "react";

import { ProductsGridSkeleton } from "@/components/product/products-grid";
import { Icon } from "@/components/ui/icon";
import { PRODUCTS_PER_PAGE } from "@/lib/collections";
import type { SortValue } from "@/lib/collections/types";

import { CollectionActiveFilterCountBadge } from "./collection-browse-provider";
import { FilterSheet } from "./filters-client";
import { CollectionsSortSelect } from "./sort-select";

import styles from "./toolbar.module.css";

interface BrowseToolbarProps {
  filters: ReactNode;
  resultCount?: ReactNode;
  sortExclude?: SortValue[];
}

export function BrowseToolbar({ filters, resultCount, sortExclude }: BrowseToolbarProps) {
  return (
    <ToolbarLayout
      filterSheet={
        <FilterSheet
          label="Filters"
          trigger={
            <>
              <Icon name="sliders-horizontal" size={16} />
              <span>Filters</span>
              <CollectionActiveFilterCountBadge />
            </>
          }
          triggerClassName={styles.filtersTrigger}
        >
          {filters}
        </FilterSheet>
      }
      resultCount={resultCount}
      sortSelect={<CollectionsSortSelect exclude={sortExclude} />}
    />
  );
}

interface BrowseFallbackProps {
  resultCount?: ReactNode;
}

export function BrowseFallback({ resultCount }: BrowseFallbackProps) {
  return (
    <>
      <ToolbarLayout
        filterSheet={
          <button type="button" className={styles.filtersTrigger}>
            <Icon name="sliders-horizontal" size={16} />
            <span>Filters</span>
          </button>
        }
        resultCount={resultCount}
        sortSelect={
          <div className={styles.sortFallback}>
            <span>Sort</span>
            <Icon name="chevron-down" className={styles.sortIcon} size={16} />
          </div>
        }
      />
      <ProductsGridSkeleton count={PRODUCTS_PER_PAGE} />
    </>
  );
}

interface ToolbarLayoutProps {
  filterSheet: ReactNode;
  resultCount?: ReactNode;
  sortSelect: ReactNode;
}

function ToolbarLayout({ filterSheet, resultCount, sortSelect }: ToolbarLayoutProps) {
  return (
    <div className={styles.toolbar}>
      {filterSheet}
      <div className={styles.end}>
        {resultCount !== undefined && <div className={styles.resultCount}>{resultCount}</div>}
        {sortSelect}
      </div>
    </div>
  );
}
