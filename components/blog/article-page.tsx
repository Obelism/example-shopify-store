import Image from "next/image";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Prose } from "@/components/ui/prose";
import { Sections } from "@/components/ui/sections";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlogArticle } from "@/lib/blog/types";
import { shopConfig } from "@/lib/config";

import styles from "./article-page.module.css";

export interface ArticlePageProps {
  article: BlogArticle;
}

export function ArticlePageSkeleton() {
  return (
    <Page aria-busy="true">
      <Container className={styles.container}>
        <Sections className={styles.sections}>
          <div className={styles.headerSkeleton}>
            <Skeleton className={styles.blogSkeleton} />
            <Skeleton className={styles.titleSkeleton} />
            <Skeleton className={styles.metaSkeleton} />
          </div>
          <Skeleton className={styles.imageSkeleton} />
          <div className={styles.bodySkeleton}>
            <Skeleton className={styles.lineSkeleton} />
            <Skeleton className={styles.lineSkeleton} />
            <Skeleton className={styles.lineShortSkeleton} />
          </div>
        </Sections>
      </Container>
    </Page>
  );
}

export function ArticlePage({ article }: ArticlePageProps) {
  const publishedAt = new Intl.DateTimeFormat(shopConfig.localization.locale, {
    dateStyle: "long",
  }).format(new Date(article.publishedAt));
  return (
    <Page>
      <Container className={styles.container}>
        <Sections className={styles.sections}>
          <header className={styles.header}>
            <Link className={styles.blogLink} href={`/blogs/${article.blogHandle}`}>
              {article.blogTitle}
            </Link>
            <h1 className={styles.title}>{article.title}</h1>
            <div className={styles.meta}>
              {article.author && <span>{article.author}</span>}
              {article.author && <span aria-hidden>·</span>}
              <time dateTime={article.publishedAt}>{publishedAt}</time>
            </div>
          </header>
          {article.image && (
            <div className={styles.media}>
              <Image
                alt={article.image.altText}
                className={styles.image}
                fetchPriority="high"
                fill
                loading="eager"
                preload
                sizes="100vw"
                src={article.image.url}
              />
            </div>
          )}
          <Prose className={styles.body}>
            <div
              // oxlint-disable-next-line react/no-danger -- Article bodies pass through sanitizeShopifyHtml when fetched.
              dangerouslySetInnerHTML={{ __html: article.body ?? "" }}
            />
          </Prose>
        </Sections>
      </Container>
    </Page>
  );
}
