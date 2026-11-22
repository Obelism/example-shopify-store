import { Suspense } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/product-card/product-card";
import { getProductRecommendations } from "@/lib/product/server";

import styles from "./related-products-section.module.css";

function RelatedProductsSectionSkeleton({ limit }: { limit: number }) {
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>More prints</h2>
      <div className={styles.grid}>
        {Array.from({ length: limit }, (_, index) => (
          <ProductCardSkeleton key={index} imageClassName={styles.skeletonImage} />
        ))}
      </div>
    </div>
  );
}

async function Render({ handle, limit }: { handle: string; limit: number }) {
  const related = await getProductRecommendations({ handle, intent: "RELATED" });
  if (related.length === 0) return null;
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>More prints</h2>
      <div className={styles.grid}>
        {related.slice(0, limit).map((product) => (
          <ProductCard key={product.id} product={product} outOfStockText="Out of Stock" />
        ))}
      </div>
    </div>
  );
}

export function RelatedProductsSection({ handle, limit }: { handle: string; limit: number }) {
  return (
    <Suspense fallback={<RelatedProductsSectionSkeleton limit={limit} />}>
      <Render handle={handle} limit={limit} />
    </Suspense>
  );
}
