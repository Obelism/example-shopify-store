import { Icon } from "@/components/ui/icon";
import { getCart } from "@/lib/cart/server";
import { withFallback } from "@/lib/shopify/errors/server";

import { CartIconClient } from "./cart-client";

import styles from "./cart.module.css";

export async function CartIcon() {
  const cart = await withFallback(getCart(), undefined);
  return <CartIconClient cartLabel="Cart" initialCart={cart ?? null} />;
}

export function CartIconFallback() {
  return (
    <span className={styles.fallback}>
      <Icon name="handbag" size={20} />
      <span className="sr-only">Cart</span>
    </span>
  );
}
