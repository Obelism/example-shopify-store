"use client";

import { ContentBridge } from "@obelism/content-react";

import { HOME_PATH } from "@/lib/cms";

const pagePath = (path: string) => (path === HOME_PATH ? "/" : `/${path}`);

export function CmsBridge() {
  return <ContentBridge pagePath={pagePath} />;
}
