"use client";

import type { CartErrorGroup } from "@shopify/hydrogen";
import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { useCart } from "@/lib/cart/client";

import styles from "./warnings.module.css";

interface CartWarningsProps {
  lineId?: string;
}

export function CartWarnings({ lineId }: CartWarningsProps) {
  const errors = useCart((state) => state.errors);
  const lines = useCart((state) => state.data.lines.nodes);
  const visibleLineIds = new Set(lines.map((line) => line.id));
  const groups = lineId
    ? [errors.lines.get(lineId)]
    : [
        errors.cart,
        ...Array.from(errors.lines.entries())
          .filter(([id]) => !visibleLineIds.has(id))
          .map(([, group]) => group),
      ];
  const group = {
    userErrors: groups.flatMap((entry) => entry?.userErrors ?? []),
    warnings: groups.flatMap((entry) => entry?.warnings ?? []),
  };
  if (!group.userErrors.length && !group.warnings.length) return null;
  return <CartWarningMessages key={JSON.stringify([lineId, group])} group={group} />;
}

function CartWarningMessages({ group }: { group: CartErrorGroup }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const messages = [...group.userErrors, ...group.warnings];
  return (
    <div role={group.userErrors.length ? "alert" : "status"} className={styles.warnings}>
      <div className={styles.content}>
        <Icon name="triangle-alert" className={styles.icon} size={16} />
        <div className={styles.text}>
          <p className={styles.title}>
            {group.userErrors.length ? "We couldn't update your cart" : "Your cart was updated"}
          </p>
          <ul className={styles.messages}>
            {messages.map((message, index) => (
              <li key={`${message.code}:${index}`}>{message.message}</li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className={styles.dismiss}
        >
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
}
