"use client";

import type { CartLine as HydrogenCartLine } from "@shopify/hydrogen";
import Image from "next/image";

import { Icon } from "@/components/ui/icon";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { useCart } from "@/lib/cart/client";
import type { CartLine } from "@/lib/cart/types";
import { formatPrice } from "@/lib/money";

import { CartLineForm } from "./line-form";
import { CartWarnings } from "./warnings";

import styles from "./line-item.module.css";

interface CartLineItemsProps {
  lines: CartLine[];
}

export function CartLineItems({ lines }: CartLineItemsProps) {
  const keys = getLineRowKeys(lines);
  return (
    <ul className={styles.lines} aria-label="Cart items">
      {lines.map((line, index) => (
        <CartLineItem key={keys[index]} item={line} />
      ))}
    </ul>
  );
}

// Shopify replaces a new line's `optimistic:` ID on confirmation, so rows key by the identity Hydrogen matches lines on.
function getLineRowKeys(lines: CartLine[]) {
  const keys = lines.map((line) =>
    JSON.stringify([
      line.merchandise?.id ?? line.id,
      line.sellingPlanAllocation?.sellingPlan.id ?? null,
      (line.attributes ?? []).map(({ key, value }) => JSON.stringify([key, value])).sort(),
    ]),
  );
  return keys.map((key, index) =>
    keys.indexOf(key) === keys.lastIndexOf(key) ? key : lines[index].id,
  );
}

interface CartLineItemProps {
  item: CartLine;
}

function CartLineItem({ item }: CartLineItemProps) {
  const isPending = useCart((state) => state.pending.lines.has(item.id));
  const isCostPending = useCart((state) =>
    Boolean(state.pending.cost || state.revalidating || state.pending.lines.has(item.id)),
  );
  const { cost, merchandise, quantity } = item;
  const instructions = "instructions" in item ? item.instructions : undefined;
  const canUpdateQuantity = !(
    instructions &&
    typeof instructions === "object" &&
    "canUpdateQuantity" in instructions &&
    instructions.canUpdateQuantity === false
  );
  const canRemove = !(
    instructions &&
    typeof instructions === "object" &&
    "canRemove" in instructions &&
    instructions.canRemove === false
  );
  const components = (item as HydrogenCartLine).lineComponents ?? [];
  const isOptimistic = item.id.startsWith("optimistic:");
  const currencyCode = cost.totalAmount.currencyCode;
  const finalUnitPrice = quantity > 0 ? Number(cost.totalAmount.amount) / quantity : 0;
  const sellingUnitPrice = Number(cost.amountPerQuantity.amount);
  const compareAtUnitPrice = Number(cost.compareAtAmountPerQuantity?.amount ?? 0);
  const originalUnitPrice =
    finalUnitPrice < sellingUnitPrice ? sellingUnitPrice : compareAtUnitPrice;
  const title = merchandise?.product.title || "Cart item";
  const variantLabel = merchandise?.selectedOptions?.length
    ? merchandise.selectedOptions.map((option) => option.value).join(" / ")
    : "";
  const lineName = variantLabel ? `${title}, ${variantLabel}` : title;
  const href = merchandise?.product.handle ? `/products/${merchandise.product.handle}` : undefined;
  const image = merchandise?.image;
  const imageContent = image?.url ? (
    <Image
      src={image.url}
      alt={image.altText || title}
      fill
      className={styles.image}
      sizes="100vw"
    />
  ) : (
    <ImagePlaceholder className={styles.placeholder} />
  );
  const price = (amount: number) => formatPrice({ amount: String(amount), currencyCode });

  return (
    <li className={styles.line} aria-busy={isPending || undefined} aria-label={title}>
      {href ? (
        <Link href={href} className={styles.mediaLink}>
          {imageContent}
        </Link>
      ) : (
        <div className={styles.media}>{imageContent}</div>
      )}
      <div className={styles.body}>
        <div className={styles.details}>
          <div className={styles.heading}>
            {href ? (
              <Link href={href} className={styles.titleLink}>
                <h3 className={styles.title}>{title}</h3>
              </Link>
            ) : (
              <h3 className={styles.title}>{title}</h3>
            )}
            {variantLabel ? <p className={styles.meta}>{variantLabel}</p> : null}
            {item.sellingPlanAllocation ? (
              <p className={styles.meta}>
                {item.sellingPlanAllocation.sellingPlan.name || "Subscription"}
              </p>
            ) : null}
          </div>
          {components.length ? (
            <div className={styles.bundle}>
              <p className={styles.bundleTitle}>Bundle Includes</p>
              <ul className={styles.bundleItems}>
                {components.map((component) => (
                  <li key={component.id} className={styles.bundleItem}>
                    <span className={styles.bundleName}>
                      {component.merchandise?.product.title || "Bundle item"}
                    </span>
                    {component.quantity > 1 ? <span>×{component.quantity}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <CartLineForm className={styles.form} lineId={item.id} minQuantity={canRemove ? 0 : 1}>
          {(register) => (
            <>
              <div aria-label="Item quantity" className={styles.quantity} role="group">
                <button
                  {...register("decrease")}
                  type="submit"
                  aria-label={`Decrease quantity: ${lineName}`}
                  className={styles.step}
                  disabled={isOptimistic || !canUpdateQuantity || quantity <= 1}
                >
                  <Icon name="minus" className={styles.stepIcon} size={12} />
                </button>
                <input
                  key={quantity}
                  {...register("quantity", { interactive: true, value: quantity })}
                  aria-label={`Quantity: ${lineName}`}
                  className={styles.quantityInput}
                  disabled={isOptimistic || !canUpdateQuantity}
                  max={99}
                  min={canRemove ? 0 : 1}
                />
                <button
                  {...register("increase")}
                  type="submit"
                  aria-label={`Increase quantity: ${lineName}`}
                  className={styles.step}
                  disabled={isOptimistic || !canUpdateQuantity || quantity >= 99}
                >
                  <Icon name="plus" className={styles.stepIcon} size={12} />
                </button>
              </div>
              <button
                {...register("remove")}
                type="submit"
                className={styles.remove}
                disabled={isOptimistic || !canRemove}
                aria-label={`Remove item: ${lineName}`}
              >
                <Icon name="trash-2" size={16} />
              </button>
            </>
          )}
        </CartLineForm>
        <CartWarnings lineId={item.id} />
      </div>
      <div className={styles.prices}>
        <span className={styles.price} data-pending={isCostPending || !currencyCode}>
          {isCostPending || !currencyCode ? "Updating…" : price(finalUnitPrice)}
        </span>
        {!isCostPending && currencyCode && originalUnitPrice > finalUnitPrice ? (
          <span className={styles.compareAtPrice}>{price(originalUnitPrice)}</span>
        ) : null}
      </div>
    </li>
  );
}
