import type { ImproveConfiguration } from "@obelism/improve-sdk/types";

// Slugs and options go into CSS selectors, a meta tag and cookie names: anything else is left out rather than escaped.
const SAFE = /^[a-z0-9-]+$/;

export interface ImproveSubject {
  fallback: string;
  kind: "flag" | "test";
  options: string[];
  slug: string;
}

export function getImproveSubjects(config: ImproveConfiguration | null): ImproveSubject[] {
  if (!config) return [];
  const tests = Object.entries(config.tests).map(([slug, test]) => ({
    fallback: test.defaultValue,
    kind: "test" as const,
    options: test.options.map((option) => option.slug),
    slug,
  }));
  const flags = Object.entries(config.flags).map(([slug, flag]) => ({
    fallback: flag.options[0]?.slug ?? "",
    kind: "flag" as const,
    options: flag.options.map((option) => option.slug),
    slug,
  }));
  return [...tests, ...flags].flatMap((subject) => {
    const options = subject.options.filter((option) => SAFE.test(option));
    return SAFE.test(subject.slug) && options.includes(subject.fallback)
      ? [{ ...subject, options }]
      : [];
  });
}

// Every placement shows its default option until a running test's cookie names another of its options, so a stopped test or a forged cookie shows the default.
const BASE_STYLE =
  "[data-ob-imp]{display:contents}[data-ob-imp]:not([data-ob-default]){display:none}";

export function improveHead(subjects: ImproveSubject[]): { meta: string; style: string } {
  const meta = JSON.stringify(
    Object.fromEntries(subjects.map(({ options, slug }) => [slug, options])),
  );
  const rules = subjects.flatMap(({ options, slug }) =>
    options.flatMap((option) => [
      `html[data-imp-${slug}="${option}"] [data-ob-imp="${slug}"][data-ob-opt="${option}"]{display:contents}`,
      `html[data-imp-${slug}="${option}"] [data-ob-imp="${slug}"][data-ob-default]:not([data-ob-opt="${option}"]){display:none}`,
    ]),
  );
  return { meta, style: [BASE_STYLE, ...rules].join("\n") };
}

/** Classic inline script for the head: marks `<html>` with each running test's option from its cookie before the body paints. Kept as `window.__obelismImprove` to re-run after client navigations. */
export const IMPROVE_HEAD_SCRIPT = `(function(){function apply(){var meta=document.querySelector('meta[name="obelism-improve"]');if(!meta)return;var tests=JSON.parse(meta.content);var cookies=document.cookie.split("; ");for(var slug in tests){var value=null;for(var i=0;i<cookies.length;i++){if(cookies[i].indexOf(slug+"=")===0)value=decodeURIComponent(cookies[i].slice(slug.length+1))}if(value&&tests[slug].indexOf(value)>-1)document.documentElement.setAttribute("data-imp-"+slug,value);else document.documentElement.removeAttribute("data-imp-"+slug)}}window.__obelismImprove=apply;apply()})()`;
