"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Doc } from "./types";
import {
  createDoc,
  deleteDoc,
  emptyTrash,
  getDoc,
  getHydratedSnapshot,
  getServerHydratedSnapshot,
  getServerSnapshot,
  getSnapshot,
  purgeDoc,
  restoreDoc,
  subscribe,
  toggleStar,
  updateDoc,
} from "./documents-store";

export interface UseDocuments {
  /** Active documents (not trashed), sorted most-recently-updated first. */
  docs: Doc[];
  /** Trashed documents, most-recently-deleted first. */
  trashed: Doc[];
  /** Convenience count for the sidebar trash indicator. */
  trashCount: number;
  /** False during SSR / before localStorage is read; true on the client. */
  loaded: boolean;
  getDoc: (id: string) => Doc | undefined;
  createDoc: () => Doc;
  updateDoc: (
    id: string,
    patch: Partial<Pick<Doc, "title" | "body" | "tags">>,
  ) => void;
  toggleStar: (id: string) => void;
  /** Soft-delete (move to trash). */
  deleteDoc: (id: string) => void;
  restoreDoc: (id: string) => void;
  purgeDoc: (id: string) => void;
  emptyTrash: () => void;
}

export function useDocuments(): UseDocuments {
  const rawDocs = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const loaded = useSyncExternalStore(
    subscribe,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );

  const docs = useMemo(
    () =>
      rawDocs
        .filter((d) => d.deletedAt == null)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [rawDocs],
  );

  const trashed = useMemo(
    () =>
      rawDocs
        .filter((d) => d.deletedAt != null)
        .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0)),
    [rawDocs],
  );

  return {
    docs,
    trashed,
    trashCount: trashed.length,
    loaded,
    getDoc,
    createDoc,
    updateDoc,
    toggleStar,
    deleteDoc,
    restoreDoc,
    purgeDoc,
    emptyTrash,
  };
}
