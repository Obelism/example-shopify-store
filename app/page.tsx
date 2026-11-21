import type { Metadata } from "next";

import { CmsBody } from "@/components/cms/cms-body";
import { CmsEntry } from "@/components/cms/cms-entry";
import { ProductsGrid } from "@/components/product/products-grid";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { HOME_PATH } from "@/lib/cms";
import { getCmsPage, pageQuery } from "@/lib/cms/server";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage(HOME_PATH);
  const title = page?.fields.title ?? "Work";
  const description = page?.fields.description ?? shopConfig.site.description;
  return {
    title: `${title} | ${shopConfig.site.name}`,
    description,
    alternates: buildAlternates({ pathname: "/" }),
    openGraph: buildOpenGraph({
      title,
      description,
      url: "/",
      type: "website",
    }),
  };
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const published = await getCmsPage(HOME_PATH);
  return (
    <Page className="pt-5 md:pt-10">
      <Container className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
        <header className="lg:sticky lg:top-26 lg:self-start">
          <CmsEntry published={published} query={pageQuery(HOME_PATH)} searchParams={searchParams}>
            {(entry) => (entry ? <CmsBody entry={entry} /> : null)}
          </CmsEntry>
        </header>
        <ProductsGrid eagerCount={6} limit={100} />
      </Container>
    </Page>
  );
}
