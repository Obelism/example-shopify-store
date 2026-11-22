import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { AccountMobileTabs } from "@/components/account/mobile-tabs";
import { AccountSidebar } from "@/components/account/sidebar";
import { SignOutButton } from "@/components/account/sign-out-button";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { Skeleton } from "@/components/ui/skeleton";
import { getCustomerAccessToken, requireCustomerSession } from "@/lib/auth/server";
import { shopConfig } from "@/lib/config";
import { getCustomerProfile } from "@/lib/shopify/operations/customer/server";

import styles from "./layout.module.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Account",
    robots: { index: false, follow: false },
  };
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <Page className={styles.page}>
      <Container className={styles.container}>
        <aside className={styles.aside}>
          <div className={styles.asideInner}>
            <Suspense fallback={<AccountLabelSkeleton />}>
              <AccountLabel />
            </Suspense>
            <Suspense fallback={<SidebarSkeleton />}>
              <AccountSidebar />
            </Suspense>
            <SignOutButton />
          </div>
        </aside>

        <div className={styles.main}>
          <div className={styles.mobileHeader}>
            <Suspense fallback={<AccountLabelSkeleton />}>
              <AccountLabel />
            </Suspense>
            <SignOutButton />
          </div>
          <Suspense>
            <AccountMobileTabs />
          </Suspense>
          <Sections className={styles.sections}>
            <Suspense>
              <AccountGate>{children}</AccountGate>
            </Suspense>
          </Sections>
        </div>
      </Container>
    </Page>
  );
}

async function AccountGate({ children }: { children: ReactNode }) {
  if (!shopConfig.auth.isEnabled) notFound();
  await requireCustomerSession();
  return <>{children}</>;
}

async function AccountLabel() {
  if (!shopConfig.auth.isEnabled) notFound();
  await requireCustomerSession();
  const accessToken = await getCustomerAccessToken();
  if (!accessToken) {
    return <p className={styles.name}>Account</p>;
  }
  const profile = await getCustomerProfile();
  if (!profile) return null;
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  return (
    <div>
      <p className={styles.name}>{name || profile.email}</p>
      <p className={styles.email}>{profile.email}</p>
    </div>
  );
}

function AccountLabelSkeleton() {
  return (
    <div className={styles.labelSkeleton}>
      <Skeleton className={styles.nameSkeleton} />
      <Skeleton className={styles.emailSkeleton} />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className={styles.sidebarSkeleton}>
      <Skeleton className={styles.linkSkeleton} />
      <Skeleton className={styles.linkSkeleton} />
      <Skeleton className={styles.linkSkeleton} />
    </div>
  );
}
