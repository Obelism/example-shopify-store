import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Prose } from "@/components/ui/prose";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./rich-text-page.module.css";

interface RichTextPageProps {
  body: string;
  title: string;
}

export function RichTextPage({ body, title }: RichTextPageProps) {
  return (
    <Page>
      <Container className={styles.container}>
        <Prose>
          <h1>{title}</h1>
          <div
            // oxlint-disable-next-line react/no-danger -- Page and policy bodies pass through sanitizeShopifyHtml when fetched.
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </Prose>
      </Container>
    </Page>
  );
}

export function RichTextPageSkeleton() {
  return (
    <Page aria-busy="true">
      <Container className={styles.container}>
        <div className={styles.skeleton}>
          <Skeleton className={styles.skeletonTitle} />
          <div className={styles.skeletonBody}>
            <Skeleton className={styles.skeletonLine} />
            <Skeleton className={styles.skeletonLine} />
            <Skeleton className={styles.skeletonLastLine} />
          </div>
        </div>
      </Container>
    </Page>
  );
}
