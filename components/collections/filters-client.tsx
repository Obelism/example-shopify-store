"use client";

import {
  type CollectionState,
  filterEquals,
  getFilterRemovalUrl,
  isFilterInputActive,
  serializeCollectionParams,
} from "@shopify/hydrogen";
import { useCollection, useCollectionActions } from "@shopify/hydrogen/react";
import { type KeyboardEvent, type MouseEventHandler, type ReactNode, useState } from "react";

import { DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { Sheet } from "@/components/ui/sheet";
import { Swatch } from "@/components/ui/swatch";
import { parseFilterInput } from "@/lib/collections";
import { shopConfig } from "@/lib/config";
import { getActiveFilterBadges } from "@/lib/filters";
import type { Filter, PriceRange } from "@/lib/filters/types";
import { formatCurrencySymbol, formatPrice } from "@/lib/money";

import { usePublishedFacets } from "./collection-browse-provider";

import styles from "./filters-client.module.css";

interface FilterSheetProps {
  children: ReactNode;
  label: string;
  trigger: ReactNode;
  triggerClassName?: string;
}

export function FilterSheet({ children, label, trigger, triggerClassName }: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className={triggerClassName}
        onClick={() => setOpen(true)}
        type="button"
      >
        {trigger}
      </button>
      <Sheet className={styles.sheet} onOpenChange={setOpen} open={open} side="left">
        <div className={styles.sheetHeader}>
          <DialogTitle className={styles.sheetTitle}>{label}</DialogTitle>
        </div>
        {children}
      </Sheet>
    </>
  );
}

interface PublishedCollectionFiltersProps {
  fallback: ReactNode;
}

// The collection layout's filter sheet shows the facets of the last results a page rendered, so it keeps them while the next view loads.
export function PublishedCollectionFilters({ fallback }: PublishedCollectionFiltersProps) {
  const facets = usePublishedFacets();
  if (!facets) return fallback;
  return <CollectionFilterSidebar filters={facets.filters} priceRange={facets.priceRange} />;
}

interface CollectionFilterSidebarProps {
  filters: Filter[];
  priceRange?: PriceRange;
}

export function CollectionFilterSidebar({ filters, priceRange }: CollectionFilterSidebarProps) {
  const state = useCollection();
  const actions = useCollectionActions();
  const priceFilter = state.filters.find((filter) => filter.price)?.price;
  const priceMin = priceFilter?.min ?? null;
  const priceMax = priceFilter?.max ?? null;
  const priceKey = `${priceMin ?? ""}:${priceMax ?? ""}`;
  const [priceInputs, setPriceInputs] = useState({
    key: priceKey,
    max: priceMax?.toString() ?? "",
    min: priceMin?.toString() ?? "",
  });
  // Applied price changed (URL/back-forward), so discard unsubmitted input.
  if (priceInputs.key !== priceKey) {
    setPriceInputs({
      key: priceKey,
      max: priceMax?.toString() ?? "",
      min: priceMin?.toString() ?? "",
    });
  }
  const minInput = priceInputs.key === priceKey ? priceInputs.min : (priceMin?.toString() ?? "");
  const maxInput = priceInputs.key === priceKey ? priceInputs.max : (priceMax?.toString() ?? "");
  const currentParams = serializeCollectionParams(state);
  const isPending = state.status === "loading";
  const activeBadges = getActiveFilterBadges(filters, state.filters);
  const applyPrice = (min: number | null, max: number | null) => {
    const next = state.filters.filter((filter) => !filter.price);
    if (min !== null || max !== null) {
      next.push({
        price: {
          ...(max !== null ? { max } : {}),
          ...(min !== null ? { min } : {}),
        },
      });
    }
    actions.setFilters(next);
  };
  return (
    <div className={styles.sidebar}>
      {activeBadges.length > 0 || priceFilter ? (
        <div className={styles.badges}>
          {activeBadges.map((badge) => {
            const filter = parseFilterInput(
              findFilterInput(filters, badge.paramKey, badge.value) ?? "",
            );
            return (
              <FilterBadge
                key={`${badge.paramKey}-${badge.value}`}
                href={filter ? getFilterRemovalUrl(currentParams, filter) : undefined}
                label={badge.label}
                onRemove={() => filter && actions.toggleFilter(filter)}
              />
            );
          })}
          {priceFilter ? (
            <FilterBadge
              href={getFilterRemovalUrl(currentParams, { price: priceFilter })}
              label={formatPriceRangeLabel(priceMin, priceMax, priceRange?.currencyCode)}
              onRemove={() => applyPrice(null, null)}
            />
          ) : null}
        </div>
      ) : null}

      {priceRange ? (
        <FilterSection title="Price">
          <div className={styles.priceRow}>
            <PriceInput
              currencyCode={priceRange.currencyCode}
              label="Minimum price"
              onChange={(min) => setPriceInputs((prev) => ({ ...prev, min }))}
              placeholder="From"
              value={minInput}
            />
            <span className={styles.priceSeparator}>–</span>
            <PriceInput
              currencyCode={priceRange.currencyCode}
              label="Maximum price"
              onChange={(max) => setPriceInputs((prev) => ({ ...prev, max }))}
              placeholder="To"
              value={maxInput}
            />
            <button
              aria-label="Apply price"
              className={styles.applyPrice}
              onClick={() => applyPrice(parsePriceValue(minInput), parsePriceValue(maxInput))}
              type="button"
            >
              <Icon name="check" size={16} />
            </button>
          </div>
        </FilterSection>
      ) : null}

      {filters.map((filter) =>
        filter.values.length === 0 ? null : (
          <FilterSection key={filter.id} title={filter.label}>
            {filter.presentation === "swatch" ? (
              <div className={styles.swatches}>
                {filter.values.map((value) => {
                  const isSelected = isFilterInputActive(state.filters, value.input);
                  return (
                    <Link
                      key={value.id}
                      aria-label={`Filter by ${filter.label}: ${value.label}`}
                      aria-pressed={isSelected}
                      className={styles.swatchLink}
                      href={buildToggleHref(state, value.input)}
                      onKeyDown={pressOnSpace}
                      role="button"
                      scroll={false}
                      onClick={(event) => {
                        event.preventDefault();
                        actions.toggleFilterInput(value.input);
                      }}
                    >
                      <Swatch
                        color={value.swatch?.color}
                        image={value.swatch?.image}
                        label={value.label}
                        selected={isSelected}
                      />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className={styles.options}>
                {filter.values.map((value) => {
                  const isSelected = isFilterInputActive(state.filters, value.input);
                  return (
                    <FilterOption
                      key={value.id}
                      count={value.count}
                      href={buildToggleHref(state, value.input)}
                      label={value.label}
                      pending={isPending && isSelected}
                      selected={isSelected}
                      onClick={(event) => {
                        event.preventDefault();
                        actions.toggleFilterInput(value.input);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </FilterSection>
        ),
      )}
    </div>
  );
}

interface FilterSectionProps {
  children: ReactNode;
  title: string;
}

function FilterSection({ children, title }: FilterSectionProps) {
  return (
    <div className={styles.section}>
      <span className={styles.sectionTitle}>{title}</span>
      {children}
    </div>
  );
}

interface FilterBadgeProps {
  href?: string;
  label: string;
  onRemove: () => void;
}

function FilterBadge({ href, label, onRemove }: FilterBadgeProps) {
  const content = (
    <>
      {label}
      <Icon name="x" size={12} />
    </>
  );
  const removeLabel = `Remove filter: ${label}`;
  if (!href) {
    return (
      <button aria-label={removeLabel} className={styles.badge} onClick={onRemove} type="button">
        {content}
      </button>
    );
  }
  return (
    <Link
      aria-label={removeLabel}
      className={styles.badge}
      href={href}
      scroll={false}
      onClick={(event) => {
        event.preventDefault();
        onRemove();
      }}
    >
      {content}
    </Link>
  );
}

interface FilterOptionProps {
  count?: number;
  href: string;
  label: string;
  onClick: MouseEventHandler<HTMLAnchorElement>;
  pending: boolean;
  selected: boolean;
}

function FilterOption({ count, href, label, onClick, pending, selected }: FilterOptionProps) {
  return (
    <Link
      aria-pressed={selected}
      href={href}
      onKeyDown={pressOnSpace}
      role="button"
      data-selected={selected}
      className={styles.option}
      onClick={onClick}
    >
      <span>
        {label}
        {count !== undefined && <span className={styles.optionCount}> ({count})</span>}
      </span>
      {pending || selected ? (
        <span className={styles.optionIcon}>
          {pending ? (
            <Icon name="loader-circle" className={styles.optionSpinner} size={14} />
          ) : (
            <Icon name="check" className={styles.optionCheck} size={14} />
          )}
        </span>
      ) : null}
    </Link>
  );
}

interface PriceInputProps {
  currencyCode?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

function PriceInput({ currencyCode, label, onChange, placeholder, value }: PriceInputProps) {
  return (
    <div className={styles.priceField}>
      <span className={styles.currency}>
        {currencyCode ? formatCurrencySymbol(currencyCode) : null}
      </span>
      <Input
        aria-label={label}
        type="number"
        step="0.01"
        min="0"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={styles.priceInput}
      />
    </div>
  );
}

// Filter links toggle in place, so they take the button role that `aria-pressed` needs, and buttons answer Space.
function pressOnSpace(event: KeyboardEvent<HTMLAnchorElement>) {
  if (event.key !== " ") return;
  event.preventDefault();
  event.currentTarget.click();
}

function buildToggleHref(
  state: Pick<CollectionState, "filters" | "reverse" | "sortKey">,
  input: string,
): string {
  const filter = parseFilterInput(input);
  if (!filter) return "?";
  const params = serializeCollectionParams(state);
  if (state.filters.some((current) => filterEquals(current, filter))) {
    return getFilterRemovalUrl(params, filter);
  }
  const next = serializeCollectionParams({ ...state, filters: [...state.filters, filter] });
  const query = next.toString();
  return query ? `?${query}` : "?";
}

function findFilterInput(filters: Filter[], key: string, value: string): string | undefined {
  return filters
    .find((filter) => filter.paramKey === key)
    ?.values.find((item) => item.value === value)?.input;
}

function formatPriceRangeLabel(
  min: number | null,
  max: number | null,
  currencyCode: string | undefined,
): string {
  const format = (value: number) =>
    currencyCode
      ? formatPrice({ amount: String(value), currencyCode })
      : new Intl.NumberFormat(shopConfig.localization.locale).format(value);
  if (min !== null && max !== null) return `${format(min)} - ${format(max)}`;
  if (min !== null) return `From ${format(min)}`;
  return `Up to ${format(max ?? 0)}`;
}

function parsePriceValue(value: string): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) || parsed < 0 ? null : parsed;
}
