import type { Doc } from "./types";
import { createId, loadDocs, saveDocs, STORAGE_KEY } from "./storage";

/**
 * A tiny module-level store for documents, designed to be consumed with
 * React's `useSyncExternalStore`. Keeping state outside React lets every
 * component share one source of truth, handles SSR/hydration cleanly, and
 * persists to localStorage on every mutation (the app's auto-save).
 */

/** How long a document survives in the trash before being purged for good. */
export const TRASH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

let docs: Doc[] = [];
let hydrated = false;
let purgedExpired = false;
const listeners = new Set<() => void>();

// Stable references so getSnapshot doesn't trigger infinite re-renders.
const EMPTY_DOCS: Doc[] = [];

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  docs = loadDocs();
  hydrated = true;
}

/** Permanently drop trashed documents past the 30-day window. */
function purgeExpired() {
  const now = Date.now();
  const next = docs.filter(
    (d) => d.deletedAt == null || now - d.deletedAt <= TRASH_TTL_MS,
  );
  if (next.length !== docs.length) setDocs(next);
}

function emit() {
  for (const listener of listeners) listener();
}

function setDocs(next: Doc[]) {
  docs = next;
  saveDocs(docs);
  emit();
}

// ---- useSyncExternalStore wiring ------------------------------------------

export function subscribe(listener: () => void): () => void {
  ensureHydrated();
  listeners.add(listener);

  // Clean out expired trash once, at effect time (never during render).
  if (!purgedExpired) {
    purgedExpired = true;
    purgeExpired();
  }

  // Reflect changes made in other tabs/windows.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      docs = loadDocs();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Client snapshot: the live, referentially-stable documents array. */
export function getSnapshot(): Doc[] {
  ensureHydrated();
  return docs;
}

/** Server snapshot: always empty (localStorage isn't available during SSR). */
export function getServerSnapshot(): Doc[] {
  return EMPTY_DOCS;
}

/** Whether localStorage has been read yet (true on client, false during SSR). */
export function getHydratedSnapshot(): boolean {
  ensureHydrated();
  return hydrated;
}

export function getServerHydratedSnapshot(): boolean {
  return false;
}

// ---- Mutations ------------------------------------------------------------

export function getDoc(id: string): Doc | undefined {
  ensureHydrated();
  return docs.find((d) => d.id === id);
}

export function createDoc(): Doc {
  ensureHydrated();
  const now = Date.now();
  const doc: Doc = {
    id: createId(),
    title: "",
    body: "",
    starred: false,
    tags: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  setDocs([doc, ...docs]);
  return doc;
}

export function updateDoc(
  id: string,
  patch: Partial<Pick<Doc, "title" | "body" | "tags">>,
): void {
  ensureHydrated();
  setDocs(
    docs.map((d) =>
      d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d,
    ),
  );
}

/** Flip a document's starred flag. Deliberately does NOT touch updatedAt, so
 *  starring never reshuffles the recently-updated ordering. */
export function toggleStar(id: string): void {
  ensureHydrated();
  setDocs(docs.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d)));
}

/** Soft-delete: move a document to the trash (recoverable for 30 days). */
export function deleteDoc(id: string): void {
  ensureHydrated();
  setDocs(
    docs.map((d) => (d.id === id ? { ...d, deletedAt: Date.now() } : d)),
  );
}

/** Bring a document back out of the trash. */
export function restoreDoc(id: string): void {
  ensureHydrated();
  setDocs(docs.map((d) => (d.id === id ? { ...d, deletedAt: null } : d)));
}

/** Permanently remove a single trashed document. */
export function purgeDoc(id: string): void {
  ensureHydrated();
  setDocs(docs.filter((d) => d.id !== id));
}

/** Permanently remove everything currently in the trash. */
export function emptyTrash(): void {
  ensureHydrated();
  setDocs(docs.filter((d) => d.deletedAt == null));
}
