"use client";

import { getSortByValue } from "@shopify/hydrogen";
import { useCollection, useCollectionActions } from "@shopify/hydrogen/react";

import { Select } from "@/components/ui/select";
import { SORT_VALUES } from "@/lib/collections";
import type { SortValue } from "@/lib/collections/types";

const SORT_LABELS: Record<SortValue, string> = {
  "best-selling": "Best Selling",
  "created-ascending": "Date: Old to New",
  "created-descending": "Date: New to Old",
  manual: "Best Matches",
  "price-ascending": "Price: Low to High",
  "price-descending": "Price: High to Low",
  "title-ascending": "Name: A-Z",
  "title-descending": "Name: Z-A",
};

export function CollectionsSortSelect({ exclude = [] }: { exclude?: SortValue[] } = {}) {
  const { reverse, sortKey, status } = useCollection();
  const { setSortByValue } = useCollectionActions();
  const options = SORT_VALUES.filter((value) => !exclude.includes(value));
  return (
    <Select
      aria-label="Sort"
      className="border-0 shadow-none bg-transparent px-0"
      disabled={status === "loading"}
      label="Sort"
      onChange={(event) => setSortByValue(event.target.value)}
      value={sortKey ? getSortByValue(sortKey, reverse) : "manual"}
    >
      {options.map((value) => (
        <option key={value} value={value}>
          {SORT_LABELS[value]}
        </option>
      ))}
    </Select>
  );
}
