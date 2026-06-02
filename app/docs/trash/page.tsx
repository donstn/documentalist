"use client";

import { useState } from "react";
import Link from "next/link";
import { useDocuments } from "@/lib/use-documents";
import { TRASH_TTL_MS } from "@/lib/documents-store";
import { formatDateTime } from "@/lib/format";

const DAY_MS = 24 * 60 * 60 * 1000;

export default function TrashPage() {
  const { trashed, loaded, restoreDoc, purgeDoc, emptyTrash } = useDocuments();
  // Captured once at mount — "days left" doesn't need to tick during a visit.
  const [now] = useState(() => Date.now());

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-sans text-sm text-muted">Loading…</p>
      </div>
    );
  }

  function handlePurge(id: string, title: string) {
    const label = title.trim() || "this untitled document";
    if (
      window.confirm(`Permanently delete "${label}"? This cannot be undone.`)
    ) {
      purgeDoc(id);
    }
  }

  function handleEmpty() {
    if (
      window.confirm(
        `Permanently delete all ${trashed.length} document(s) in the trash? This cannot be undone.`,
      )
    ) {
      emptyTrash();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-6 pb-3 sm:px-8">
        <div>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 font-sans text-xs text-muted transition-colors hover:text-ink"
          >
            <span aria-hidden>←</span> Workspace
          </Link>
          <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-ink">
            Trash
          </h1>
          <p className="mt-0.5 font-sans text-sm text-muted">
            Deleted documents stay here for 30 days, then are removed
            automatically.
          </p>
        </div>
        {trashed.length > 0 && (
          <button
            type="button"
            onClick={handleEmpty}
            className="shrink-0 rounded-full border border-border bg-card px-4 py-2 font-sans text-sm font-medium text-ink transition-colors hover:bg-sidebar"
          >
            Empty trash
          </button>
        )}
      </div>

      {/* List */}
      <div className="scroll-slim min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-8">
        {trashed.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-serif text-xl text-ink">Trash is empty</p>
            <p className="mt-1 max-w-sm font-sans text-sm text-muted">
              Documents you delete from the workspace will appear here, and can
              be restored.
            </p>
          </div>
        ) : (
          <ul className="mx-auto flex max-w-2xl flex-col gap-2">
            {trashed.map((doc) => {
              const deletedAt = doc.deletedAt ?? 0;
              const daysLeft = Math.max(
                0,
                Math.ceil((deletedAt + TRASH_TTL_MS - now) / DAY_MS),
              );
              const title = doc.title.trim() || "Untitled";
              return (
                <li
                  key={doc.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate font-serif text-[15px] font-medium ${
                        doc.title.trim() ? "text-ink" : "text-muted italic"
                      }`}
                    >
                      {title}
                    </p>
                    <p className="mt-0.5 font-sans text-xs text-muted">
                      Deleted {formatDateTime(deletedAt)} · {daysLeft} day
                      {daysLeft === 1 ? "" : "s"} left
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => restoreDoc(doc.id)}
                    className="shrink-0 rounded-full bg-accent px-3.5 py-1.5 font-sans text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePurge(doc.id, doc.title)}
                    className="shrink-0 rounded-full border border-border px-3.5 py-1.5 font-sans text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    Delete forever
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
