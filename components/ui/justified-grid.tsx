import { cn } from "cn";
import type { ComponentProps } from "react";

import styles from "./justified-grid.module.css";

export function JustifiedGrid({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn(styles.grid, className)} {...props}>
      {children}
    </div>
  );
}

interface JustifiedGridItemProps extends ComponentProps<"div"> {
  /** Width divided by height; rows share their width in this proportion so every item keeps its shape. */
  aspectRatio?: number;
}

export function JustifiedGridItem({
  aspectRatio = 1,
  children,
  className,
  style,
  ...props
}: JustifiedGridItemProps) {
  return (
    <div
      className={cn(styles.item, className)}
      style={{
        flexBasis: `calc(var(--row-height) * ${aspectRatio})`,
        flexGrow: aspectRatio,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
