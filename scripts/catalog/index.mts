import { readFileSync } from "node:fs";

export interface Series {
  description: string;
  handle: string;
  title: string;
}

export interface Print {
  alt: string;
  series: string;
  source: string;
  title: string;
}

type SizeKey = "large" | "medium" | "small";

export interface Catalog {
  photographer: string;
  prints: Print[];
  series: Series[];
  variants: {
    frame: { name: string; surcharge: Record<SizeKey, number> }[];
    paper: { name: string; surcharge: Record<SizeKey, number> }[];
    size: { key: SizeKey; name: string; price: number }[];
  };
}

export const catalog: Catalog = JSON.parse(
  readFileSync(new URL("./catalog.json", import.meta.url), "utf8"),
);

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function printHandle(print: Print) {
  return slugify(print.title);
}

export function selectPrints(only: string[] | undefined) {
  const prints = only?.length
    ? catalog.prints.filter((print) => only.includes(printHandle(print)))
    : catalog.prints;
  if (!prints.length) throw new Error(`No prints match --only ${only?.join(", ")}`);
  return prints;
}
