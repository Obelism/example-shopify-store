import { cn } from "cn";
import type { ComponentProps } from "react";

import { formatPrice } from "@/lib/money";

import styles from "./price.module.css";

interface PriceProps extends ComponentProps<"span"> {
  amount: string;
  currencyCode: string;
}

export function Price({ amount, currencyCode, className, ...props }: PriceProps) {
  return (
    <span className={cn(styles.price, className)} {...props}>
      {formatPrice({ amount, currencyCode })}
    </span>
  );
}
