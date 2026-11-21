"use client";

import { imageUrl, linkHref } from "@obelism/content";
import { editable, RichText, type RichTextMarkProps, useLiveEntry } from "@obelism/content-react";
import { cn } from "cn";
import Image, { type ImageLoader } from "next/image";

import { CollectionCard } from "@/components/collections/collection-card";
import { Price } from "@/components/product/price";
import { Link } from "@/components/ui/link";
import type {
  FeaturedPrint,
  FeaturedSeries,
  Image as ImageBlock,
  Intro,
  Quote,
  Text,
} from "@/content/content-types";
import { HOME_PATH, resolveBlocks } from "@/lib/cms";
import type { CollectionWithThumbnail } from "@/lib/collections/types";
import type { ProductCard } from "@/lib/product/types";

import type { CmsBodyEntry } from "./cms-body";

export type CmsBodyBlock = FeaturedPrint | FeaturedSeries | ImageBlock | Intro | Quote | Text;

interface CmsBodyClientProps {
  className?: string;
  collections: CollectionWithThumbnail[];
  entry: CmsBodyEntry;
  products: ProductCard[];
}

export function CmsBodyClient({ className, collections, entry, products }: CmsBodyClientProps) {
  const live = useLiveEntry(entry);
  return (
    <div {...editable(live)} className={cn("grid gap-12", className)}>
      {resolveBlocks(live.fields.body).map((block) => (
        <CmsBlock key={block._uid} block={block} collections={collections} products={products} />
      ))}
    </div>
  );
}

function CmsBlock({
  block,
  collections,
  products,
}: {
  block: CmsBodyBlock;
  collections: CollectionWithThumbnail[];
  products: ProductCard[];
}) {
  switch (block._type) {
    case "intro":
      return <IntroBlock block={block} />;
    case "text":
      return <TextBlock block={block} />;
    case "image":
      return <ImageBlockView block={block} />;
    case "quote":
      return <QuoteBlock block={block} />;
    case "featuredSeries":
      return <FeaturedSeriesBlock block={block} collections={collections} />;
    case "featuredPrint":
      return <FeaturedPrintBlock block={block} products={products} />;
    default:
      return null;
  }
}

function href(link: Parameters<typeof linkHref>[0]) {
  return linkHref(link, { url: (path) => (path === HOME_PATH ? "/" : `/${path}`) });
}

function LinkMark({ children, mark }: RichTextMarkProps) {
  const target = typeof mark.attrs?.href === "string" ? mark.attrs.href : null;
  if (!target) return <>{children}</>;
  return (
    <Link href={target} className="underline underline-offset-4 hover:text-foreground">
      {children}
    </Link>
  );
}

const RICH_TEXT_MARKS = { link: LinkMark };

function Prose({ document }: { document: Text["text"] }) {
  return (
    <div className="grid gap-4 text-sm leading-6 text-muted-foreground md:text-base md:leading-7 [&_strong]:font-medium [&_strong]:text-foreground">
      <RichText document={document} marks={RICH_TEXT_MARKS} />
    </div>
  );
}

function IntroBlock({ block }: { block: Intro }) {
  return (
    <section {...editable(block)} className="grid content-start gap-5">
      {block.heading ? (
        <h1 className="font-serif text-3xl leading-tight tracking-tight">{block.heading}</h1>
      ) : null}
      <div className="text-sm leading-6 [&_p]:text-muted-foreground">
        <Prose document={block.text} />
      </div>
      {resolveBlocks(block.links).length > 0 ? (
        <nav
          aria-label={block.heading ?? "Links"}
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
        >
          {resolveBlocks(block.links).map((item) => {
            const target = href(item.link);
            return target ? (
              <Link
                key={item._uid}
                {...editable(item)}
                className="underline-offset-4 hover:underline"
                href={target}
              >
                {item.label}
              </Link>
            ) : null;
          })}
        </nav>
      ) : null}
    </section>
  );
}

function TextBlock({ block }: { block: Text }) {
  return (
    <section {...editable(block)} className="grid max-w-2xl gap-4">
      {block.heading ? (
        <h2 className="font-serif text-2xl tracking-tight">{block.heading}</h2>
      ) : null}
      <Prose document={block.text} />
    </section>
  );
}

// Content resizes and re-encodes its own assets, so Next's optimizer is skipped for them.
const contentImageLoader: ImageLoader = ({ quality, src, width }) =>
  imageUrl(src, { format: "auto", q: quality ?? 75, w: width });

const IMAGE_WIDTHS = { full: "w-full", narrow: "max-w-xl", wide: "max-w-4xl" } as const;

function ImageBlockView({ block }: { block: ImageBlock }) {
  const { image } = block;
  if (!image?.width || !image.height) return null;
  const alt = typeof image.alt === "string" ? image.alt : "";
  return (
    <figure
      {...editable(block)}
      className={cn("grid w-full gap-2", IMAGE_WIDTHS[block.width ?? "wide"])}
    >
      <Image
        alt={alt}
        className="h-auto w-full bg-muted"
        height={image.height}
        loader={contentImageLoader}
        sizes="100vw"
        src={image.url}
        width={image.width}
      />
      {block.caption ? (
        <figcaption className="text-xs text-muted-foreground">{block.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function QuoteBlock({ block }: { block: Quote }) {
  return (
    <figure {...editable(block)} className="grid max-w-2xl gap-3 border-l pl-6">
      <blockquote className="font-serif text-2xl leading-snug italic tracking-tight">
        {block.quote}
      </blockquote>
      {block.attribution ? (
        <figcaption className="text-sm text-muted-foreground">{block.attribution}</figcaption>
      ) : null}
    </figure>
  );
}

function FeaturedSeriesBlock({
  block,
  collections,
}: {
  block: FeaturedSeries;
  collections: CollectionWithThumbnail[];
}) {
  const picked = (block.collections ?? []).flatMap(
    (item) => collections.find(({ handle }) => handle === item.handle) ?? [],
  );
  if (picked.length === 0) return null;
  return (
    <section {...editable(block)} className="grid gap-5">
      {block.heading ? (
        <h2 className="font-serif text-2xl tracking-tight">{block.heading}</h2>
      ) : null}
      <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">
        {picked.map((collection) => (
          <CollectionCard
            key={collection.handle}
            collection={collection}
            viewCollectionLabel="View this series"
          />
        ))}
      </div>
    </section>
  );
}

function FeaturedPrintBlock({
  block,
  products,
}: {
  block: FeaturedPrint;
  products: ProductCard[];
}) {
  const product = products.find(({ id }) => id === block.product?.id);
  if (!product) return null;
  const image = product.featuredImage;
  return (
    <section {...editable(block)} className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
      {image ? (
        <Image
          alt={image.altText || product.title}
          className="h-auto w-full bg-muted"
          height={image.height}
          sizes="100vw"
          src={image.url}
          width={image.width}
        />
      ) : null}
      <div className="grid content-center gap-3">
        <h2 className="font-serif text-3xl tracking-tight">{product.title}</h2>
        {block.text ? <p className="leading-7 text-muted-foreground">{block.text}</p> : null}
        <p className="inline-flex items-baseline gap-1 text-sm text-muted-foreground">
          From
          <Price
            amount={product.price.amount}
            currencyCode={product.price.currencyCode}
            className="text-sm text-muted-foreground"
          />
        </p>
        <Link
          className="w-fit text-sm underline underline-offset-4"
          href={`/products/${product.handle}`}
        >
          View the print
        </Link>
      </div>
    </section>
  );
}
