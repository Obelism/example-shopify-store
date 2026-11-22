"use client";

import { cn } from "cn";
import type { ComponentProps } from "react";

import { Dialog, DialogClose } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";

import styles from "./sheet.module.css";

interface SheetProps extends Omit<ComponentProps<typeof Dialog>, "backdrop"> {
  closeButton?: boolean;
  overlay?: boolean;
  side?: "bottom" | "left" | "right" | "top";
}

function Sheet({
  children,
  className,
  closeButton = true,
  overlay = true,
  side = "right",
  ...props
}: SheetProps) {
  return (
    <Dialog backdrop={overlay ? "dim" : "none"} className={styles.dialog} {...props}>
      <div className={cn(styles.sheet, className)} data-side={side}>
        {children}
        {closeButton ? (
          <DialogClose className={styles.close}>
            <Icon name="x" className={styles.closeIcon} />
            <span className="sr-only">Close</span>
          </DialogClose>
        ) : null}
      </div>
    </Dialog>
  );
}

export { Sheet };
