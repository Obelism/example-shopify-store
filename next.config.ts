import type { NextConfig } from "next";

import { withShopConfig } from "./lib/config/server";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    deviceSizes: [1320, 1920],
    imageSizes: [],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        hostname: "cdn.shopify.com",
        protocol: "https",
      },
    ],
    unoptimized: !!process.env.V0_CALLBACK_URL,
  },
  partialPrefetching: true,
  // The `powered-by` header from lib/auth/request.ts already names Next.js.
  poweredByHeader: false,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        as: "*.css",
        loaders: ["@tailwindcss/turbopack"],
      },
    },
  },
};

export default withShopConfig(nextConfig);
