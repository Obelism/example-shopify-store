import { cn } from "cn";
import type { ComponentProps } from "react";

import styles from "./prose.module.css";

type ProseSize = "base" | "sm";

/** Prose styling for elements other than an article, such as rendered rich text. */
function proseClassName({
  className,
  size = "base",
}: { className?: string; size?: ProseSize } = {}) {
  return cn(styles.prose, size === "sm" && styles.sm, className);
}

interface ProseProps extends ComponentProps<"article"> {
  size?: ProseSize;
}

function Prose({ className, size, ...props }: ProseProps) {
  return <article className={proseClassName({ className, size })} {...props} />;
}

export { Prose, proseClassName };
