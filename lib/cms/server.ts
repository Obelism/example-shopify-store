import { ContentApiError, ContentClient, readPreviewParams } from "@obelism/content";
import { readSiteToken } from "@obelism/content/site";
import { cacheLife, cacheTag } from "next/cache";
import { cookies, draftMode } from "next/headers";

import type { Page, PrintPage, SeriesPage } from "@/content/content-types";

import { HOME_PATH } from "./index";
import type { CmsQuery } from "./types";

type SearchParams = Record<string, string | string[] | undefined>;

const space = process.env.CONTENT_SPACE_ID;
const environment = process.env.CONTENT_ENVIRONMENT;

const delivery = new ContentClient({
  environment,
  space,
  // Required at dev, build and start by lib/config/server.ts; `next typegen` loads this without it.
  token: process.env.CONTENT_DELIVERY_TOKEN ?? "",
});

export const pageQuery =
  (path: string): CmsQuery<Page> =>
  (client) =>
    client.getPage<Page>(path, { depth: 2 });

export const seriesPageQuery =
  (collectionId: string): CmsQuery<SeriesPage> =>
  (client) =>
    client.getFirstEntry<SeriesPage>({
      contentType: "seriesPage",
      depth: 2,
      fields: { collection: collectionId },
    });

export const printPageQuery =
  (productId: string): CmsQuery<PrintPage> =>
  (client) =>
    client.getFirstEntry<PrintPage>({
      contentType: "printPage",
      depth: 2,
      fields: { product: productId },
    });

export async function getCmsPage(path: string): Promise<Page | null> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("cms");
  return pageQuery(path)(delivery);
}

export async function getSeriesPage(collectionId: string): Promise<SeriesPage | null> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("cms");
  return seriesPageQuery(collectionId)(delivery);
}

export async function getPrintPage(productId: string): Promise<PrintPage | null> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("cms");
  return printPageQuery(productId)(delivery);
}

export async function getCmsPagePaths(): Promise<string[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("cms");
  const { items } = await delivery.getEntries<Page>({ contentType: "page", limit: 100 });
  return items.flatMap((entry) => (entry.path && entry.path !== HOME_PATH ? [entry.path] : []));
}

// Drafts come only with the editor's own token: the canvas's `cms_token`, or the site-editing cookie in draft mode. `cms_preview` alone proves nothing.
async function getDraftClient(searchParams: SearchParams): Promise<ContentClient | null> {
  // Without a space and environment the API would accept a token from any space.
  if (!space || !environment) return null;
  const preview = readPreviewParams(searchParams);
  let token = preview?.token ?? null;
  if (!token && (await draftMode()).isEnabled) token = readSiteToken(await cookies()) ?? null;
  if (!token) return null;
  return new ContentClient({
    environment,
    init: { cache: "no-store" },
    release: preview?.release ?? undefined,
    space,
    token,
  });
}

export async function readDraft<TEntry>(
  searchParams: SearchParams,
  query: CmsQuery<TEntry>,
): Promise<{ entry: TEntry | null } | null> {
  const client = await getDraftClient(searchParams);
  if (!client) return null;
  try {
    return { entry: await query(client) };
  } catch (error) {
    if (error instanceof ContentApiError && error.status === 401) {
      console.warn("Content refused the draft token: 401");
      return null;
    }
    throw error;
  }
}
