import { cn } from "cn";
import type { ComponentProps } from "react";

import styles from "./discount-badge.module.css";

interface DiscountBadgeProps extends ComponentProps<"span"> {
  percent: number;
}

export function DiscountBadge({ percent, className, ...props }: DiscountBadgeProps) {
  return (
    <span className={cn(styles.badge, className)} {...props}>
      {percent}% OFF
    </span>
  );
}
