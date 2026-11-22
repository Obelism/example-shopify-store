import { cn } from "cn";
import type { ComponentProps } from "react";

import styles from "./button.module.css";

const VARIANTS = {
  default: styles.default,
  destructive: styles.destructive,
  ghost: styles.ghost,
  link: styles.link,
  outline: styles.outline,
  secondary: styles.secondary,
};

const SIZES = {
  default: styles.sizeDefault,
  icon: styles.sizeIcon,
  "icon-lg": styles.sizeIconLg,
  "icon-sm": styles.sizeIconSm,
  lg: styles.sizeLg,
  sm: styles.sizeSm,
};

interface ButtonStyle {
  className?: string;
  size?: keyof typeof SIZES;
  variant?: keyof typeof VARIANTS;
}

/** Button styling for elements that are not buttons, such as links. */
function buttonClassName({ className, size = "default", variant = "default" }: ButtonStyle = {}) {
  return cn(styles.button, VARIANTS[variant], SIZES[size], className);
}

interface ButtonProps extends ComponentProps<"button">, ButtonStyle {}

function Button({ className, size, variant, ...props }: ButtonProps) {
  return <button className={buttonClassName({ className, size, variant })} {...props} />;
}

export { Button, buttonClassName };
