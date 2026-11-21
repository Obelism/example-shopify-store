import { cn } from "cn";
import type { ComponentProps } from "react";

export function Masonry({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="masonry"
      className={cn("columns-2 gap-5 md:columns-3 md:gap-8 2xl:columns-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function MasonryItem({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="masonry-item"
      className={cn("mb-8 break-inside-avoid md:mb-12", className)}
      {...props}
    >
      {children}
    </div>
  );
}
