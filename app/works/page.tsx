import type { Metadata } from "next";
import Image from "next/image";

import { Price } from "@/components/product/price";
import { Container } from "@/components/ui/container";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { getCollectionResults, getCollectionsListing } from "@/lib/collections/server";
import { buildProductUrl } from "@/lib/product";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Index of works";
  const description = "Every print, series by series.";
  return {
    title,
    description,
    alternates: buildAlternates({ pathname: "/works" }),
    openGraph: buildOpenGraph({ title, description, url: "/works", type: "website" }),
  };
}

export default async function WorksPage() {
  const collections = await getCollectionsListing({});
  const series = await Promise.all(
    collections.map(async (collection) => ({
      collection,
      products: (await getCollectionResults({ handle: collection.handle })).products,
    })),
  );
  return (
    <Page className={styles.page}>
      <Container className={styles.container}>
        <h1 className={styles.title}>Index of works</h1>
        {series.length === 0 ? <p className={styles.empty}>No prints yet.</p> : null}
        {series
          .filter(({ products }) => products.length > 0)
          .map(({ collection, products }) => (
            <section key={collection.handle} className={styles.series}>
              <div className={styles.seriesHeader}>
                <h2 className={styles.seriesTitle}>
                  <Link href={`/collections/${collection.handle}`}>{collection.title}</Link>
                </h2>
                <span className={styles.count}>
                  {products.length === 1 ? "1 print" : `${products.length} prints`}
                </span>
              </div>
              <ol className={styles.list}>
                {products.map((product, index) => (
                  <li key={product.id}>
                    <Link
                      href={buildProductUrl(
                        product.handle,
                        product.defaultVariantSelectedOptions ?? [],
                      )}
                      className={styles.print}
                    >
                      <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.thumbnail}>
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage.url}
                            alt=""
                            fill
                            className={styles.image}
                            sizes="100vw"
                          />
                        ) : (
                          <ImagePlaceholder className={styles.placeholder} />
                        )}
                      </span>
                      <span className={styles.printTitle}>{product.title}</span>
                      <span className={styles.price}>
                        From
                        <Price
                          amount={product.price.amount}
                          currencyCode={product.price.currencyCode}
                          className={styles.priceAmount}
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
      </Container>
    </Page>
  );
}
