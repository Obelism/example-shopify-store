import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  formatOrderDate,
  humanizeStatus,
  OrderStatusBadge,
} from "@/components/account/order-display";
import { AccountPageHeader } from "@/components/account/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderLineItem } from "@/lib/customer/types";
import { formatPrice } from "@/lib/money";
import type { Money } from "@/lib/money/types";
import { fetchCustomerOrder } from "@/lib/shopify/operations/customer/server";

import styles from "./page.module.css";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}

async function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) notFound();
  const order = await fetchCustomerOrder(id);
  if (!order) notFound();
  return (
    <>
      <AccountPageHeader title={order.name} description={formatOrderDate(order.processedAt)} />

      <div className={styles.badges}>
        <OrderStatusBadge status={order.fulfillmentStatus} />
        {order.financialStatus ? (
          <Badge variant="outline">{humanizeStatus(order.financialStatus)}</Badge>
        ) : null}
      </div>

      <ul className={styles.lineItems}>
        {order.lineItems.map((item, index) => (
          <OrderLineItemRow key={index} item={item} />
        ))}
      </ul>

      <dl className={styles.summary}>
        <SummaryRow label="Subtotal" money={order.subtotal} />
        <SummaryRow label="Shipping" money={order.totalShipping} />
        <SummaryRow label="Tax" money={order.totalTax} />
        <div className={styles.totalRow}>
          <dt>Total</dt>
          <dd className={styles.amount}>{formatPrice(order.totalPrice)}</dd>
        </div>
      </dl>

      {order.shippingAddress && order.shippingAddress.formatted.length > 0 ? (
        <div className={styles.shipping}>
          <h2 className={styles.shippingTitle}>Shipping address</h2>
          <address className={styles.address}>
            {order.shippingAddress.formatted.map((line, index) => (
              <span key={index} className={styles.addressLine}>
                {line}
              </span>
            ))}
          </address>
        </div>
      ) : null}

      <div className={styles.actions}>
        <a
          className={buttonClassName({ size: "sm", variant: "outline" })}
          href={order.statusPageUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          View order status
        </a>
      </div>
    </>
  );
}

function OrderLineItemRow({ item }: { item: OrderLineItem }) {
  return (
    <li className={styles.lineItem}>
      <div className={styles.thumbnail}>
        {item.image ? (
          <Image
            src={item.image.url}
            alt={item.image.altText}
            fill
            className={styles.image}
            sizes="100vw"
          />
        ) : null}
      </div>
      <div className={styles.details}>
        <p className={styles.title}>{item.title}</p>
        {item.variantTitle ? <p className={styles.variant}>{item.variantTitle}</p> : null}
        <p className={styles.quantity}>× {item.quantity}</p>
      </div>
      {item.totalPrice ? (
        <span className={styles.linePrice}>{formatPrice(item.totalPrice)}</span>
      ) : null}
    </li>
  );
}

function SummaryRow({ label, money }: { label: string; money: Money | null }) {
  if (!money) return null;
  return (
    <div className={styles.summaryRow}>
      <dt className={styles.summaryLabel}>{label}</dt>
      <dd className={styles.amount}>{formatPrice(money)}</dd>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div aria-busy="true" className={styles.skeleton}>
      <Skeleton className={styles.titleSkeleton} />
      <Skeleton className={styles.blockSkeleton} />
      <Skeleton className={styles.tallBlockSkeleton} />
    </div>
  );
}
