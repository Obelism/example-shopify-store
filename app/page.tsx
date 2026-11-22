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

import styles from "./page.module.css";

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
    <Page className={styles.page}>
      <Container className={styles.container}>
        <header className={styles.header}>
          <CmsEntry published={published} query={pageQuery(HOME_PATH)} searchParams={searchParams}>
            {(entry) => <CmsBody entry={entry} introHeading="h1" />}
          </CmsEntry>
        </header>
        <ProductsGrid eagerCount={6} limit={100} />
      </Container>
    </Page>
  );
}
