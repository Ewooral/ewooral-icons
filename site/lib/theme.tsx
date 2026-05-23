"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "default" | "light" | "dark";

export const THEMES: { value: Theme; label: string }[] = [
  { value: "default", label: "Company" },
  { value: "light",   label: "Light"   },
  { value: "dark",    label: "Dark"    },
];

type ThemeCtx = {
  theme: Theme;
  cycle: () => void;
  set:   (t: Theme) => void;
};

const ThemeContext = createContext<ThemeCtx>({
  theme: "default",
  cycle: () => {},
  set:   () => {},
});

const STORAGE_KEY = "ewooral_icons_theme";
const ORDER: Theme[] = ["default", "light", "dark"];

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "default";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "default" || stored === "light" || stored === "dark") return stored;
  return "default";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  const cycle = () =>
    setTheme((t) => ORDER[(ORDER.indexOf(t) + 1) % ORDER.length]);

  return (
    <ThemeContext.Provider value={{ theme, cycle, set: setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
