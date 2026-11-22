import { cn } from "cn";
import type { ComponentProps } from "react";

import styles from "./switch.module.css";

interface SwitchProps extends Omit<ComponentProps<"input">, "onChange" | "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

function Switch({ className, onCheckedChange, ...props }: SwitchProps) {
  return (
    <input
      className={cn(styles.switch, className)}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
      role="switch"
      type="checkbox"
      {...props}
    />
  );
}

export { Switch };
