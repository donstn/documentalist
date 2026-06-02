"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useDocuments } from "@/lib/use-documents";
import { formatDateTime } from "@/lib/format";
import { StarIcon } from "./star-icon";
import { TrashBinIcon } from "./trash-icon";

const STARRED_PATTERN = /(^|\s)is:starred(\s|$)/;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { docs, loaded, createDoc, deleteDoc, toggleStar, trashCount } =
    useDocuments();
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();
  const activeId = params?.id;
  const onTrash = pathname === "/docs/trash";
  const [query, setQuery] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);

  const { filtered, starFilter } = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Support an `is:starred` search pattern in addition to the toggle button.
    const patternStarred = STARRED_PATTERN.test(q) || q === "*";
    const text = q.replace(STARRED_PATTERN, " ").replace(/\*/g, " ").trim();
    const onlyStarred = starredOnly || patternStarred;
    return {
      starFilter: onlyStarred,
      filtered: docs.filter(
        (d) =>
          (!onlyStarred || d.starred) &&
          (!text || (d.title || "Untitled").toLowerCase().includes(text)),
      ),
    };
  }, [docs, query, starredOnly]);

  function handleNew() {
    const doc = createDoc();
    router.push(`/docs/${doc.id}`);
    onNavigate?.();
  }

  function handleDelete(id: string, title: string) {
    const label = title.trim() || "this untitled document";
    if (!window.confirm(`Move "${label}" to the trash?`)) return;
    deleteDoc(id);
    if (activeId === id) router.push("/docs");
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-tight text-ink"
        >
          Documentalist
        </Link>
        <button
          type="button"
          onClick={handleNew}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 font-sans text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span aria-hidden className="text-base leading-none">
            +
          </span>
          New
        </button>
      </div>

      {/* Search + starred filter */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title… (try is:starred)"
          aria-label="Search documents by title"
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 font-sans text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={() => setStarredOnly((v) => !v)}
          aria-pressed={starredOnly}
          title={starredOnly ? "Showing starred only" : "Show starred only"}
          aria-label="Filter to starred documents"
          className={`shrink-0 rounded-lg border p-2 transition-colors ${
            starFilter
              ? "border-accent bg-accent-soft text-accent"
              : "border-border bg-card text-muted hover:text-ink"
          }`}
        >
          <StarIcon filled={starFilter} size={16} />
        </button>
      </div>

      {/* List */}
      <nav className="scroll-slim flex-1 overflow-y-auto px-2 pb-4">
        {!loaded ? (
          <p className="px-3 py-6 font-sans text-sm text-muted">Loading…</p>
        ) : docs.length === 0 ? (
          <EmptyHint
            title="No documents yet"
            body="Click “New” to create your first one."
          />
        ) : filtered.length === 0 ? (
          <EmptyHint
            title={starFilter && !query.replace(STARRED_PATTERN, "").trim()
              ? "No starred documents"
              : "No matches"}
            body={
              starFilter && !query.replace(STARRED_PATTERN, "").trim()
                ? "Tap the star on a document to pin it here."
                : "Nothing matches your search."
            }
          />
        ) : (
          <ul className="flex flex-col gap-0.5">
            {filtered.map((doc) => {
              const isActive = doc.id === activeId;
              const title = doc.title.trim() || "Untitled";
              return (
                <li key={doc.id} className="group relative">
                  <Link
                    href={`/docs/${doc.id}`}
                    onClick={() => onNavigate?.()}
                    className={`block rounded-lg px-3 py-2.5 pr-16 transition-colors ${
                      isActive ? "bg-accent-soft" : "hover:bg-card"
                    }`}
                  >
                    <p
                      className={`truncate font-serif text-[15px] font-medium ${
                        doc.title.trim() ? "text-ink" : "text-muted italic"
                      }`}
                    >
                      {title}
                    </p>
                    {/* Tags replace the old text snippet. */}
                    {doc.tags.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {doc.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-accent-soft px-1.5 py-0.5 font-sans text-[10px] leading-none text-ink"
                          >
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 4 && (
                          <span className="font-sans text-[10px] text-muted">
                            +{doc.tags.length - 4}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 font-sans text-[11px] italic text-muted/70">
                        No tags
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-sans text-[10px] text-muted/80">
                      <span>Created {formatDateTime(doc.createdAt)}</span>
                      <span>Edited {formatDateTime(doc.updatedAt)}</span>
                    </div>
                  </Link>

                  {/* Star toggle: always visible when starred, otherwise on hover. */}
                  <button
                    type="button"
                    onClick={() => toggleStar(doc.id)}
                    aria-pressed={doc.starred}
                    aria-label={doc.starred ? `Unstar ${title}` : `Star ${title}`}
                    title={doc.starred ? "Unstar" : "Star"}
                    className={`absolute right-9 top-3 rounded-md p-1.5 transition-opacity focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${
                      doc.starred
                        ? "text-accent opacity-100"
                        : "text-muted opacity-0 hover:text-accent group-hover:opacity-100"
                    }`}
                  >
                    <StarIcon filled={doc.starred} size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    aria-label={`Delete ${title}`}
                    title="Delete document"
                    className="absolute right-1.5 top-3 rounded-md p-1.5 text-muted opacity-0 transition-opacity hover:bg-accent-soft hover:text-accent focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent group-hover:opacity-100"
                  >
                    <TrashIcon />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* Trash entry — icon fills when the trash has documents. */}
      <div className="border-t border-border px-2 py-2">
        <Link
          href="/docs/trash"
          onClick={() => onNavigate?.()}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 font-sans text-sm transition-colors ${
            onTrash
              ? "bg-accent-soft text-ink"
              : "text-muted hover:bg-card hover:text-ink"
          }`}
        >
          <TrashBinIcon full={trashCount > 0} size={16} />
          <span>Trash</span>
          {trashCount > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 font-sans text-[11px] font-medium text-white">
              {trashCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}

function EmptyHint({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="font-serif text-base text-ink">{title}</p>
      <p className="mt-1 font-sans text-sm text-muted">{body}</p>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
