import { cn } from "cn";
import type { ComponentProps } from "react";

import styles from "./label.module.css";

function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn(styles.label, className)} {...props} />;
}

export { Label };
