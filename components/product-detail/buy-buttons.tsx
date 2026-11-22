"use client";

import { getShopPayButtonUrl } from "@shopify/hydrogen";
import { useEffect, useId, useState } from "react";

import { useCartDrawer } from "@/components/cart/context";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/money";
import type { Money } from "@/lib/money/types";
import { shopifyItemId, VISITOR_LINE_ATTRIBUTE } from "@/lib/numbers";
import { trackEvent, useVisitorId } from "@/lib/numbers/client";
import { getProductPurchaseOptions } from "@/lib/product";
import { useProductForm } from "@/lib/product/client";
import type { ProductFormVariant, SellingPlanAllocation } from "@/lib/product/types";

import { BuyWithShopLogo } from "./buy-with-shop-logo";

import styles from "./buy-buttons.module.css";

interface BuyButtonsProps {
  availableForSale?: boolean;
  buyWithShop?: boolean;
  fallbackVariant: ProductFormVariant | undefined;
  onAddToCart?: () => void;
  quantityPicker?: boolean;
}

export function BuyButtons({
  availableForSale = true,
  buyWithShop = true,
  fallbackVariant,
  onAddToCart,
  quantityPicker = true,
}: BuyButtonsProps) {
  const { formProps, pending, register, selectedVariant: storeVariant } = useProductForm();
  const selectedVariant = storeVariant ?? fallbackVariant;
  const isSelectionUnresolved = !storeVariant;
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [purchaseOption, setPurchaseOption] = useState("");
  const { plans, selectedPlan } = getProductPurchaseOptions(selectedVariant, purchaseOption);
  const missingRequiredPlan = Boolean(selectedVariant?.requiresSellingPlan && !selectedPlan);
  const { openOverlay } = useCartDrawer();
  const visitorId = useVisitorId();

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setIsBuyingNow(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);
  if (!selectedVariant) {
    return null;
  }
  const requiresBundleConfiguration = selectedVariant.requiresBundleConfiguration;
  const isOutOfStock = !selectedVariant.availableForSale;
  // Keep href while buying: removing it during the click cancels the anchor's navigation.
  const buyNowUrl = getShopPayButtonUrl({
    disabled: isSelectionUnresolved || isOutOfStock || requiresBundleConfiguration || pending,
    variants: [{ id: selectedVariant.id, quantity }],
  });
  const getButtonText = () => {
    if (pending) return "Adding to Cart...";
    if (isSelectionUnresolved) return "Add to Cart";
    if (requiresBundleConfiguration) return "Choose bundle items";
    if (missingRequiredPlan) return "Subscription unavailable";
    if (isOutOfStock) return "Out of Stock";
    return "Add to Cart";
  };
  return (
    <form
      {...formProps({
        beforeSubmit: (event) => {
          if (
            isSelectionUnresolved ||
            isOutOfStock ||
            requiresBundleConfiguration ||
            missingRequiredPlan ||
            pending
          ) {
            event.preventDefault();
            return;
          }
          trackEvent("add_to_cart", "product_form", {
            currency: selectedVariant.price.currencyCode,
            params: {
              item_handle: selectedVariant.product.handle,
              item_variant_id: shopifyItemId(selectedVariant.id),
              quantity,
            },
            value: Number(selectedVariant.price.amount) * quantity,
          });
          onAddToCart?.();
          openOverlay();
        },
      })}
      className={styles.form}
    >
      <PurchaseOptions
        disabled={pending || isSelectionUnresolved}
        onSelect={setPurchaseOption}
        plans={plans}
        price={selectedVariant.price}
        requiresSellingPlan={selectedVariant.requiresSellingPlan}
        selectedPlan={selectedPlan}
      />
      <input type="hidden" name="sellingPlanId" value={selectedPlan?.sellingPlan.id ?? ""} />
      <input type="hidden" {...register("merchandiseId", {})} />
      <input type="hidden" {...register("quantity", { value: quantity })} />
      {visitorId ? (
        <input
          type="hidden"
          {...register("attributeValue", { key: VISITOR_LINE_ATTRIBUTE, value: visitorId })}
        />
      ) : null}
      <div className={styles.row}>
        {quantityPicker ? (
          <div aria-label="Item quantity" className={styles.quantity} role="group">
            <button
              type="button"
              aria-label="Decrease quantity"
              className={styles.step}
              disabled={quantity === 1}
              onClick={() => setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))}
            >
              <Icon name="minus" size={16} className={styles.stepIcon} />
            </button>
            <span aria-live="polite" className={styles.count} role="status">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              className={styles.step}
              disabled={quantity === 99}
              onClick={() => setQuantity((currentQuantity) => Math.min(99, currentQuantity + 1))}
            >
              <Icon name="plus" size={16} className={styles.stepIcon} />
            </button>
          </div>
        ) : null}
        <Button
          {...register("addToCart", {})}
          data-numbers-id="pdp_add_to_cart"
          data-selection-unresolved={isSelectionUnresolved && !pending}
          disabled={
            isSelectionUnresolved ||
            isOutOfStock ||
            requiresBundleConfiguration ||
            missingRequiredPlan ||
            pending
          }
          className={styles.addToCart}
        >
          {getButtonText()}
        </Button>
      </div>
      {buyWithShop && !selectedPlan && !selectedVariant.requiresSellingPlan ? (
        <a
          aria-busy={isBuyingNow || undefined}
          aria-disabled={buyNowUrl ? undefined : true}
          aria-label="Buy with Shop Pay"
          className={styles.shopPay}
          data-available={availableForSale}
          data-selection-unresolved={isSelectionUnresolved}
          href={buyNowUrl ?? undefined}
          onClick={(event) => {
            if (!buyNowUrl || isBuyingNow) {
              event.preventDefault();
              return;
            }
            setIsBuyingNow(true);
          }}
          rel="nofollow"
        >
          {isBuyingNow ? (
            <Icon name="loader-circle" size={16} className={styles.spinner} />
          ) : (
            <>
              <span className="sr-only">Buy with</span>
              <BuyWithShopLogo aria-hidden="true" className={styles.shopLogo} />
            </>
          )}
        </a>
      ) : null}
    </form>
  );
}

interface PurchaseOptionsProps {
  disabled?: boolean;
  onSelect?: (id: string) => void;
  plans: SellingPlanAllocation[];
  price: Money;
  requiresSellingPlan: boolean;
  selectedPlan: SellingPlanAllocation | undefined;
}

export function PurchaseOptions({
  disabled = false,
  onSelect,
  plans,
  price,
  requiresSellingPlan,
  selectedPlan,
}: PurchaseOptionsProps) {
  const purchaseOptionId = useId();
  if (plans.length === 0) return null;

  return (
    <fieldset className={styles.options} disabled={disabled}>
      <legend className={styles.legend}>Purchase options</legend>
      {[
        ...(!requiresSellingPlan ? [{ id: "", name: "One-time purchase", price }] : []),
        ...plans.map((allocation) => ({
          id: allocation.sellingPlan.id,
          name: allocation.sellingPlan.name,
          price: allocation.price,
        })),
      ].map((option) => (
        <label key={option.id} className={styles.option}>
          <input
            type="radio"
            name={purchaseOptionId}
            value={option.id}
            checked={(selectedPlan?.sellingPlan.id ?? "") === option.id}
            onChange={onSelect ? () => onSelect(option.id) : undefined}
            readOnly={!onSelect}
            className={styles.radio}
          />
          <span className={styles.optionText}>
            <span>{option.name}</span>
            <span className={styles.optionPrice}>{formatPrice(option.price)}</span>
          </span>
        </label>
      ))}
      {selectedPlan ? (
        <p className={styles.recurring}>
          Recurring purchase.{" "}
          {selectedPlan.sellingPlan.description || "Subscription details are shown at checkout."}
        </p>
      ) : null}
    </fieldset>
  );
}
