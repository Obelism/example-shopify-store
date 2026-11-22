"use client";

import "./globals.css";
import { Icon } from "@/components/ui/icon";

import styles from "./global-error.module.css";

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className={styles.root}>
          <div className={styles.iconWrapper}>
            <div className={styles.iconCircle}>
              <Icon name="circle-alert" standalone size={48} className={styles.icon} />
            </div>
          </div>
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.description}>An unexpected error occurred. Please try again.</p>
          <button type="button" onClick={() => retry()} className={styles.retry}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
