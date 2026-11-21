import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";

import "./globals.css";
import { Suspense } from "react";

import { AnalyticsComponents } from "@/components/analytics";
import { CartUI } from "@/components/cart/cart-ui";
import { CartProviderWrapper } from "@/components/cart/context";
import { CartStandardActionsScript } from "@/components/cart/standard-actions";
import { CmsBridge } from "@/components/cms/cms-bridge";
import { Footer } from "@/components/footer";
import { ImproveSync } from "@/components/improve/improve-client";
import { ImproveHead } from "@/components/improve/improve-head";
import { ImproveVariants } from "@/components/improve/improve-variants";
import { Nav } from "@/components/nav";
import { SiteSchema } from "@/components/schema/site-schema";
import { seedCartData } from "@/lib/cart/server";
import { shopConfig } from "@/lib/config";

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
  return (
    // Improve's head script marks <html> with the visitor's variants before hydration.
    <html lang={shopConfig.localization.locale} suppressHydrationWarning>
      <head>
        <CartStandardActionsScript />
        <ImproveHead />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} flex min-h-dvh flex-col font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-background focus:px-5 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-foreground focus:outline-none"
        >
          Skip to content
        </a>
        <SiteSchema />
        <CmsBridge />

        <CartProviderWrapper cartData={cartData}>
          <ImproveVariants
            fallback="off"
            kind="flag"
            slug="shipping-banner"
            variants={{
              off: null,
              on: (
                <p className="bg-foreground px-5 py-2 text-center text-xs text-background">
                  Free shipping on every framed print this month.
                </p>
              ),
            }}
          />
          <Nav />
          <main id="main-content" className="flex flex-1 flex-col min-w-0">
            {children}
          </main>
          <Footer />
          <CartUI />
          <Suspense>
            <AnalyticsComponents />
          </Suspense>
          <Suspense>
            <ImproveSync />
          </Suspense>
        </CartProviderWrapper>
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
