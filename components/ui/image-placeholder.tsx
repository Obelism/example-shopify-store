import { cn } from "cn";
import type { ComponentProps } from "react";

import { Icon } from "@/components/ui/icon";

import styles from "./image-placeholder.module.css";

interface ImagePlaceholderProps extends ComponentProps<"div"> {
  iconClassName?: string;
}

function ImagePlaceholder({ className, iconClassName, ...props }: ImagePlaceholderProps) {
  return (
    <div className={cn(styles.placeholder, className)} {...props}>
      <Icon name="image" className={cn(styles.icon, iconClassName)} />
    </div>
  );
}

export { ImagePlaceholder };
