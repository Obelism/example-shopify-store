import { cn } from "cn";
import type { ComponentProps } from "react";

import styles from "./textarea.module.css";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(styles.textarea, className)} {...props} />;
}

export { Textarea };
