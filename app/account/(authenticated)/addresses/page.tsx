import { Suspense } from "react";

import { AddressBook } from "@/components/account/address-book";
import { AccountPageHeader } from "@/components/account/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCustomerAddresses } from "@/lib/shopify/operations/customer/server";

import styles from "./page.module.css";

export default function AddressesPage() {
  return (
    <>
      <AccountPageHeader title="Addresses" description="Manage your saved addresses" />
      <Suspense fallback={<AddressesSkeleton />}>
        <AddressesContent />
      </Suspense>
    </>
  );
}

async function AddressesContent() {
  const addresses = await fetchCustomerAddresses();
  return <AddressBook addresses={addresses} />;
}

function AddressesSkeleton() {
  return (
    <div className={styles.skeleton}>
      <Skeleton className={styles.addButton} />
      <Skeleton className={styles.card} />
      <Skeleton className={styles.card} />
    </div>
  );
}
