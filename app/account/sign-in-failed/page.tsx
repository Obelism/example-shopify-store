import { cn } from "cn";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";

import styles from "./page.module.css";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Sign-in failed",
};

export default function SignInFailedPage() {
  if (!shopConfig.auth.isEnabled) notFound();

  return (
    <Page className={styles.page}>
      <Container className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Sign-in failed</h1>
          <p className={styles.description}>
            Your sign-in didn’t finish. Try again, or keep shopping without an account.
          </p>
          <div className={styles.actions}>
            {/* oxlint-disable-next-line next/no-html-link-for-pages -- Sign-in must be a full document navigation so the proxy can start OAuth. */}
            <a href="/account/login" className={cn(styles.action, styles.retry)}>
              Try again
            </a>
            <Link href="/" className={cn(styles.action, styles.continue)}>
              Continue shopping
            </Link>
          </div>
        </div>
      </Container>
    </Page>
  );
}
