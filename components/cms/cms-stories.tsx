import { editableCollection, editableProduct } from "@obelism/content";

import { getPrintPage, getSeriesPage, printPageQuery, seriesPageQuery } from "@/lib/cms/server";

import { CmsBody } from "./cms-body";
import { CmsEntry } from "./cms-entry";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface SeriesStoryProps {
  collection: { handle: string; id: string };
  searchParams: SearchParams;
}

// The collection marker lets an editor on the site add a series page where there is none yet.
export async function SeriesStory({ collection, searchParams }: SeriesStoryProps) {
  const published = await getSeriesPage(collection.id);
  return (
    <div {...editableCollection(collection)}>
      <CmsEntry
        published={published}
        query={seriesPageQuery(collection.id)}
        searchParams={searchParams}
      >
        {(entry) => (entry ? <CmsBody entry={entry} /> : null)}
      </CmsEntry>
    </div>
  );
}

interface PrintStoryProps {
  product: { handle: string; id: string };
  searchParams: SearchParams;
}

export async function PrintStory({ product, searchParams }: PrintStoryProps) {
  const published = await getPrintPage(product.id);
  return (
    <div {...editableProduct(product)}>
      <CmsEntry
        published={published}
        query={printPageQuery(product.id)}
        searchParams={searchParams}
      >
        {(entry) => (entry ? <CmsBody entry={entry} /> : null)}
      </CmsEntry>
    </div>
  );
}
