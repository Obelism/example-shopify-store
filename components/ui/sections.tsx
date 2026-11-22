import { cn } from "cn";
import type { ComponentPropsWithRef } from "react";

import styles from "./sections.module.css";

export function Sections({ children, className, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div className={cn(styles.sections, className)} {...props}>
      {children}
    </div>
  );
}
