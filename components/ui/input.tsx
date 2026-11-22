import { cn } from "cn";
import type { ComponentProps } from "react";

import styles from "./input.module.css";

function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(styles.input, className)} {...props} />;
}

export { Input };
