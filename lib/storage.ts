import type { Doc } from "./types";

export const STORAGE_KEY = "doc-managment-app:documents:v1";

/**
 * Generate a short, URL-friendly id (e.g. used in /docs/abc123).
 * Prefers crypto.randomUUID when available, with a fallback for older runtimes.
 */
export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  }
  return Math.random().toString(36).slice(2, 12);
}

/** Read all documents from localStorage. Returns [] when empty or on any error. */
export function loadDocs(): Doc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Keep only well-formed records (so a corrupted entry can't break the app),
    // and normalise newer fields so documents saved before they existed still load.
    return parsed
      .filter(
        (d) =>
          d &&
          typeof d.id === "string" &&
          typeof d.title === "string" &&
          typeof d.body === "string" &&
          typeof d.createdAt === "number" &&
          typeof d.updatedAt === "number",
      )
      .map(
        (d): Doc => ({
          id: d.id,
          title: d.title,
          body: d.body,
          starred: typeof d.starred === "boolean" ? d.starred : false,
          tags: Array.isArray(d.tags)
            ? d.tags.filter((t: unknown): t is string => typeof t === "string")
            : [],
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          deletedAt: typeof d.deletedAt === "number" ? d.deletedAt : null,
        }),
      );
  } catch {
    return [];
  }
}

/** Persist all documents to localStorage. */
export function saveDocs(docs: Doc[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch {
    // Quota exceeded or storage unavailable — nothing actionable to do here.
  }
}
