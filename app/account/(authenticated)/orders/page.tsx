import { Suspense } from "react";

import { formatOrderDate, OrderStatusBadge } from "@/components/account/order-display";
import { AccountPageHeader } from "@/components/account/page-header";
import { buttonClassName } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/money";
import { fetchCustomerOrders } from "@/lib/shopify/operations/customer/server";

import styles from "./page.module.css";

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ after?: string; before?: string }>;
}) {
  return (
    <>
      <AccountPageHeader title="Orders" description="View your order history" />
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function OrdersContent({
  searchParams,
}: {
  searchParams: Promise<{ after?: string; before?: string }>;
}) {
  const params = await searchParams;
  const { orders, pageInfo } = await fetchCustomerOrders({
    after: params.after,
    before: params.before,
  });
  if (orders.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>You have no orders yet.</p>
      </div>
    );
  }
  return (
    <div className={styles.root}>
      <ul className={styles.list}>
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/account/orders/${encodeURIComponent(order.id)}`} className={styles.order}>
              <div className={styles.orderInfo}>
                <span className={styles.orderName}>{order.name}</span>
                <span className={styles.orderDate}>{formatOrderDate(order.processedAt)}</span>
              </div>
              <div className={styles.orderMeta}>
                <OrderStatusBadge status={order.fulfillmentStatus} />
                <span className={styles.orderTotal}>{formatPrice(order.totalPrice)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {pageInfo.hasNextPage || pageInfo.hasPreviousPage ? (
        <div className={styles.pagination}>
          {pageInfo.hasPreviousPage && pageInfo.startCursor ? (
            <Link
              className={buttonClassName({ size: "sm", variant: "outline" })}
              href={`/account/orders?before=${encodeURIComponent(pageInfo.startCursor)}`}
            >
              Newer
            </Link>
          ) : (
            <span />
          )}
          {pageInfo.hasNextPage && pageInfo.endCursor ? (
            <Link
              className={buttonClassName({ size: "sm", variant: "outline" })}
              href={`/account/orders?after=${encodeURIComponent(pageInfo.endCursor)}`}
            >
              Older
            </Link>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className={styles.orderSkeleton} />
      ))}
    </div>
  );
}
