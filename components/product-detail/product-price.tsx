import { cn } from "cn";
import type { ComponentProps } from "react";

import { DiscountBadge } from "@/components/product/discount-badge";
import { Price } from "@/components/product/price";
import { getDiscountPercent, isMarkedDown } from "@/lib/product";

import styles from "./product-price.module.css";

interface ProductPriceProps extends ComponentProps<"div"> {
  amount: string;
  currencyCode: string;
  compareAtAmount?: string;
}

export function ProductPrice({
  amount,
  currencyCode,
  compareAtAmount,
  className,
  ...props
}: ProductPriceProps) {
  const markedDown = isMarkedDown(amount, compareAtAmount);
  const discountPercent = getDiscountPercent(amount, compareAtAmount);
  return (
    <div className={cn(styles.root, className)} {...props}>
      <Price amount={amount} currencyCode={currencyCode} />
      {markedDown && (
        <Price amount={compareAtAmount} currencyCode={currencyCode} className={styles.compareAt} />
      )}
      {discountPercent !== null ? <DiscountBadge percent={discountPercent} /> : null}
    </div>
  );
}
