import { PredictiveSearchProvider } from "@shopify/hydrogen/react";
import { Suspense } from "react";

import { ThemeSelect } from "@/components/theme/theme-select";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";
import type { MenuItem } from "@/lib/menu/types";

import { NavAccount, NavAccountFallback } from "./account";
import { CartIcon, CartIconFallback } from "./cart";
import { MobileMenu } from "./mobile-menu";
import { QuickLinks } from "./quick-links";
import { SearchModal } from "./search-modal";

import styles from "./index.module.css";

export function Nav() {
  const items: MenuItem[] = [
    { id: "nav-work", items: [], title: "Work", url: "/" },
    { id: "nav-series", items: [], title: "Series", url: "/collections" },
    { id: "nav-index", items: [], title: "Index", url: "/works" },
  ];
  return (
    <nav className={styles.nav} id="nav-outer">
      <Container className={styles.bar}>
        <MobileMenu items={items} />

        <Link className={styles.home} href="/">
          <span className={styles.siteName}>{shopConfig.site.name}</span>
        </Link>

        <QuickLinks items={items} />

        <div className={styles.actions}>
          <ThemeSelect />
          {shopConfig.search.isEnabled && (
            <PredictiveSearchProvider
              debounceInMs={300}
              limit={3}
              types={["PRODUCT", "COLLECTION", "QUERY"]}
            >
              <SearchModal />
            </PredictiveSearchProvider>
          )}
          {shopConfig.auth.isEnabled && (
            <Suspense fallback={<NavAccountFallback />}>
              <NavAccount />
            </Suspense>
          )}
          <Suspense fallback={<CartIconFallback />}>
            <CartIcon />
          </Suspense>
        </div>
      </Container>
    </nav>
  );
}
