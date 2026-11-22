import { Icon } from "@/components/ui/icon";

import styles from "./demo-store-notice.module.css";

export function DemoStoreNotice() {
  return (
    <div role="note" className={styles.notice}>
      <Icon name="triangle-alert" className={styles.icon} size={16} />
      <div className={styles.text}>
        <p className={styles.title}>This is a demo store</p>
        <p>Orders are never shipped, and you won&apos;t receive any prints.</p>
      </div>
    </div>
  );
}
