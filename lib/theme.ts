"use client";

import { useSyncExternalStore } from "react";

export const THEMES = ["brown", "black"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_STORAGE_KEY = "documentalist:theme";
const DEFAULT_THEME: Theme = "brown";

function isTheme(v: unknown): v is Theme {
  return typeof v === "string" && (THEMES as readonly string[]).includes(v);
}

let current: Theme | null = null;
const listeners = new Set<() => void>();

function readStored(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(v) ? v : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function ensure() {
  if (current === null) current = readStored();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Theme {
  ensure();
  return current as Theme;
}

function getServerSnapshot(): Theme {
  return DEFAULT_THEME;
}

export function setTheme(theme: Theme): void {
  current = theme;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // storage unavailable — the in-memory value still applies for this session
    }
    document.documentElement.dataset.theme = theme;
  }
  for (const listener of listeners) listener();
}

/** Current theme + a setter. SSR-safe via useSyncExternalStore. */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [theme, setTheme];
}
