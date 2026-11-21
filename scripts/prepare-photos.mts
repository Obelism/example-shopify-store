import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";

import { printHandle, selectPrints, slugify } from "./catalog/index.mts";

const { values: args } = parseArgs({
  options: {
    in: { type: "string" },
    only: { multiple: true, type: "string" },
    out: { type: "string" },
  },
});
if (!args.in || !args.out) {
  throw new Error(
    "Usage: node scripts/prepare-photos.mts --in <originals> --out <dir> [--only <handle>]",
  );
}

const MAX_PIXELS = 24_000_000;

const outDir = resolve(args.out);
mkdirSync(outDir, { recursive: true });

for (const print of selectPrints(args.only)) {
  const image = slugify(print.source.slice(0, -extname(print.source).length));
  const target = join(outDir, `${printHandle(print)}__${image}.jpg`);
  // Shopify refuses images over 25 MP; ICC is the only profile kept, so GPS and camera details go.
  execFileSync("magick", [
    join(resolve(args.in), print.source),
    "-auto-orient",
    "-resize",
    `${MAX_PIXELS}@>`,
    "+profile",
    "!icc,*",
    "-quality",
    "92",
    target,
  ]);
  console.log(target);
}
