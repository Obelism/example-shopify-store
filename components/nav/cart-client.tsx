"use client";

import { useCartDrawer } from "@/components/cart/context";
import { Icon } from "@/components/ui/icon";
import { useCart } from "@/lib/cart/client";

import styles from "./cart-client.module.css";

interface CartIconClientProps {
  cartLabel: string;
  initialCart: { totalQuantity: number } | null;
}

export function CartIconClient({ cartLabel, initialCart }: CartIconClientProps) {
  const quantity = useCart((state) =>
    state.loading
      ? (initialCart?.totalQuantity ?? state.data.totalQuantity)
      : state.data.totalQuantity,
  );
  const { openOverlay } = useCartDrawer();

  return (
    <button onClick={openOverlay} className={styles.button} type="button">
      <span className={styles.icon}>
        <Icon name="handbag" size={20} />
        {quantity > 0 && <span className={styles.count}>{quantity}</span>}
      </span>
      <span className="sr-only">{cartLabel}</span>
    </button>
  );
}
