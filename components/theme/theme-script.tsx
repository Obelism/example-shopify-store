import { THEME_HEAD_SCRIPT } from "@/lib/theme";

export function ThemeScript() {
  // oxlint-disable-next-line react/no-danger -- A constant script; it must run inline, before the body paints.
  return <script dangerouslySetInnerHTML={{ __html: THEME_HEAD_SCRIPT }} />;
}
