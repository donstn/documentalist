"use client";

import { useEffect, useRef, useState } from "react";

const FULL_HINT = "Write a tag word and press enter to confirm";
const SHORT_HINT = "Add tag";
// Roughly the width (px) the full hint needs at this font size. Below it we fall
// back to the short hint so the placeholder is never clipped mid-sentence.
const FULL_HINT_MIN_WIDTH = 250;

export function TagField({
  tags,
  onAdd,
  onRemove,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [value, setValue] = useState("");
  const [roomy, setRoomy] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Swap the placeholder based on how much width the input actually has.
  useEffect(() => {
    const el = inputRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      setRoomy(entries[0].contentRect.width >= FULL_HINT_MIN_WIDTH);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function submit() {
    const tag = value.trim();
    if (tag) onAdd(tag);
    setValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      submit();
    } else if (e.key === "Backspace" && value === "" && tags.length) {
      e.preventDefault();
      onRemove(tags[tags.length - 1]);
    }
  }

  return (
    <div className="shrink-0 border-t border-border px-3 py-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 font-sans text-xs text-ink"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              aria-label={`Remove tag ${tag}`}
              className="leading-none text-muted hover:text-accent"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={submit}
          placeholder={roomy ? FULL_HINT : SHORT_HINT}
          aria-label="Add a tag"
          className="min-w-[5rem] flex-1 bg-transparent px-1 py-1 font-sans text-xs text-ink placeholder:text-muted focus:outline-none"
        />
      </div>
    </div>
  );
}
