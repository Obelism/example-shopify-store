"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Sheet } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart/client";

import { useCartDrawer } from "./context";
import { DemoStoreNotice } from "./demo-store-notice";
import { CartLineItems } from "./line-item";
import { CartSummary } from "./summary";
import { CartWarnings } from "./warnings";

import styles from "./overlay.module.css";

function CartCountBadge() {
  const count = useCart((state) => state.data.totalQuantity);
  if (count === 0) return null;
  return <span className={styles.count}>{count}</span>;
}

interface CartOverlayProps {
  description: string;
  title: string;
}

export function CartOverlay({ description, title }: CartOverlayProps) {
  const { isOverlayOpen, setOverlayOpen } = useCartDrawer();

  return (
    <Sheet
      className={styles.sheet}
      closeButton={false}
      onOpenChange={setOverlayOpen}
      open={isOverlayOpen}
      overlay={false}
      side="right"
    >
      <div className={styles.header}>
        <div className={styles.heading}>
          <DialogTitle className={styles.title}>{title}</DialogTitle>
          <CartCountBadge />
        </div>
        <DialogClose aria-label="Close cart" className={styles.close}>
          <Icon name="x" size={20} />
        </DialogClose>
      </div>
      <DialogDescription className="sr-only">{description}</DialogDescription>
      <OverlayContent />
    </Sheet>
  );
}

function OverlayContent() {
  const router = useRouter();
  const cart = useCart((state) => state.data);
  const isLoading = useCart((state) => state.loading);
  const { setOverlayOpen } = useCartDrawer();
  if (isLoading && cart.lines.nodes.length === 0) {
    return (
      <div className={styles.loading} role="status">
        <Icon name="loader-circle" className={styles.spinner} size={16} />
        Loading cart…
      </div>
    );
  }
  if (cart.lines.nodes.length === 0) {
    return (
      <div className={styles.empty}>
        <CartWarnings />
        <div className={styles.emptyContent}>
          <h3 className={styles.emptyTitle}>Your cart is empty</h3>
          <Button
            onClick={() => {
              setOverlayOpen(false);
              router.push("/");
            }}
            className={styles.continue}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.content}>
      <div className={styles.lines}>
        <CartWarnings />
        <CartLineItems lines={cart.lines.nodes} />
      </div>
      <footer className={styles.footer}>
        <DemoStoreNotice />
        <CartSummary cart={cart} />
      </footer>
    </div>
  );
}
