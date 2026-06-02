"use client";

import { useTheme } from "@/lib/theme";

const OPTIONS = [
  { value: "brown", label: "Brown", swatch: "#c08a3e" },
  { value: "black", label: "Black", swatch: "#141414" },
] as const;

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();

  return (
    <div>
      <p className="px-1 pb-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        Theme
      </p>
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
        {OPTIONS.map((opt) => {
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              aria-pressed={active}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 font-sans text-xs font-medium transition-colors ${
                active ? "bg-accent text-white" : "text-muted hover:text-ink"
              }`}
            >
              <span
                aria-hidden
                className="inline-block h-3 w-3 shrink-0 rounded-full border border-black/20"
                style={{ background: opt.swatch }}
              />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
