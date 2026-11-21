import { getImproveSubjects, IMPROVE_HEAD_SCRIPT, improveHead } from "@/lib/improve";
import { getImproveConfig } from "@/lib/improve/server";

export async function ImproveHead() {
  const { meta, style } = improveHead(getImproveSubjects(await getImproveConfig()));
  return (
    <>
      <meta name="obelism-improve" content={meta} />
      {/* oxlint-disable-next-line react/no-danger -- A constant script; it must run inline, before the body paints. */}
      <script dangerouslySetInnerHTML={{ __html: IMPROVE_HEAD_SCRIPT }} />
      {/* oxlint-disable-next-line react/no-danger -- Built only from slugs and options that passed the SAFE pattern. */}
      <style dangerouslySetInnerHTML={{ __html: style }} />
    </>
  );
}
