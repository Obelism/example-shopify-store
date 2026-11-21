import type { ReactNode } from "react";

import { ImproveExposure } from "./improve-client";

interface ImproveVariantsProps {
  fallback: string;
  kind: "flag" | "test";
  slug: string;
  variants: Record<string, ReactNode>;
}

// Every option is in the page; the head's CSS shows the visitor's, or the fallback when the test isn't running.
export function ImproveVariants({ fallback, kind, slug, variants }: ImproveVariantsProps) {
  return (
    <div data-ob-group={slug}>
      {Object.entries(variants).map(([option, children]) => (
        <div
          key={option}
          data-ob-default={option === fallback ? "" : undefined}
          data-ob-imp={slug}
          data-ob-opt={option}
        >
          {children}
        </div>
      ))}
      <ImproveExposure kind={kind} slug={slug} />
    </div>
  );
}
