"use client";

import { usePathname } from "next/navigation";

import { Link } from "@/components/ui/link";

import styles from "./sidebar-client.module.css";

interface AccountSidebarLink {
  href: string;
  label: string;
}

export function SidebarClient({ links }: { links: AccountSidebarLink[] }) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={styles.link}
          data-active={pathname.startsWith(link.href)}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
