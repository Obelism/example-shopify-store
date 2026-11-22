"use client";

import { getSearchResultUrl } from "@shopify/hydrogen";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Price } from "@/components/product/price";
import { Dialog, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { useRecentlyViewedProducts } from "@/lib/product/client";
import { SEARCH_TERM_MAX_LENGTH } from "@/lib/search";
import { usePredictiveSearch } from "@/lib/search/client";
import type { PredictiveSearchProduct, SearchSuggestion } from "@/lib/search/types";

import styles from "./search-modal.module.css";

export function SearchModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
      >
        <Icon name="search" size={20} />
        <span className="sr-only">Search</span>
      </button>
      <Dialog backdrop="blur" initialFocus={inputRef} open={open} onOpenChange={setOpen}>
        <SearchDialogContent inputRef={inputRef} open={open} onClose={() => setOpen(false)} />
      </Dialog>
    </>
  );
}

interface SearchDialogContentProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  open: boolean;
}

function SearchDialogContent({ inputRef, onClose, open }: SearchDialogContentProps) {
  const router = useRouter();
  const { query, setQuery, results, isLoading, activeIndex, setActiveIndex, reset } =
    usePredictiveSearch();
  const recentlyViewed = useRecentlyViewedProducts(open);
  const hasQuery = query.trim().length > 0;
  // An empty query falls back to recently viewed, so both states drive one keyboard list.
  const suggestions = hasQuery ? (results?.queries ?? []) : [];
  const products = hasQuery ? (results?.products ?? []) : recentlyViewed;
  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      requestAnimationFrame(() => onClose());
    },
    [router, onClose],
  );
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value?.trim();
    if (!q) return;
    navigate(getSearchResultUrl({ baseUrl: "/search", term: q }));
  }

  const visibleItems = suggestions.length + products.length;
  function navigateToActiveItem() {
    if (activeIndex < 0) return;

    if (activeIndex < suggestions.length) {
      const suggestion = suggestions[activeIndex];
      if (inputRef.current) inputRef.current.value = suggestion.text;
      setQuery(suggestion.text);
      return;
    }

    const product = products[activeIndex - suggestions.length];
    if (product) {
      navigate(`/products/${product.handle}`);
    }
  }
  function handleKeyDown(e: ReactKeyboardEvent) {
    if (e.key === "ArrowDown" && visibleItems > 0) {
      e.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, visibleItems - 1));
      return;
    }
    if (e.key === "ArrowUp" && visibleItems > 0) {
      e.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, -1));
      return;
    }
    if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      navigateToActiveItem();
    }
  }
  const show = hasQuery ? results !== null || isLoading : products.length > 0;
  return (
    <div className={styles.root}>
      <DialogTitle className="sr-only">Search</DialogTitle>
      <div className={styles.panel}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Icon name="search" className={styles.searchIcon} size={16} />
          <input
            ref={inputRef}
            type="text"
            name="q"
            role="combobox"
            placeholder="Search products"
            maxLength={SEARCH_TERM_MAX_LENGTH}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-expanded={!!results}
            aria-controls="search-modal-results"
            aria-activedescendant={
              activeIndex >= 0 ? `search-modal-item-${activeIndex}` : undefined
            }
            autoComplete="off"
            className={styles.input}
          />
          {query.trim() && (
            <button
              type="button"
              onClick={() => {
                reset();
                if (inputRef.current) {
                  inputRef.current.value = "";
                  inputRef.current.focus();
                }
              }}
              className={styles.clear}
            >
              Clear
            </button>
          )}
          <DialogClose className={styles.close}>
            <Icon name="x" size={16} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </form>

        {show && (
          <div id="search-modal-results" role="listbox" className={styles.results}>
            {hasQuery && isLoading && !results && <LoadingSkeleton />}

            {(!hasQuery || results) && (
              <>
                {suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {suggestions.map((suggestion, i) => (
                      <SuggestionChip
                        key={suggestion.text}
                        suggestion={suggestion}
                        active={activeIndex === i}
                        onClick={() => {
                          setQuery(suggestion.text);
                          if (inputRef.current) inputRef.current.value = suggestion.text;
                        }}
                      />
                    ))}
                  </div>
                )}

                {products.length > 0 && (
                  <div>
                    <div className={styles.groupLabel}>
                      {hasQuery ? "Products" : "Recently viewed"}
                    </div>
                    {products.map((product, i) => (
                      <ProductResult
                        key={product.id}
                        product={product}
                        active={activeIndex === suggestions.length + i}
                        onNavigate={navigate}
                      />
                    ))}
                  </div>
                )}

                {hasQuery && visibleItems === 0 && (
                  <div className={styles.noResults}>{`No results for "${query}"`}</div>
                )}

                {hasQuery && visibleItems > 0 && (
                  <div className={styles.viewAllRow}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(getSearchResultUrl({ baseUrl: "/search", term: query.trim() }))
                      }
                      className={styles.viewAll}
                    >
                      View All
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionChip({
  suggestion,
  active,
  onClick,
}: {
  suggestion: SearchSuggestion;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      data-active={active}
      onClick={onClick}
      className={styles.chip}
    >
      {suggestion.text}
    </button>
  );
}

function ProductResult({
  product,
  active,
  onNavigate,
}: {
  product: PredictiveSearchProduct;
  active: boolean;
  onNavigate: (href: string) => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      data-active={active}
      onClick={() => onNavigate(`/products/${product.handle}`)}
      className={styles.product}
    >
      {product.featuredImage ? (
        <Image
          src={product.featuredImage.url}
          alt={product.featuredImage.altText}
          width={56}
          height={56}
          sizes="100vw"
          className={styles.productImage}
        />
      ) : (
        <div className={styles.productImage} />
      )}
      <div className={styles.productBody}>
        <div className={styles.productTitle}>{product.title}</div>
        <Price
          amount={product.price.amount}
          currencyCode={product.price.currencyCode}
          className={styles.productPrice}
        />
      </div>
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonChips} />
      <div className={styles.skeletonLabel} />
      {["skeleton-1", "skeleton-2", "skeleton-3"].map((key) => (
        <div key={key} className={styles.skeletonRow}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonText}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonPrice} />
          </div>
        </div>
      ))}
      <div className={styles.skeletonFooter}>
        <div className={styles.skeletonButton} />
      </div>
    </div>
  );
}
