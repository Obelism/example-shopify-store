"use client";

import { usePathname } from "next/navigation";

import { Link } from "@/components/ui/link";

import styles from "./mobile-tabs-client.module.css";

interface AccountTab {
  href: string;
  label: string;
}

export function MobileTabsClient({ tabs }: { tabs: AccountTab[] }) {
  const pathname = usePathname();

  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={styles.tab}
          data-active={pathname.startsWith(tab.href)}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
