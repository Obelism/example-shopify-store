"use client";

import type { CartData } from "@shopify/hydrogen";

import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useCart, useCheckout } from "@/lib/cart/client";

import { DiscountForm } from "./discount-form";

import styles from "./summary.module.css";

interface CartSummaryProps {
  cart: CartData;
}

export function CartSummary({ cart }: CartSummaryProps) {
  return (
    <div className={styles.summary}>
      <div className={styles.details}>
        <DiscountForm cart={cart} />
        <CartTotal cart={cart} />
      </div>
      <CartCheckout label="Go to Checkout" />
    </div>
  );
}

interface CartTotalProps {
  cart: CartData;
}

export function CartTotal({ cart }: CartTotalProps) {
  const isCostPending = useCart((state) =>
    Boolean(state.loading || state.pending.cost || state.revalidating),
  );
  const { amount, currencyCode } = cart.cost.totalAmount;
  return (
    <div
      aria-busy={isCostPending || undefined}
      aria-label="Estimated total"
      className={styles.total}
      role="group"
    >
      <div className={styles.totalRow}>
        <span>Estimated total</span>
        {isCostPending || !currencyCode ? (
          <span className={styles.updating}>Updating…</span>
        ) : (
          <Price amount={amount} className={styles.price} currencyCode={currencyCode} />
        )}
      </div>
      <p className={styles.note}>Taxes and shipping calculated at checkout.</p>
    </div>
  );
}

interface CartCheckoutProps {
  label?: string;
}

export function CartCheckout({ label = "Checkout" }: CartCheckoutProps) {
  const {
    checkoutError,
    checkoutErrorId,
    handleCheckout,
    isCheckingOut,
    isCheckoutDisabled,
    isUpdatingCart,
  } = useCheckout();
  return (
    <div className={styles.checkout}>
      <Button
        aria-busy={isCheckingOut || isUpdatingCart || undefined}
        aria-describedby={checkoutError ? checkoutErrorId : undefined}
        className={styles.checkoutButton}
        data-numbers-id="cart_checkout"
        disabled={isCheckoutDisabled}
        onClick={handleCheckout}
        type="button"
      >
        {isCheckingOut || isUpdatingCart ? (
          <Icon name="loader-circle" className={styles.spinner} size={16} />
        ) : null}
        {isCheckingOut ? "Redirecting..." : isUpdatingCart ? "Updating cart..." : label}
      </Button>
      {checkoutError ? (
        <p className={styles.error} id={checkoutErrorId} role="alert">
          {checkoutError}
        </p>
      ) : null}
    </div>
  );
}
