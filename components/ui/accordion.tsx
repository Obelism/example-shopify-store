import { cn } from "cn";
import type { ComponentProps } from "react";

import { Icon } from "@/components/ui/icon";

import styles from "./accordion.module.css";

function AccordionItem({ className, ...props }: ComponentProps<"details">) {
  return <details className={cn(styles.item, className)} {...props} />;
}

function AccordionTrigger({ children, className, ...props }: ComponentProps<"summary">) {
  return (
    <summary className={cn(styles.trigger, className)} {...props}>
      {children}
      <Icon name="chevron-down" className={styles.icon} size={16} />
    </summary>
  );
}

function AccordionContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(styles.content, className)} {...props} />;
}

export { AccordionContent, AccordionItem, AccordionTrigger };
