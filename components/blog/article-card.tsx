import Image from "next/image";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Link } from "@/components/ui/link";
import type { BlogArticle } from "@/lib/blog/types";
import { shopConfig } from "@/lib/config";

import styles from "./article-card.module.css";

export interface ArticleCardProps {
  article: BlogArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const href = `/blogs/${article.blogHandle}/${article.handle}`;
  const publishedAt = new Intl.DateTimeFormat(shopConfig.localization.locale, {
    dateStyle: "long",
  }).format(new Date(article.publishedAt));
  return (
    <article className={styles.card}>
      <Link className={styles.media} href={href}>
        {article.image ? (
          <Image
            alt={article.image.altText}
            className={styles.image}
            fill
            sizes="100vw"
            src={article.image.url}
          />
        ) : (
          <ImagePlaceholder className={styles.placeholder} />
        )}
      </Link>
      <div className={styles.body}>
        <time className={styles.date} dateTime={article.publishedAt}>
          {publishedAt}
        </time>
        <h2 className={styles.title}>
          <Link className={styles.titleLink} href={href}>
            {article.title}
          </Link>
        </h2>
        {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
      </div>
    </article>
  );
}
