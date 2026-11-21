import type { ContentClient, Entry, ImproveBlock } from "@obelism/content";

import type {
  FeaturedPrint,
  FeaturedSeries,
  Image,
  Intro,
  Quote,
  Text,
} from "@/content/content-types";

export type CmsQuery<TEntry> = (client: ContentClient) => Promise<TEntry | null>;

export type CmsBodyBlock = FeaturedPrint | FeaturedSeries | Image | Intro | Quote | Text;

export type CmsBodyEntry = Entry<{ body: (CmsBodyBlock | ImproveBlock<CmsBodyBlock>)[] | null }>;
