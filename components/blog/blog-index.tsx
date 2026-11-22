import { ArticleCard } from "@/components/blog/article-card";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { Skeleton } from "@/components/ui/skeleton";
import type { Blog } from "@/lib/blog/types";

import styles from "./blog-index.module.css";

export interface BlogIndexProps {
  blog: Blog;
}

export function BlogIndex({ blog }: BlogIndexProps) {
  return (
    <Page className={styles.page}>
      <Container>
        <Sections className={styles.sections}>
          <h1 className={styles.title}>{blog.title}</h1>
          {blog.articles.length > 0 ? (
            <div className={styles.grid}>
              {blog.articles.map((article) => (
                <ArticleCard article={article} key={article.handle} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>No articles found.</p>
          )}
        </Sections>
      </Container>
    </Page>
  );
}

export function BlogIndexSkeleton() {
  return (
    <Page aria-busy="true" className={styles.page}>
      <Container>
        <Sections className={styles.sections}>
          <Skeleton className={styles.titleSkeleton} />
          <div className={styles.grid}>
            {[0, 1, 2].map((index) => (
              <div className={styles.cardSkeleton} key={index}>
                <Skeleton className={styles.imageSkeleton} />
                <div className={styles.cardBodySkeleton}>
                  <Skeleton className={styles.dateSkeleton} />
                  <Skeleton className={styles.cardTitleSkeleton} />
                  <Skeleton className={styles.excerptSkeleton} />
                </div>
              </div>
            ))}
          </div>
        </Sections>
      </Container>
    </Page>
  );
}
