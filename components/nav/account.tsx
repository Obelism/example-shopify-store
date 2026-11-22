import { Icon } from "@/components/ui/icon";
import { Link } from "@/components/ui/link";
import { isCustomerLoggedIn } from "@/lib/auth/server";

import styles from "./account.module.css";

export async function NavAccount() {
  const loggedIn = await isCustomerLoggedIn();
  if (!loggedIn) {
    return (
      // oxlint-disable-next-line next/no-html-link-for-pages -- Sign-in must be a full document navigation that is never prefetched, because the proxy starts OAuth.
      <a href="/account/login" className={styles.link}>
        <Icon name="user-round" size={20} />
        <span className="sr-only">Sign in</span>
      </a>
    );
  }
  return (
    <Link href="/account" className={styles.link}>
      <Icon name="user-round-check" size={20} />
      <span className="sr-only">Account</span>
    </Link>
  );
}

export function NavAccountFallback() {
  return (
    <span className={styles.fallback}>
      <Icon name="user-round" size={20} />
    </span>
  );
}
