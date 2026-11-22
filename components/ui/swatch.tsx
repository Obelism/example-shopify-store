import { cn } from "cn";
import Image from "next/image";
import type { ComponentProps } from "react";

import styles from "./swatch.module.css";

interface SwatchProps extends ComponentProps<"span"> {
  color?: string;
  image?: string;
  label: string;
  selected?: boolean;
}

export function Swatch({
  color,
  image,
  label,
  selected = false,
  className,
  ...props
}: SwatchProps) {
  return (
    <span
      data-selected={selected}
      title={label}
      className={cn(styles.swatch, className)}
      {...props}
    >
      {image ? (
        <Image
          src={image}
          width={200}
          height={200}
          sizes="100vw"
          alt={label}
          className={styles.fill}
        />
      ) : (
        <span className={styles.fill} style={color ? { backgroundColor: color } : undefined} />
      )}
    </span>
  );
}
