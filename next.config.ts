import type { NextConfig } from "next";

import { HOME_PATH } from "./lib/cms";
import { withShopConfig } from "./lib/config/server";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async headers() {
    return [
      {
        // Obelism Content's canvas shows the site in a frame.
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://content.obelism.studio",
          },
        ],
        source: "/:path*",
      },
    ];
  },
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
  async redirects() {
    // Content's canvas opens the home entry at its path.
    return [{ destination: "/", permanent: false, source: `/${HOME_PATH}` }];
  },
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
