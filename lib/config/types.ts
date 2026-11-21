import type { ConsentConfig, I18nConfig } from "@shopify/hydrogen";
import type { NextConfig } from "next";

export type CommerceLocale = Pick<I18nConfig, "country" | "language">;

export interface NextConfigContext {
  defaultConfig: NextConfig;
}

export type NextConfigFactory = (
  phase: string,
  context: NextConfigContext,
) => NextConfig | Promise<NextConfig>;

export type NextConfigInput = NextConfig | NextConfigFactory;

export type NextConfigPlugin = (config: NextConfig) => NextConfigInput | Promise<NextConfigInput>;

export interface ShopConfig {
  analytics: {
    numbers: {
      isEnabled: boolean;
    };
    shopify: {
      consent: {
        isEnabled: boolean;
        mode: NonNullable<ConsentConfig["mode"]>;
      };
      isEnabled: boolean;
    };
    speedInsights: {
      isEnabled: boolean;
    };
    vercel: {
      isEnabled: boolean;
    };
  };
  auth: {
    isEnabled: boolean;
  };
  localization: CommerceLocale & {
    locale: string;
  };
  pdp: {
    bundles: {
      isEnabled: boolean;
    };
    buyWithShop: {
      isEnabled: boolean;
    };
    complementaryProducts: {
      isEnabled: boolean;
    };
    quantityPicker: {
      isEnabled: boolean;
    };
    relatedProducts: {
      isEnabled: boolean;
    };
  };
  redirects: {
    shopifyNotFound: {
      isEnabled: boolean;
    };
  };
  search: {
    isEnabled: boolean;
  };
  shopify: {
    webmcp: {
      isEnabled: boolean;
    };
  };
  site: {
    description: string;
    name: string;
    url: string;
  };
}
