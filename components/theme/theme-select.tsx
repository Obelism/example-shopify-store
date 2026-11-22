"use client";

import { Icon } from "@/components/ui/icon";
import { THEMES, type Theme } from "@/lib/theme";
import { setTheme, useTheme } from "@/lib/theme/client";

import styles from "./theme-select.module.css";

const THEME_ICONS = { dark: "moon", light: "sun", system: "sun-moon" } as const;

const THEME_LABELS: Record<Theme, string> = { dark: "Dark", light: "Light", system: "System" };

export function ThemeSelect() {
  const theme = useTheme();
  return (
    <span className={styles.root}>
      <Icon name={THEME_ICONS[theme]} size={20} />
      <select
        aria-label="Theme"
        className={styles.select}
        onChange={(event) => setTheme(event.target.value as Theme)}
        value={theme}
      >
        {THEMES.map((option) => (
          <option key={option} value={option}>
            {THEME_LABELS[option]}
          </option>
        ))}
      </select>
    </span>
  );
}
