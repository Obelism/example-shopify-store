"use client";

import type { ComponentProps, ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuspenseCart } from "@/lib/cart/client";

import { DemoStoreNotice } from "./demo-store-notice";
import { CartLineItems } from "./line-item";
import { CartSummary } from "./summary";
import { CartWarnings } from "./warnings";

import styles from "./cart-page.module.css";

export function CartPageContent() {
  const cart = useSuspenseCart((state) => state.data);

  if (cart.totalQuantity === 0) {
    return (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>Your cart is empty</h2>
        <Link href="/" className={styles.continue}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <CartPageLayout
      count={<span className={styles.count}>{cart.totalQuantity}</span>}
      summary={<CartSummary cart={cart} />}
      warnings={<CartWarnings />}
    >
      <CartLineItems lines={cart.lines.nodes} />
    </CartPageLayout>
  );
}

export function CartPageSkeleton() {
  return (
    <CartPageLayout
      aria-busy="true"
      count={<Skeleton className={styles.countSkeleton} />}
      summary={
        <div className={styles.summary}>
          <div className={styles.summaryTop}>
            <div className={styles.discount}>
              <Skeleton className={styles.discountInput} />
              <Skeleton className={styles.discountButton} />
            </div>
            <div className={styles.total}>
              <div className={styles.totalRow}>
                <Skeleton className={styles.totalLabel} />
                <Skeleton className={styles.totalValue} />
              </div>
              <Skeleton className={styles.totalNote} />
            </div>
          </div>
          <Skeleton className={styles.checkout} />
        </div>
      }
    >
      <ul className={styles.lines}>
        {[0, 1, 2].map((index) => (
          <li key={index} className={styles.line}>
            <Skeleton className={styles.lineImage} />
            <div className={styles.lineBody}>
              <div className={styles.lineText}>
                <Skeleton className={styles.lineTitle} />
                <Skeleton className={styles.lineVariant} />
              </div>
              <Skeleton className={styles.lineQuantity} />
            </div>
            <Skeleton className={styles.linePrice} />
          </li>
        ))}
      </ul>
    </CartPageLayout>
  );
}

interface CartPageLayoutProps extends ComponentProps<"div"> {
  count: ReactNode;
  summary: ReactNode;
  warnings?: ReactNode;
}

function CartPageLayout({ children, count, summary, warnings, ...props }: CartPageLayoutProps) {
  return (
    <Page {...props}>
      <Container>
        <Sections>
          <div className={styles.header}>
            <h1 className={styles.title}>Cart</h1>
            {count}
          </div>
          {warnings}
          <div className={styles.layout}>
            <div className={styles.main}>{children}</div>
            <aside className={styles.aside}>
              <div className={styles.asideContent}>
                <DemoStoreNotice />
                {summary}
              </div>
            </aside>
          </div>
        </Sections>
      </Container>
    </Page>
  );
}
