"use client";

import type { CartData } from "@shopify/hydrogen";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { useCart, useCartForm } from "@/lib/cart/client";

import styles from "./discount-form.module.css";

interface DiscountFormProps {
  cart: CartData;
}

export function DiscountForm({ cart }: DiscountFormProps) {
  const { formProps, register } = useCartForm();
  const discountErrors = useCart((state) => state.errors.discountCodes);
  const pendingDiscountCodes = useCart((state) => state.pending.discountCodes);
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const isPending = pendingDiscountCodes.size > 0;
  const error =
    localError ??
    Array.from(discountErrors.values()).flatMap((group) => [
      ...group.userErrors,
      ...group.warnings,
    ])[0]?.message ??
    null;
  return (
    <div className={styles.root}>
      <form
        {...formProps({
          afterSubmit: () => setCode(""),
          beforeSubmit: (event) => {
            const normalized = code.trim().toUpperCase();
            if (!normalized) {
              event.preventDefault();
              setLocalError("Enter a valid discount code");
              return;
            }
            if (cart.discountCodes.some((discount) => discount.code.toUpperCase() === normalized)) {
              event.preventDefault();
              return;
            }
            const input = event.currentTarget.elements.namedItem("discountCode");
            if (input instanceof HTMLInputElement) input.value = normalized;
            setLocalError(null);
          },
        })}
        className={styles.form}
      >
        <Input
          type="text"
          {...register("discountCode", { value: code })}
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            if (localError) setLocalError(null);
          }}
          placeholder="Discount code"
          aria-label="Discount code"
          aria-invalid={error ? true : undefined}
          disabled={isPending}
          autoComplete="off"
          spellCheck={false}
          className={styles.input}
        />
        <Button
          {...register("discount-apply")}
          type="submit"
          disabled={isPending || code.trim() === ""}
        >
          {isPending ? (
            <>
              <Icon name="loader-circle" className={styles.spinner} size={16} />
              <span className="sr-only">Apply</span>
            </>
          ) : (
            "Apply"
          )}
        </Button>
      </form>

      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}

      {cart.discountCodes.length > 0 ? (
        <ul className={styles.codes} aria-label="Discount">
          {cart.discountCodes.map((discount) => {
            const isCodePending = pendingDiscountCodes.has(discount.code);
            const isInvalid = !discount.applicable && !isCodePending;
            return (
              <li key={discount.code}>
                {/* Hydrogen reads FormData from the native submit event, before a React onClick could populate a shared input. */}
                <form
                  {...formProps({
                    beforeSubmit: () => {
                      setLocalError(null);
                    },
                  })}
                  className={styles.code}
                  data-invalid={isInvalid}
                >
                  <input type="hidden" {...register("discountCode", { value: discount.code })} />
                  <span className={styles.codeName}>{discount.code}</span>
                  {isInvalid ? <span className={styles.notApplicable}>Not applicable</span> : null}
                  <button
                    {...register("discount-remove")}
                    type="submit"
                    aria-label={`${"Remove discount"}: ${discount.code}`}
                    disabled={isPending}
                    className={styles.remove}
                  >
                    <Icon name="x" size={12} />
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
