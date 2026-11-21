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

const outDir = resolve(args.out);
mkdirSync(outDir, { recursive: true });

for (const print of selectPrints(args.only)) {
  const image = slugify(print.source.slice(0, -extname(print.source).length));
  const target = join(outDir, `${printHandle(print)}__${image}.jpg`);
  // Rewrites only the metadata, so the image data stays as shot; GPS and camera details go, the colour profile and orientation stay.
  execFileSync("exiftool", [
    "-q",
    "-all=",
    "-tagsFromFile",
    "@",
    "-ICC_Profile",
    "-Orientation",
    "-o",
    target,
    join(resolve(args.in), print.source),
  ]);
  console.log(target);
}
