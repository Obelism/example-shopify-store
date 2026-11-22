import { cn } from "cn";
import type { ComponentProps } from "react";

import styles from "./skeleton.module.css";

function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(styles.skeleton, className)} {...props} />;
}

export { Skeleton };
