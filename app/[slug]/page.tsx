import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CmsBody } from "@/components/cms/cms-body";
import { CmsEntry } from "@/components/cms/cms-entry";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { HOME_PATH } from "@/lib/cms";
import { getCmsPage, getCmsPagePaths, pageQuery } from "@/lib/cms/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { PLACEHOLDER_HANDLE } from "@/lib/static-params";

import styles from "./page.module.css";

export async function generateStaticParams() {
  const paths = await getCmsPagePaths().catch(() => []);
  const slugs = paths.filter((path) => !path.includes("/"));
  return (slugs.length ? slugs : [PLACEHOLDER_HANDLE]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = slug === PLACEHOLDER_HANDLE ? null : await getCmsPage(slug);
  if (!page) return {};
  const title = page.fields.title ?? page.name;
  const description = page.fields.description ?? undefined;
  return {
    title,
    description,
    alternates: buildAlternates({ pathname: `/${slug}` }),
    openGraph: buildOpenGraph({ title, description, url: `/${slug}`, type: "website" }),
  };
}

export default function ContentPage({ params, searchParams }: PageProps<"/[slug]">) {
  return (
    <Page className={styles.page}>
      <Container>
        <Suspense fallback={<ContentPageSkeleton />}>
          <ContentPageContent params={params} searchParams={searchParams} />
        </Suspense>
      </Container>
    </Page>
  );
}

async function ContentPageContent({ params, searchParams }: PageProps<"/[slug]">) {
  const { slug } = await params;
  if (slug === HOME_PATH) notFound();
  const published = slug === PLACEHOLDER_HANDLE ? null : await getCmsPage(slug);
  return (
    <CmsEntry published={published} query={pageQuery(slug)} required searchParams={searchParams}>
      {(entry) => (
        <article className={styles.article}>
          <h1 className={styles.title}>{entry.fields.title}</h1>
          <CmsBody entry={entry} />
        </article>
      )}
    </CmsEntry>
  );
}

function ContentPageSkeleton() {
  return (
    <div aria-busy="true" className={styles.skeleton}>
      <Skeleton className={styles.titleSkeleton} />
      <div className={styles.lines}>
        <Skeleton className={styles.line} />
        <Skeleton className={styles.lineMedium} />
        <Skeleton className={styles.lineShort} />
      </div>
    </div>
  );
}
