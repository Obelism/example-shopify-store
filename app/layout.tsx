import { cn } from "cn";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";

import "./globals.css";
import { Suspense } from "react";
import { preload } from "react-dom";

import { AnalyticsComponents } from "@/components/analytics";
import { CartUI } from "@/components/cart/cart-ui";
import { CartProviderWrapper } from "@/components/cart/context";
import { CartStandardActionsScript } from "@/components/cart/standard-actions";
import { CmsBridge } from "@/components/cms/cms-bridge";
import { Footer } from "@/components/footer";
import { ImproveHead } from "@/components/improve/improve-head";
import { ImproveVariants } from "@/components/improve/improve-variants";
import { Nav } from "@/components/nav";
import { SiteSchema } from "@/components/schema/site-schema";
import { seedCartData } from "@/lib/cart/server";
import { shopConfig } from "@/lib/config";
import { getIconUrl, iconConfig, SvgProvider } from "@/lib/icons";

import styles from "./layout.module.css";

export const ensureStatic = "prefetch";

export const viewport: Viewport = {
  themeColor: "#f7f5f0",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-newsreader",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Un-awaited: the promise streams to the client provider; never block the shell on it.
  const cartData = seedCartData();
  for (const icon of ["handbag", "menu", "search"] as const) {
    preload(getIconUrl(icon), { as: "fetch", crossOrigin: "anonymous" });
  }
  return (
    // Improve's head script marks <html> with the visitor's variants before hydration.
    <html lang={shopConfig.localization.locale} suppressHydrationWarning>
      <head>
        <CartStandardActionsScript />
        <ImproveHead />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} ${styles.body}`}
      >
        <a href="#main-content" className={cn(styles.skipLink, "sr-only")}>
          Skip to content
        </a>
        <SiteSchema />
        <CmsBridge />

        <ImproveVariants
          fallback="off"
          kind="flag"
          slug="shipping-banner"
          variants={{
            off: null,
            on: (
              <p className={styles.shippingBanner}>
                Free shipping on every framed print this month.
              </p>
            ),
          }}
        />
        <SvgProvider config={iconConfig}>
          <CartProviderWrapper cartData={cartData}>
            <Nav />
            <main id="main-content" className={styles.main}>
              {children}
            </main>
            <Footer />
            <CartUI />
            <Suspense>
              <AnalyticsComponents />
            </Suspense>
          </CartProviderWrapper>
        </SvgProvider>
      </body>
    </html>
  );
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    description: shopConfig.site.description,
    generator: shopConfig.site.name,
    metadataBase: new URL(shopConfig.site.url),
    openGraph: {
      images: [{ url: "/og-default.png", width: 1200, height: 628 }],
    },
    title: {
      default: shopConfig.site.name,
      template: `%s | ${shopConfig.site.name}`,
    },
  };
};
