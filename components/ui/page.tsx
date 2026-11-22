import { cn } from "cn";
import type { ComponentProps } from "react";

import styles from "./page.module.css";

export function Page({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn(styles.page, className)} {...props}>
      {children}
    </div>
  );
}
