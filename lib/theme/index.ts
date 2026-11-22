export const THEMES = ["dark", "light", "system"] as const;

export type Theme = (typeof THEMES)[number];

export const THEME_COOKIE = "theme";

/** Classic inline script for the head: pins `<html>` to the stored theme before the body paints. */
export const THEME_HEAD_SCRIPT = `(function(){var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(dark|light)(?:;|$)/);if(m)document.documentElement.setAttribute("data-theme",m[1])})()`;
