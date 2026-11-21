import { cn } from "cn";
import type { ComponentProps } from "react";

export function JustifiedGrid({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="justified-grid"
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-8 [--row-height:8rem] after:grow-[1000] after:content-[''] sm:[--row-height:12rem] md:gap-x-6 md:gap-y-12 lg:[--row-height:16rem]",
        className,
      )}
      {...props}
    >
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
      data-slot="justified-grid-item"
      className={cn("min-w-0", className)}
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
