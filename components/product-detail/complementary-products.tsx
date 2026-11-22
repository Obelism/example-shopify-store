import Image from "next/image";

import { Price } from "@/components/product/price";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { getProductRecommendations } from "@/lib/product/server";
import type { ProductCard } from "@/lib/product/types";

import styles from "./complementary-products.module.css";

export async function ComplementaryProducts({
  handle,
  limit,
  title,
}: {
  handle: string;
  limit: number;
  title: string;
}) {
  const complementary = await getProductRecommendations({ handle, intent: "COMPLEMENTARY" });
  if (complementary.length === 0) return null;
  return (
    <div className={styles.root}>
      <h2 className={styles.title}>{title}</h2>
      <ul className={styles.list}>
        {complementary.slice(0, limit).map((product: ProductCard) => (
          <li key={product.id}>
            <Link href={`/products/${product.handle}`} className={styles.item}>
              {product.featuredImage ? (
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText || product.title}
                  width={48}
                  height={48}
                  sizes="100vw"
                  className={styles.image}
                />
              ) : (
                <ImagePlaceholder className={styles.placeholder} />
              )}
              <span className={styles.name}>{product.title}</span>
              <Price
                amount={product.price.amount}
                className={styles.price}
                currencyCode={product.price.currencyCode}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
