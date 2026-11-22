import { createShopifyRequestContext, handleShopifyRedirects } from "@shopify/hydrogen";
import { headers } from "next/headers";
import { permanentRedirect, redirect } from "next/navigation";
import { Suspense } from "react";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { shopConfig } from "@/lib/config";
import { SHOPIFY_ROUTE_TEMPLATES } from "@/lib/shopify/routing";
import { createRequestStorefrontClient } from "@/lib/shopify/storefront/server";

import styles from "./not-found.module.css";

export default function NotFoundError() {
  return (
    <Page className={styles.page}>
      {shopConfig.redirects.shopifyNotFound.isEnabled ? (
        <Suspense fallback={null}>
          <ShopifyNotFoundRedirect />
        </Suspense>
      ) : null}
      <Container className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Page Not Found</h1>
          <p className={styles.description}>
            The link may be incorrect, or the page has been removed.
          </p>
          <Link href="/search" className={styles.action}>
            Continue Shopping
          </Link>
        </div>
      </Container>
    </Page>
  );
}

async function ShopifyNotFoundRedirect() {
  const requestHeaders = await headers();
  const url = requestHeaders.get("x-storefront-url");
  if (!url) return null;

  const request = new Request(url, { headers: requestHeaders });
  const requestContext = createShopifyRequestContext({
    i18n: shopConfig.localization,
    request,
  });
  const response = await handleShopifyRedirects({
    request,
    routeTemplates: SHOPIFY_ROUTE_TEMPLATES,
    storefrontClient: createRequestStorefrontClient(requestContext),
  });
  if (!response) return null;
  const location = response.headers.get("location");
  if (!location) return null;

  if (response.status === 301 || response.status === 308) permanentRedirect(location);
  redirect(location);
}
