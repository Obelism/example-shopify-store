import { cn } from "cn";
import type { ComponentProps } from "react";

import styles from "./badge.module.css";

interface BadgeProps extends ComponentProps<"span"> {
  variant?: "default" | "destructive" | "outline" | "secondary";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn(styles.badge, styles[variant], className)} {...props} />;
}

export { Badge };
