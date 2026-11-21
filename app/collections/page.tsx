import type { Metadata } from "next";

import { CollectionCard } from "@/components/collections/collection-card";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { getCollectionsListing } from "@/lib/collections/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

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
    <Page className="pt-5 md:pt-10">
      <Container>
        <Sections className="gap-10">
          <h1 className="font-serif text-4xl tracking-tight md:text-5xl">Series</h1>

          {collections.length > 0 ? (
            <div className="grid gap-x-8 gap-y-12 md:grid-cols-2">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.handle}
                  collection={collection}
                  viewCollectionLabel={viewCollectionLabel}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No series yet.</p>
          )}
        </Sections>
      </Container>
    </Page>
  );
}
