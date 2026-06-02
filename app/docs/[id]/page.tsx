"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useDocuments } from "@/lib/use-documents";
import { formatDateTime, formatRelative } from "@/lib/format";
import { StarIcon } from "../star-icon";
import { TagField } from "../tag-field";

export default function DocumentPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { docs, loaded, updateDoc, toggleStar } = useDocuments();
  const doc = docs.find((d) => d.id === id);

  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard-first flow: focus the title when a document opens.
  useEffect(() => {
    if (doc) titleRef.current?.focus();
    // Only when the opened document changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loaded]);

  // While localStorage is still being read, don't flash "not found".
  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-sans text-sm text-muted">Loading…</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="font-serif text-3xl text-ink">Document not found</p>
        <p className="mt-2 max-w-sm font-sans text-sm text-muted">
          This document doesn’t exist — it may have been deleted, or the link
          may be wrong.
        </p>
        <Link
          href="/docs"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 font-sans text-sm font-medium text-ink transition-colors hover:bg-sidebar"
        >
          <span aria-hidden>←</span> Back to workspace
        </Link>
      </div>
    );
  }

  // `doc` is guaranteed below this point.
  const currentDoc = doc;

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      bodyRef.current?.focus();
    }
  }

  function addTag(tag: string) {
    if (!currentDoc.tags.includes(tag)) {
      updateDoc(currentDoc.id, { tags: [...currentDoc.tags, tag] });
    }
  }

  function removeTag(tag: string) {
    updateDoc(currentDoc.id, {
      tags: currentDoc.tags.filter((t) => t !== tag),
    });
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* Star toggle */}
      <button
        type="button"
        onClick={() => toggleStar(currentDoc.id)}
        aria-pressed={currentDoc.starred}
        aria-label={currentDoc.starred ? "Unstar document" : "Star document"}
        title={currentDoc.starred ? "Starred" : "Star this document"}
        className={`absolute right-3 top-3 z-10 rounded-full border p-2 transition-colors ${
          currentDoc.starred
            ? "border-accent bg-accent-soft text-accent"
            : "border-border bg-card text-muted hover:text-accent"
        }`}
      >
        <StarIcon filled={currentDoc.starred} size={18} />
      </button>

      {/* Title */}
      <div className="px-12 pt-5 pb-3 sm:px-16 sm:pt-7">
        <input
          ref={titleRef}
          value={currentDoc.title}
          onChange={(e) => updateDoc(currentDoc.id, { title: e.target.value })}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          aria-label="Document title"
          className="w-full bg-transparent text-center font-serif text-3xl font-semibold tracking-tight text-ink placeholder:text-muted/50 focus:outline-none sm:text-4xl"
        />
      </div>

      {/*
        Write + preview surfaces on the aged-paper desk.
        Phone portrait: stacked (write on top, preview below).
        Phone landscape: side by side. Desktop: always side by side.
      */}
      <div className="flex min-h-0 flex-1 gap-4 p-3 max-md:portrait:flex-col max-md:landscape:flex-row sm:gap-6 sm:p-5 md:flex-row">
        {/* Write surface: white sheet + a tag bar below (so it sits a little
            shorter than the preview) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border-2 border-divider bg-write shadow-sm">
          <textarea
            ref={bodyRef}
            value={currentDoc.body}
            onChange={(e) => updateDoc(currentDoc.id, { body: e.target.value })}
            placeholder="Start writing… Markdown supported — # heading, **bold**, *italic*, - list"
            aria-label="Document body (Markdown)"
            spellCheck
            className="editor-body scroll-slim h-full w-full flex-1 resize-none bg-transparent px-5 py-5 font-sans leading-relaxed text-ink placeholder:text-muted focus:outline-none sm:px-7"
          />
          {/* Tags */}
          <TagField
            tags={currentDoc.tags}
            onAdd={addTag}
            onRemove={removeTag}
          />
        </div>

        {/* Preview surface: framed like an ancient scroll */}
        <div className="flex min-h-0 flex-1 flex-col px-1.5">
          <div className="scroll-roll" />
          <div className="scroll-frame flex min-h-0 flex-1 flex-col">
            <div className="scroll-slim h-full overflow-y-auto px-5 py-6 sm:px-9">
              {currentDoc.body.trim() ? (
                <div className="prose mx-auto max-w-prose">
                  <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {currentDoc.body}
                  </Markdown>
                </div>
              ) : (
                <p className="font-sans text-sm italic text-muted">
                  Nothing to preview yet. Start writing above.
                </p>
              )}
            </div>
          </div>
          <div className="scroll-roll" />
        </div>
      </div>

      {/* Markdown command legend + autosave status, pinned to the bottom */}
      <footer className="flex items-center gap-3 border-t border-border bg-sidebar/60 px-4 py-2 sm:px-8">
        <div className="scroll-slim flex min-w-0 items-center gap-4 overflow-x-auto whitespace-nowrap">
          <span className="shrink-0 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Markdown
          </span>
          {MARKDOWN_HINTS.map((hint) => (
            <span
              key={hint.label}
              className="inline-flex shrink-0 items-center gap-1.5 font-sans text-xs text-muted"
            >
              <code className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-sm text-ink">
                {hint.syntax}
              </code>
              {hint.label}
            </span>
          ))}
        </div>
        <span className="ml-auto hidden shrink-0 font-sans text-[11px] text-muted md:inline">
          Created {formatDateTime(currentDoc.createdAt)} · edited{" "}
          {formatRelative(currentDoc.updatedAt)}
        </span>
      </footer>
    </div>
  );
}

const MARKDOWN_HINTS = [
  { syntax: "# ", label: "Heading" },
  { syntax: "**bold**", label: "Bold" },
  { syntax: "*italic*", label: "Italic" },
  { syntax: "- ", label: "List" },
  { syntax: "> ", label: "Quote" },
  { syntax: "[ ]( )", label: "Link" },
  { syntax: "`code`", label: "Code" },
] as const;
