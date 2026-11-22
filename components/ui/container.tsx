import { cn } from "cn";
import type { ComponentPropsWithRef } from "react";

import styles from "./container.module.css";

export function Container({ children, className, ...props }: ComponentPropsWithRef<"section">) {
  return (
    <section className={cn(styles.container, className)} {...props}>
      {children}
    </section>
  );
}
