import { Suspense } from "react";

import { AccountPageHeader } from "@/components/account/page-header";
import { ProfileForm } from "@/components/account/profile-form";
import { Skeleton } from "@/components/ui/skeleton";
import { getCustomerProfile } from "@/lib/shopify/operations/customer/server";

import styles from "./page.module.css";

export default function ProfilePage() {
  return (
    <>
      <AccountPageHeader title="Profile" description="Your account information" />
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </>
  );
}

async function ProfileContent() {
  const profile = await getCustomerProfile();
  if (!profile) return null;
  return (
    <ProfileForm
      labels={{
        email: "Email",
        firstName: "First name",
        lastName: "Last name",
        profileUpdated: "Profile updated",
        save: "Save",
      }}
      profile={profile}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.names}>
        <div className={styles.field}>
          <Skeleton className={styles.label} />
          <Skeleton className={styles.input} />
        </div>
        <div className={styles.field}>
          <Skeleton className={styles.label} />
          <Skeleton className={styles.input} />
        </div>
      </div>
      <div className={styles.field}>
        <Skeleton className={styles.label} />
        <Skeleton className={styles.input} />
      </div>
      <Skeleton className={styles.button} />
    </div>
  );
}
