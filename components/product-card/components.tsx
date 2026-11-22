import { cn } from "cn";
import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";

import { DiscountBadge } from "@/components/product/discount-badge";
import { Price } from "@/components/product/price";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { getDiscountPercent } from "@/lib/product";

import styles from "./components.module.css";

function ProductCard({ className, children, ...props }: ComponentProps<"article">) {
  return (
    <article className={cn(styles.card, className)} {...props}>
      {children}
    </article>
  );
}

function ProductCardImageContainer({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn(styles.imageContainer, className)} {...props}>
      {children}
    </div>
  );
}

interface ProductCardImageProps {
  alt: string;
  children?: ReactNode;
  className?: string;
  height?: number;
  loading?: "eager" | "lazy";
  outOfStock?: boolean;
  outOfStockText?: string;
  src?: string | null;
  width?: number;
}

function ProductCardImage({
  alt,
  children,
  className,
  height,
  loading = "lazy",
  outOfStock = false,
  outOfStockText,
  src,
  width,
}: ProductCardImageProps) {
  return (
    <div
      className={cn(styles.image, className)}
      style={width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          {...(width && height ? { height, width } : { fill: true })}
          className={styles.img}
          loading={loading}
          sizes="100vw"
        />
      ) : (
        <ImagePlaceholder className={styles.placeholder} />
      )}
      {outOfStock && (
        <div className={styles.outOfStock}>
          <span className={styles.outOfStockLabel}>{outOfStockText}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function ProductCardContent({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn(styles.content, className)} {...props}>
      {children}
    </div>
  );
}

function ProductCardTitle({ className, children, ...props }: ComponentProps<"h3">) {
  return (
    <h3 className={cn(styles.title, className)} {...props}>
      {children}
    </h3>
  );
}

interface ProductCardPriceProps {
  amount: string;
  currencyCode: string;
  maxAmount?: string;
  compareAtAmount?: string;
  compareAtCurrencyCode?: string;
  className?: string;
}

function ProductCardPrice({
  amount,
  currencyCode,
  maxAmount,
  compareAtAmount,
  compareAtCurrencyCode,
  className,
}: ProductCardPriceProps) {
  const isRange = maxAmount != null && maxAmount !== amount;
  // A range's per-variant discounts differ, so a single compare-at would be misleading.
  const discountPercent = isRange ? null : getDiscountPercent(amount, compareAtAmount);
  return (
    <div className={className}>
      <div className={styles.prices}>
        <span className={styles.amount}>
          {isRange && <span>From</span>}
          <Price amount={amount} currencyCode={currencyCode} className={styles.price} />
        </span>
        {discountPercent !== null && compareAtAmount && compareAtCurrencyCode ? (
          <>
            <Price
              amount={compareAtAmount}
              currencyCode={compareAtCurrencyCode}
              className={styles.compareAtPrice}
            />
            <DiscountBadge percent={discountPercent} />
          </>
        ) : null}
      </div>
    </div>
  );
}

interface ProductCardSkeletonProps {
  className?: string;
  imageClassName?: string;
}

function ProductCardSkeleton({ className, imageClassName }: ProductCardSkeletonProps) {
  return (
    <div className={cn(styles.skeleton, className)}>
      <ImagePlaceholder className={cn(styles.skeletonImage, imageClassName)} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonPrice} />
      </div>
    </div>
  );
}

export {
  ProductCard,
  ProductCardContent,
  ProductCardImage,
  ProductCardImageContainer,
  ProductCardPrice,
  ProductCardSkeleton,
  ProductCardTitle,
};
