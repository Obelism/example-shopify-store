import type { Metadata } from "next";

import { CollectionCard } from "@/components/collections/collection-card";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { getCollectionsListing } from "@/lib/collections/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Series";
  const description = "Six bodies of work, each available as archival prints.";
  return {
    title,
    description,
    alternates: buildAlternates({
      pathname: "/collections",
    }),
    openGraph: buildOpenGraph({
      title,
      description,
      url: "/collections",
      type: "website",
    }),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
  };
}

export default async function CollectionsPage() {
  const collections = await getCollectionsListing({});
  const viewCollectionLabel = "View this series";
  return (
    <Page className={styles.page}>
      <Container>
        <Sections>
          <h1 className={styles.title}>Series</h1>

          {collections.length > 0 ? (
            <div className={styles.grid}>
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.handle}
                  collection={collection}
                  viewCollectionLabel={viewCollectionLabel}
                />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>No series yet.</p>
          )}
        </Sections>
      </Container>
    </Page>
  );
}
