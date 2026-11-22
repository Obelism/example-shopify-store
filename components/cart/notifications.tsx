"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { useCart } from "@/lib/cart/client";

import styles from "./notifications.module.css";

const DISMISS_AFTER_MS = 5000;

export function CartNotifications() {
  const errorAt = useCart((state) =>
    state.errors.network.length > 0 ? state.errors.networkUpdatedAt : null,
  );
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);

  useEffect(() => {
    if (errorAt === null) return;
    const timeout = setTimeout(() => setDismissedAt(errorAt), DISMISS_AFTER_MS);
    return () => clearTimeout(timeout);
  }, [errorAt]);

  if (errorAt === null || dismissedAt === errorAt) return null;

  return (
    <div className={styles.notification} role="alert">
      <span>We couldn&apos;t update your cart. Please try again.</span>
      <button
        aria-label="Dismiss"
        className={styles.dismiss}
        onClick={() => setDismissedAt(errorAt)}
        type="button"
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}
