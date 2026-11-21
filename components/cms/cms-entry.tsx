import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { type CmsQuery, readDraft } from "@/lib/cms/server";

interface CmsEntryProps<TEntry> {
  children: (entry: TEntry | null) => ReactNode;
  published: TEntry | null;
  query: CmsQuery<TEntry>;
  /** Without a published entry or a draft, answer 404. */
  required?: boolean;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// The published entry renders in the static shell; only a request with an editor's token swaps in the draft.
export function CmsEntry<TEntry>({
  children,
  published,
  query,
  required,
  searchParams,
}: CmsEntryProps<TEntry>) {
  return (
    <Suspense fallback={children(published)}>
      <DraftEntry
        published={published}
        query={query}
        required={required}
        searchParams={searchParams}
      >
        {children}
      </DraftEntry>
    </Suspense>
  );
}

async function DraftEntry<TEntry>({
  children,
  published,
  query,
  required,
  searchParams,
}: CmsEntryProps<TEntry>) {
  const draft = await readDraft(await searchParams, query);
  const entry = draft ? draft.entry : published;
  if (required && !entry) notFound();
  return children(entry);
}
