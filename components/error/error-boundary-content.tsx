"use client";

import { Button, buttonClassName } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/components/ui/link";

import styles from "./error-boundary-content.module.css";

export function ErrorBoundaryContent({ retry }: { retry: () => void }) {
  return (
    <div className={styles.root}>
      <div className={styles.iconWrapper}>
        <div className={styles.iconCircle}>
          <Icon name="circle-alert" className={styles.icon} size={48} />
        </div>
      </div>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.description}>An unexpected error occurred. Please try again.</p>
      <div className={styles.actions}>
        <Button onClick={() => retry()}>Try again</Button>
        <Link className={buttonClassName({ variant: "outline" })} href="/">
          Go back to the home page
        </Link>
      </div>
    </div>
  );
}
