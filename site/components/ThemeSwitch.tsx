"use client";

import { useTheme, THEMES, type Theme } from "../lib/theme";

const GLYPHS: Record<Theme, React.ReactNode> = {
  default: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  ),
  light: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  dark: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
};

export function ThemeSwitch() {
  const { theme, set } = useTheme();

  return (
    <div
      className="inline-flex items-center border border-[var(--color-line)] rounded"
      role="radiogroup"
      aria-label="Theme"
      style={{ borderRadius: "2px" }}
    >
      {THEMES.map((t) => {
        const active = theme === t.value;
        return (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t.label}
            title={t.label}
            onClick={() => set(t.value)}
            className="flex items-center justify-center w-7 h-7 transition-colors"
            style={{
              color: active ? "var(--color-accent)" : "var(--color-ink-faint)",
              background: active ? "rgba(245, 184, 32, 0.10)" : "transparent",
            }}
          >
            {GLYPHS[t.value]}
          </button>
        );
      })}
    </div>
  );
}
