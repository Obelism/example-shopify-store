import type { Metadata } from "next";
import { Suspense } from "react";

import { CmsBody } from "@/components/cms/cms-body";
import { CmsEntry } from "@/components/cms/cms-entry";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { getCmsPage, getCmsPagePaths, pageQuery } from "@/lib/cms/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { PLACEHOLDER_HANDLE } from "@/lib/static-params";

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
    <Page className="pt-5 md:pt-10">
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
  const published = slug === PLACEHOLDER_HANDLE ? null : await getCmsPage(slug);
  return (
    <CmsEntry published={published} query={pageQuery(slug)} required searchParams={searchParams}>
      {(entry) =>
        entry ? (
          <article className="grid gap-10">
            <h1 className="font-serif text-4xl tracking-tight md:text-5xl">{entry.fields.title}</h1>
            <CmsBody entry={entry} />
          </article>
        ) : null
      }
    </CmsEntry>
  );
}

function ContentPageSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-10">
      <Skeleton className="h-10 w-64 md:h-12" />
      <div className="grid max-w-2xl gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
