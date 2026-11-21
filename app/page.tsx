import type { Metadata } from "next";

import { ProductsGrid } from "@/components/product/products-grid";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Work";
  const description = shopConfig.site.description;
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

export default function HomePage() {
  return (
    <Page className="pt-5 md:pt-10">
      <Container className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
        <header className="grid content-start gap-5 lg:sticky lg:top-26 lg:self-start">
          <h1 className="font-serif text-3xl leading-tight tracking-tight">Welcome.</h1>
          <div className="grid gap-4 text-sm leading-6 text-muted-foreground">
            <p>
              I&rsquo;m Noor Halde, a photographer drawn to the quiet hours: summits before sunrise,
              forests in fog, cities after dark.
            </p>
            <p>
              Every photograph here is available as an archival pigment print, in three sizes, on
              matte or baryta paper, framed or unframed. Each one is printed to order and signed on
              the back.
            </p>
          </div>
          <nav aria-label="Browse" className="flex gap-5 text-sm">
            <Link className="underline-offset-4 hover:underline" href="/collections">
              The series
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/works">
              Index of works
            </Link>
          </nav>
        </header>
        <ProductsGrid eagerCount={6} limit={100} />
      </Container>
    </Page>
  );
}
