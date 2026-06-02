@AGENTS.md

# Documentalist — a personal, local-only Markdown document manager

Fixed stack (do not swap): Next.js (App Router), TypeScript, Tailwind CSS v4.
Per AGENTS.md: read the version-matched docs in `node_modules/next/dist/docs/
before writing Next.js code — this is Next 16, not your training data.

## Architecture decisions (the "why")

- **Persistence = browser localStorage only.** No backend; data never leaves the
  device. Key + read/write live in `lib/storage.ts`.
- **State lives outside React** in `lib/documents-store.ts` (a module-level store)
  and is read via `useSyncExternalStore` in `lib/use-documents.ts`. Why: one
  shared source of truth across sidebar + editor, clean SSR/hydration, and it
  avoids React 19's `set-state-in-effect` lint rule (don't reintroduce a
  Context+effect that loads localStorage — it was removed for this reason).
- **Auto-save = every store mutation persists immediately.** There is no save
  button by design.
- **"Document not found" is decided client-side**, gated on the `loaded` flag —
  never `notFound()`. Why: the server can't see localStorage, so a server-side
  404 would false-flash on valid deep links. SSR shows "Loading…" until hydrated.
- **Preview uses `react-markdown` + `remark-gfm` + `remark-breaks`.** `remark-breaks`
  is intentional: a single Enter becomes a line break (writer expectation), not
  CommonMark's soft-space.
- **Editor/preview body text is fluid** via the `--editor-font-size` clamp in
  `globals.css` (floor 6px, requested minimum). Preview headings use `em` so they
  scale from it.
- **Responsive model:** desktop (md+) = pinned sidebar + side-by-side panes.
  Phone = sidebar is a drawer (the "Documents" button); panes follow orientation
  (portrait stacks write-over-preview, landscape side-by-side). Orientation rules
  are scoped with `max-md` so desktops never accidentally stack.
- **Theming (brown/black):** colour tokens are defined in a NON-inline
  `@theme` block so utilities compile to `var(--color-*)`; each theme overrides
  those vars under `:root[data-theme="…"]` in `globals.css`. The choice +
  persistence live in `lib/theme.ts` (localStorage, `useSyncExternalStore`); an
  inline script in `app/layout.tsx` sets `data-theme` before paint (no flash),
  and `<html suppressHydrationWarning>` covers the script-vs-SSR difference.
  Do NOT move colours back into `@theme inline` — that hardcodes values and
  breaks runtime theming.

## Invariants to preserve

- `loadDocs()` must stay backward-compatible: normalise/default any new `Doc`
  field so documents saved by older versions still load.
- `toggleStar` must NOT bump `updatedAt` (starring shouldn't reshuffle the
  recently-updated ordering); `updateDoc` does bump it.
- **Delete is soft.** `deleteDoc` sets `deletedAt` (moves to trash);
  `purgeDoc`/`emptyTrash` delete permanently. Active docs = `deletedAt == null`.
  Trash is purged after `TRASH_TTL_MS` (30 days), done once at effect-time in
  `subscribe` — keep purges out of render.
