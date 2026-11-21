import { Suspense } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/product-card/product-card";
import { JustifiedGrid, JustifiedGridItem } from "@/components/ui/justified-grid";
import { Link } from "@/components/ui/link";
import { getAspectRatio } from "@/lib/media";
import { getSearchIndexProducts } from "@/lib/product/server";

interface ProductsGridSkeletonProps {
  count: number;
  className?: string;
}

export function ProductsGridSkeleton({ count, className }: ProductsGridSkeletonProps) {
  return (
    <JustifiedGrid className={className}>
      {Array.from({ length: count }, (_, index) => (
        <JustifiedGridItem key={index} aspectRatio={index % 3 === 1 ? 3 / 4 : 3 / 2}>
          <ProductCardSkeleton imageClassName={index % 3 === 1 ? "aspect-3/4" : "aspect-3/2"} />
        </JustifiedGridItem>
      ))}
    </JustifiedGrid>
  );
}

interface ProductsGridProps {
  collectionUrl?: string;
  eagerCount?: number;
  limit: number;
  title?: string;
}

export function ProductsGrid({ collectionUrl, eagerCount = 0, limit, title }: ProductsGridProps) {
  return (
    <div className="grid gap-4">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl sm:text-3xl">{title}</h2>
          {collectionUrl && (
            <Link
              href={collectionUrl}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View All
            </Link>
          )}
        </div>
      )}
      <Suspense fallback={<ProductsGridSkeleton count={limit} />}>
        <ProductsGridContent eagerCount={eagerCount} limit={limit} outOfStockText="Out of Stock" />
      </Suspense>
    </div>
  );
}

async function ProductsGridContent({
  eagerCount,
  limit,
  outOfStockText,
}: {
  eagerCount: number;
  limit: number;
  outOfStockText: string;
}) {
  // Use the search index (not the products connection) so these match the first items on /collections/all.
  const { products } = await getSearchIndexProducts({
    limit,
  });
  if (products.length === 0) return null;
  return (
    <JustifiedGrid>
      {products.map((product, index) => (
        <JustifiedGridItem key={product.id} aspectRatio={getAspectRatio(product.featuredImage)}>
          <ProductCard
            loading={index < eagerCount ? "eager" : "lazy"}
            product={product}
            outOfStockText={outOfStockText}
          />
        </JustifiedGridItem>
      ))}
    </JustifiedGrid>
  );
}
