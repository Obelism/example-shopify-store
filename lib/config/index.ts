import type { ShopConfig } from "./types";

const defaultUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const shopConfig = {
  analytics: {
    numbers: {
      isEnabled: true,
    },
    shopify: {
      consent: {
        isEnabled: false,
        mode: "default-banner",
      },
      isEnabled: false,
    },
    speedInsights: {
      isEnabled: false,
    },
    vercel: {
      isEnabled: false,
    },
  },
  auth: {
    isEnabled: false,
  },
  localization: {
    country: "US",
    language: "EN",
    locale: "en-US" as const,
  },
  pdp: {
    bundles: {
      isEnabled: false,
    },
    buyWithShop: {
      isEnabled: false,
    },
    complementaryProducts: {
      isEnabled: false,
    },
    quantityPicker: {
      isEnabled: false,
    },
    relatedProducts: {
      isEnabled: true,
    },
  },
  redirects: {
    shopifyNotFound: {
      isEnabled: false,
    },
  },
  search: {
    isEnabled: true,
  },
  shopify: {
    webmcp: {
      isEnabled: false,
    },
  },
  site: {
    description:
      "Fine art prints by Noor Halde: mountains, forests, coasts and cities, printed on archival paper.",
    name: "Noor Halde",
    url: defaultUrl,
  },
} satisfies ShopConfig;

export const isShopifyScriptsEnabled =
  shopConfig.analytics.shopify.isEnabled ||
  shopConfig.analytics.shopify.consent.isEnabled ||
  shopConfig.shopify.webmcp.isEnabled;
