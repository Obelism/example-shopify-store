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
    <Page className="pt-5 md:pt-10">
      <Container className="grid gap-12">
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">Index of works</h1>
        {series.length === 0 ? <p className="text-muted-foreground">No prints yet.</p> : null}
        {series
          .filter(({ products }) => products.length > 0)
          .map(({ collection, products }) => (
            <section key={collection.handle} className="grid gap-4">
              <div className="flex items-baseline justify-between gap-5 border-b pb-2">
                <h2 className="font-serif text-xl italic">
                  <Link href={`/collections/${collection.handle}`}>{collection.title}</Link>
                </h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {products.length === 1 ? "1 print" : `${products.length} prints`}
                </span>
              </div>
              <ol className="grid">
                {products.map((product, index) => (
                  <li key={product.id}>
                    <Link
                      href={buildProductUrl(
                        product.handle,
                        product.defaultVariantSelectedOptions ?? [],
                      )}
                      className="grid grid-cols-[2rem_4rem_1fr_auto] items-center gap-4 border-b border-border/60 py-2 text-sm transition-colors hover:bg-accent/60"
                    >
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="relative block aspect-3/2 w-16 overflow-hidden bg-muted">
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage.url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="100vw"
                          />
                        ) : (
                          <ImagePlaceholder className="size-full" />
                        )}
                      </span>
                      <span className="font-serif text-base">{product.title}</span>
                      <span className="inline-flex items-baseline gap-1 text-xs text-muted-foreground">
                        From
                        <Price
                          amount={product.price.amount}
                          currencyCode={product.price.currencyCode}
                          className="text-xs text-muted-foreground"
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
