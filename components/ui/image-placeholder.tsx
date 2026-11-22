import { cn } from "cn";
import type { ComponentProps } from "react";

import { Icon } from "@/components/ui/icon";

interface ImagePlaceholderProps extends ComponentProps<"div"> {
  iconClassName?: string;
}

function ImagePlaceholder({ className, iconClassName, ...props }: ImagePlaceholderProps) {
  return (
    <div
      data-slot="image-placeholder"
      className={cn("flex items-center justify-center bg-muted", className)}
      {...props}
    >
      <Icon name="image" className={cn("h-auto w-1/4 max-w-24 text-background", iconClassName)} />
    </div>
  );
}

export { ImagePlaceholder };
