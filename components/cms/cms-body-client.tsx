"use client";

import { type ImproveBlock, imageUrl, isImproveBlock, linkHref } from "@obelism/content";
import { editable, RichText, type RichTextMarkProps, useLiveEntry } from "@obelism/content-react";
import { cn } from "cn";
import Image, { type ImageLoader } from "next/image";
import { useEffect, useSyncExternalStore } from "react";

import { CollectionCard } from "@/components/collections/collection-card";
import { ImproveVariants } from "@/components/improve/improve-variants";
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
import type { CmsBodyBlock, CmsBodyEntry } from "@/lib/cms/types";
import type { CollectionWithThumbnail } from "@/lib/collections/types";
import { recordExposure } from "@/lib/improve/client";
import type { ProductCard } from "@/lib/product/types";

import styles from "./cms-body-client.module.css";

interface CmsBodyClientProps {
  className?: string;
  collections: CollectionWithThumbnail[];
  entry: CmsBodyEntry;
  introHeading: "h1" | "h2";
  products: ProductCard[];
}

export function CmsBodyClient({
  className,
  collections,
  entry,
  introHeading,
  products,
}: CmsBodyClientProps) {
  const live = useLiveEntry(entry);
  return (
    <div {...editable(live)} className={cn(styles.body, className)}>
      {(live.fields.body ?? []).map((block) =>
        isImproveBlock(block) ? (
          <ImproveBlockView
            key={block._uid}
            block={block}
            collections={collections}
            introHeading={introHeading}
            products={products}
          />
        ) : (
          <CmsBlock
            key={block._uid}
            block={block}
            collections={collections}
            introHeading={introHeading}
            products={products}
          />
        ),
      )}
    </div>
  );
}

interface ImproveBlockViewProps extends Omit<CmsBlockProps, "block"> {
  block: ImproveBlock<CmsBodyBlock>;
}

function ImproveBlockView({ block, ...props }: ImproveBlockViewProps) {
  const variants = block.variants ?? {};
  const fallback =
    block.fallback && Object.hasOwn(variants, block.fallback)
      ? block.fallback
      : Object.keys(variants)[0];
  if (!fallback) return null;
  if (block.mode === "after-load") {
    return <AfterLoadVariants block={block} fallback={fallback} {...props} />;
  }
  return (
    <ImproveVariants
      fallback={fallback}
      kind={block.kind}
      slug={block.slug}
      variants={Object.fromEntries(
        Object.entries(variants).map(([option, blocks]) => [
          option,
          blocks.map((child) => <CmsBlock key={child._uid} block={child} {...props} />),
        ]),
      )}
    />
  );
}

interface AfterLoadVariantsProps extends ImproveBlockViewProps {
  fallback: string;
}

// Below the page type's fold only the fallback is in the markup; the visitor's variant swaps in after mount, and only then counts as seen.
const subscribeNoop = () => () => {};

function AfterLoadVariants({ block, fallback, ...props }: AfterLoadVariantsProps) {
  const { kind, slug, variants } = block;
  const chosen = useSyncExternalStore(
    subscribeNoop,
    () => document.documentElement.getAttribute(`data-imp-${slug}`),
    () => null,
  );
  const option = chosen && variants && Object.hasOwn(variants, chosen) ? chosen : fallback;
  useEffect(() => {
    if (option !== fallback) void recordExposure(kind, slug);
  }, [fallback, kind, option, slug]);
  return (variants?.[option] ?? []).map((child) => (
    <CmsBlock key={child._uid} block={child} {...props} />
  ));
}

interface CmsBlockProps {
  block: CmsBodyBlock;
  collections: CollectionWithThumbnail[];
  introHeading: "h1" | "h2";
  products: ProductCard[];
}

function CmsBlock({ block, collections, introHeading, products }: CmsBlockProps) {
  switch (block._type) {
    case "intro":
      return <IntroBlock block={block} heading={introHeading} />;
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

// Numbers counts clicks per block under its uid, which is what Content's canvas reads for each block's click rate.
function trackedBlock(block: { _uid: string }) {
  return { ...editable(block), "data-numbers-id": block._uid };
}

// Content stores what editors type, so only site paths, anchors and web, mail or phone links render.
const SAFE_HREF = /^(\/(?!\/)|#|https?:|mailto:|tel:)/i;

function safeHref(value: string | null | undefined) {
  return value && SAFE_HREF.test(value) ? value : null;
}

function href(link: Parameters<typeof linkHref>[0]) {
  return safeHref(linkHref(link, { url: (path) => (path === HOME_PATH ? "/" : `/${path}`) }));
}

function LinkMark({ children, mark }: RichTextMarkProps) {
  const target = safeHref(typeof mark.attrs?.href === "string" ? mark.attrs.href : null);
  if (!target) return <>{children}</>;
  return (
    <Link href={target} className={styles.linkMark}>
      {children}
    </Link>
  );
}

const RICH_TEXT_MARKS = { link: LinkMark };

interface ProseProps {
  document: Text["text"];
}

function Prose({ document }: ProseProps) {
  return (
    <div className={styles.prose}>
      <RichText document={document} marks={RICH_TEXT_MARKS} />
    </div>
  );
}

interface IntroBlockProps {
  block: Intro;
  heading: "h1" | "h2";
}

function IntroBlock({ block, heading: Heading }: IntroBlockProps) {
  return (
    <section {...trackedBlock(block)} className={styles.intro}>
      {block.heading ? <Heading className={styles.introHeading}>{block.heading}</Heading> : null}
      <div className={styles.introText}>
        <Prose document={block.text} />
      </div>
      {resolveBlocks(block.links).length > 0 ? (
        <nav aria-label={block.heading ?? "Links"} className={styles.introLinks}>
          {resolveBlocks(block.links).map((item) => {
            const target = href(item.link);
            return target ? (
              <Link
                key={item._uid}
                {...trackedBlock(item)}
                className={styles.introLink}
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

interface TextBlockProps {
  block: Text;
}

function TextBlock({ block }: TextBlockProps) {
  return (
    <section {...trackedBlock(block)} className={styles.text}>
      {block.heading ? <h2 className={styles.heading}>{block.heading}</h2> : null}
      <Prose document={block.text} />
    </section>
  );
}

// Content resizes and re-encodes its own assets, so Next's optimizer is skipped for them.
const contentImageLoader: ImageLoader = ({ quality, src, width }) =>
  imageUrl(src, { format: "auto", q: quality ?? 75, w: width });

const IMAGE_WIDTHS = { full: null, narrow: styles.narrow, wide: styles.wide } as const;

interface ImageBlockViewProps {
  block: ImageBlock;
}

function ImageBlockView({ block }: ImageBlockViewProps) {
  const { image } = block;
  if (!image?.width || !image.height) return null;
  const alt = typeof image.alt === "string" ? image.alt : (Object.values(image.alt ?? {})[0] ?? "");
  return (
    <figure
      {...trackedBlock(block)}
      className={cn(styles.image, IMAGE_WIDTHS[block.width ?? "wide"])}
    >
      <Image
        alt={alt}
        className={styles.media}
        height={image.height}
        loader={contentImageLoader}
        sizes="100vw"
        src={image.url}
        width={image.width}
      />
      {block.caption ? <figcaption className={styles.caption}>{block.caption}</figcaption> : null}
    </figure>
  );
}

interface QuoteBlockProps {
  block: Quote;
}

function QuoteBlock({ block }: QuoteBlockProps) {
  return (
    <figure {...trackedBlock(block)} className={styles.quote}>
      <blockquote className={styles.quoteText}>{block.quote}</blockquote>
      {block.attribution ? (
        <figcaption className={styles.attribution}>{block.attribution}</figcaption>
      ) : null}
    </figure>
  );
}

interface FeaturedSeriesBlockProps {
  block: FeaturedSeries;
  collections: CollectionWithThumbnail[];
}

function FeaturedSeriesBlock({ block, collections }: FeaturedSeriesBlockProps) {
  const picked = (block.collections ?? []).flatMap(
    (item) => collections.find(({ id }) => id === item.id) ?? [],
  );
  if (picked.length === 0) return null;
  return (
    <section {...trackedBlock(block)} className={styles.featuredSeries}>
      {block.heading ? <h2 className={styles.heading}>{block.heading}</h2> : null}
      <div className={styles.seriesGrid}>
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

interface FeaturedPrintBlockProps {
  block: FeaturedPrint;
  products: ProductCard[];
}

function FeaturedPrintBlock({ block, products }: FeaturedPrintBlockProps) {
  const product = products.find(({ id }) => id === block.product?.id);
  if (!product) return null;
  const image = product.featuredImage;
  return (
    <section {...trackedBlock(block)} className={styles.featuredPrint}>
      {image ? (
        <Image
          alt={image.altText || product.title}
          className={styles.media}
          height={image.height}
          sizes="100vw"
          src={image.url}
          width={image.width}
        />
      ) : null}
      <div className={styles.printDetails}>
        <h2 className={styles.printTitle}>{product.title}</h2>
        {block.text ? <p className={styles.printText}>{block.text}</p> : null}
        <p className={styles.printPrice}>
          From
          <Price
            amount={product.price.amount}
            currencyCode={product.price.currencyCode}
            className={styles.price}
          />
        </p>
        <Link className={styles.printLink} href={`/products/${product.handle}`}>
          View the print
        </Link>
      </div>
    </section>
  );
}
