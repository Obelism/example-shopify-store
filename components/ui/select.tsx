import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

import { Icon } from "@/components/ui/icon";

import styles from "./select.module.css";

interface SelectProps extends ComponentProps<"select"> {
  /** Shown in place of the selected option. */
  label?: ReactNode;
}

function Select({ children, className, label, ...props }: SelectProps) {
  return (
    <span className={cn(styles.root, className)} data-labelled={label !== undefined}>
      {label !== undefined ? (
        <span aria-hidden="true" className={styles.label}>
          {label}
        </span>
      ) : null}
      <select className={styles.select} {...props}>
        {children}
      </select>
      <Icon name="chevron-down" className={styles.icon} />
    </span>
  );
}

export { Select };
