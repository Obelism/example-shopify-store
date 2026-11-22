"use client";

import type { ValidProductSelectionResult } from "@shopify/hydrogen/react";
import Image from "next/image";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { BuyButtons } from "@/components/product-detail/buy-buttons";
import { ProductFormOptions, ProductFormPrice } from "@/components/product-detail/product-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogPanel, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { shopConfig } from "@/lib/config";
import { buildProductUrl } from "@/lib/product";
import { loadQuickShopProductAction } from "@/lib/product/action";
import { ProductProvider, useProduct } from "@/lib/product/client";
import type {
  ProductFormInput,
  ProductFormVariant,
  QuickShopProduct,
  SelectedOption,
} from "@/lib/product/types";

import styles from "./quick-shop.module.css";

type QuickShopStatus = "failed" | "idle" | "loading" | "unavailable";

interface QuickShopProps {
  handle: string;
  href: string;
  image: string | null;
  label: string;
  title: string;
}

export function QuickShop({ handle, href, image, label, title }: QuickShopProps) {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<QuickShopProduct | null>(null);
  const [status, setStatus] = useState<QuickShopStatus>("idle");
  const [imageUrl, setImageUrl] = useState(image);
  const [confirmedVariant, setConfirmedVariant] = useState<ProductFormVariant>();
  const [resolvedForm, setResolvedForm] = useState<ProductFormInput | null>(null);
  const [selectionStatus, setSelectionStatus] = useState<QuickShopStatus>("idle");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const selectionRequest = useRef<{ selectedOptions: SelectedOption[] } | null>(null);

  useEffect(
    () => () => {
      selectionRequest.current = null;
    },
    [],
  );

  async function resolveSelection(selectedOptions: SelectedOption[]) {
    const request = {
      selectedOptions: selectedOptions.map(({ name, value }) => ({ name, value })),
    };
    selectionRequest.current = request;
    setSelectionStatus("loading");
    try {
      const loaded = await loadQuickShopProductAction(handle, request.selectedOptions);
      if (selectionRequest.current !== request) return;
      if (!loaded) {
        setSelectionStatus("unavailable");
        return;
      }
      const variant = loaded.form.selectedOrFirstAvailableVariant ?? undefined;
      setResolvedForm(loaded.form);
      setConfirmedVariant(variant);
      setImageUrl(variant?.image?.url ?? loaded.image);
      setSelectionStatus("idle");
      selectionRequest.current = null;
    } catch {
      if (selectionRequest.current === request) setSelectionStatus("failed");
    }
  }

  function selectVariant(result: ValidProductSelectionResult<ProductFormInput>) {
    selectionRequest.current = null;
    setSelectionStatus("idle");
    if (!product) return;
    if (result.status === "resolved") {
      setConfirmedVariant(result.selectedVariant);
      setImageUrl(result.selectedVariant.image?.url ?? product.image);
    } else if (
      (resolvedForm ?? product.form).options.every((option) =>
        result.selectedOptions.some(({ name }) => name === option.name),
      )
    ) {
      void resolveSelection(result.selectedOptions);
    }
  }

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) {
      if (selectionStatus === "loading" && selectionRequest.current) {
        void resolveSelection(selectionRequest.current.selectedOptions);
      }
    } else if (selectionRequest.current) {
      selectionRequest.current = { selectedOptions: selectionRequest.current.selectedOptions };
    }
    setOpen(nextOpen);
  }

  function retrySelection() {
    if (selectionRequest.current) void resolveSelection(selectionRequest.current.selectedOptions);
  }

  async function load() {
    if (product || status === "loading") return;
    setStatus("loading");
    try {
      const loaded = await loadQuickShopProductAction(handle);
      setProduct(loaded);
      if (loaded) {
        setConfirmedVariant(loaded.form.selectedOrFirstAvailableVariant ?? undefined);
        setImageUrl(loaded.form.selectedOrFirstAvailableVariant?.image?.url ?? loaded.image);
      }
      setStatus(loaded ? "idle" : "unavailable");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${label}: ${title}`}
        className={styles.trigger}
        onClick={() => {
          void load();
          changeOpen(true);
        }}
        type="button"
      >
        <Icon name="plus" size={16} />
      </button>
      <Dialog
        initialFocus={closeButtonRef}
        onOpenChange={changeOpen}
        onCloseComplete={() => {
          selectionRequest.current = null;
          setSelectionStatus("idle");
          setResolvedForm(null);
          setConfirmedVariant(product?.form.selectedOrFirstAvailableVariant ?? undefined);
          setImageUrl(
            product
              ? (product.form.selectedOrFirstAvailableVariant?.image?.url ?? product.image)
              : image,
          );
        }}
        open={open}
      >
        {/* Hidden overflow is programmatically scrollable, which can displace the close button. */}
        <DialogPanel className={styles.panel} showCloseButton={false}>
          <div className={styles.scroller}>
            <QuickShopLayout image={imageUrl} title={product?.title ?? title}>
              {product ? (
                <ProductProvider onSelect={selectVariant} product={resolvedForm ?? product.form}>
                  <QuickShopDetails
                    confirmedVariant={confirmedVariant}
                    handle={handle}
                    onAddToCart={() => changeOpen(false)}
                    onNavigate={() => changeOpen(false)}
                    onRetrySelection={retrySelection}
                    product={product}
                    selectionStatus={selectionStatus}
                  />
                </ProductProvider>
              ) : (
                <QuickShopPurchasePanel
                  price={
                    status === "failed" || status === "unavailable" ? null : (
                      <Skeleton className={styles.priceSkeleton} />
                    )
                  }
                  title={title}
                >
                  {status === "failed" || status === "unavailable" ? (
                    <div className={styles.loadError}>
                      <p className={styles.status} role="status">
                        {status === "failed"
                          ? "We couldn’t load the purchase options. Try again or open the product page."
                          : "Quick shop is unavailable for this product."}
                      </p>
                      {status === "failed" ? (
                        <Button
                          className={styles.retry}
                          onClick={load}
                          type="button"
                          variant="outline"
                        >
                          Try again
                        </Button>
                      ) : null}
                    </div>
                  ) : (
                    <QuickShopSkeleton />
                  )}
                  <QuickShopDetailsLink href={href} onNavigate={() => changeOpen(false)} />
                </QuickShopPurchasePanel>
              )}
            </QuickShopLayout>
          </div>
          <DialogClose aria-label="Close quick shop" className={styles.close} ref={closeButtonRef}>
            <Icon name="x" size={20} />
          </DialogClose>
        </DialogPanel>
      </Dialog>
    </>
  );
}

interface QuickShopDetailsProps {
  confirmedVariant: ProductFormVariant | undefined;
  handle: string;
  onAddToCart: () => void;
  onNavigate: () => void;
  onRetrySelection: () => void;
  product: QuickShopProduct;
  selectionStatus: QuickShopStatus;
}

function QuickShopDetails({
  confirmedVariant,
  handle,
  onAddToCart,
  onNavigate,
  onRetrySelection,
  product,
  selectionStatus,
}: QuickShopDetailsProps) {
  const { options, selectedVariant } = useProduct();
  const isUnconfirmed =
    !selectedVariant || selectedVariant.id !== confirmedVariant?.id || selectionStatus !== "idle";
  const selectedOptions = options.flatMap((option) =>
    option.values
      .filter((value) => value.selected)
      .map((value) => ({ name: option.name, value: value.name })),
  );
  const href = buildProductUrl(selectedVariant?.product.handle ?? handle, selectedOptions);

  return (
    <QuickShopPurchasePanel
      price={
        <div
          aria-busy={isUnconfirmed || undefined}
          className={styles.price}
          data-unconfirmed={isUnconfirmed}
        >
          <ProductFormPrice fallbackVariant={confirmedVariant} />
        </div>
      }
      title={product.title}
    >
      {product.hasOptions ? <ProductFormOptions handle={handle} /> : null}
      {selectionStatus !== "idle" ? (
        <div className={styles.selectionStatus}>
          <p className={styles.status} role="status">
            {selectionStatus === "loading"
              ? "Loading selected options…"
              : selectionStatus === "failed"
                ? "We couldn’t load these options. Try again or choose another option."
                : "These options are unavailable. Choose another option or open the product page."}
          </p>
          {selectionStatus === "failed" ? (
            <Button onClick={onRetrySelection} type="button" variant="outline">
              Try again
            </Button>
          ) : null}
        </div>
      ) : null}
      <fieldset className={styles.buy} disabled={isUnconfirmed}>
        <div inert={isUnconfirmed || undefined}>
          <BuyButtons
            availableForSale={product.availableForSale}
            buyWithShop={shopConfig.pdp.buyWithShop.isEnabled}
            fallbackVariant={confirmedVariant}
            onAddToCart={onAddToCart}
            quantityPicker={shopConfig.pdp.quantityPicker.isEnabled}
          />
        </div>
      </fieldset>
      <QuickShopDetailsLink href={href} onNavigate={onNavigate} />
    </QuickShopPurchasePanel>
  );
}

interface QuickShopLayoutProps {
  children: ReactNode;
  image: string | null;
  title: string;
}

function QuickShopLayout({ children, image, title }: QuickShopLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.media}>
        {image ? (
          <Image alt={title} className={styles.image} fill sizes="100vw" src={image} />
        ) : (
          <ImagePlaceholder className={styles.placeholder} />
        )}
      </div>
      {children}
    </div>
  );
}

interface QuickShopPurchasePanelProps {
  children: ReactNode;
  price: ReactNode;
  title: string;
}

function QuickShopPurchasePanel({ children, price, title }: QuickShopPurchasePanelProps) {
  return (
    <div className={styles.purchase}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <DialogTitle className={styles.title}>{title}</DialogTitle>
          {price}
        </div>
      </div>
      <div className={styles.options}>{children}</div>
    </div>
  );
}

interface QuickShopDetailsLinkProps {
  href: string;
  onNavigate: () => void;
}

function QuickShopDetailsLink({ href, onNavigate }: QuickShopDetailsLinkProps) {
  return (
    <Link className={styles.detailsLink} href={href} onNavigate={onNavigate}>
      View full details
    </Link>
  );
}

function QuickShopSkeleton() {
  return (
    <div aria-busy="true" className={styles.skeleton} role="status">
      <span className="sr-only">Loading purchase options</span>
      <div aria-hidden="true" className={styles.skeleton}>
        <Skeleton className={styles.optionNameSkeleton} />
        <div className={styles.skeletonGroup}>
          <Skeleton className={styles.optionLabelSkeleton} />
          <div className={styles.skeletonRow}>
            {[0, 1, 2, 3, 4].map((value) => (
              <Skeleton className={styles.optionValueSkeleton} key={value} />
            ))}
          </div>
        </div>
        <div className={styles.skeletonGroup}>
          <div className={styles.skeletonRow}>
            {shopConfig.pdp.quantityPicker.isEnabled ? (
              <Skeleton className={styles.quantitySkeleton} />
            ) : null}
            <Skeleton className={styles.addToCartSkeleton} />
          </div>
          {shopConfig.pdp.buyWithShop.isEnabled ? (
            <Skeleton className={styles.buyNowSkeleton} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
