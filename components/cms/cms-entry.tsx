import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import { readDraft } from "@/lib/cms/server";
import type { CmsQuery } from "@/lib/cms/types";

interface CmsEntryProps<TEntry> {
  children: (entry: TEntry) => ReactNode;
  published: TEntry | null;
  query: CmsQuery<TEntry>;
  /** Without a published entry or a draft, answer 404. */
  required?: boolean;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// The published entry renders once, in the static shell. The dynamic part stays empty unless an editor's token brings a draft, which then hides the published copy.
export function CmsEntry<TEntry>({
  children,
  published,
  query,
  required,
  searchParams,
}: CmsEntryProps<TEntry>) {
  return (
    <div className="group/cms-entry">
      <Suspense fallback={null}>
        <DraftEntry
          published={published}
          query={query}
          required={required}
          searchParams={searchParams}
        >
          {children}
        </DraftEntry>
      </Suspense>
      {published ? (
        <div className="group-has-data-cms-draft/cms-entry:hidden">{children(published)}</div>
      ) : null}
    </div>
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
  if (required && !draft?.entry && !published) notFound();
  if (!draft?.entry) return null;
  return <div data-cms-draft="">{children(draft.entry)}</div>;
}
