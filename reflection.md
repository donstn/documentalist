# Reflection — The persistence consultation

This document records the one design decision I want to be able to walk a reviewer
through: **how the app persists documents**, and how that choice was reached in
consultation with Claude Code.

## The question I brought to Claude Code

The brief said the app should run locally with no hosting and "save details to
localStorage," and the task explicitly asked me to settle the persistence mechanism
"after the consultation." So rather than just assume it, I asked Claude Code to treat
persistence as a decision to confirm: given a personal, browser-only document app that
must survive reloads and have no backend, **what should actually store the data, and
what are the alternatives I should weigh?**

## What Claude Code recommended

Claude Code **recommended `localStorage`** — and framed it as confirming my stated
preference rather than overriding it. Its reasoning:

- The data is small, plain‑text Markdown documents — well within `localStorage`'s budget.
- The API is **synchronous and simple**, which maps cleanly onto a tiny state layer and is
  easy to reason about and debug.
- It **survives full page reloads** with zero infrastructure, matching the "local‑first,
  no hosting" requirement.

## The alternatives it surfaced

1. **`localStorage` (chosen).**
   - *Pros:* dead simple, synchronous, no setup, survives reloads, easy to inspect.
   - *Cons:* ~5 MB ceiling; stores strings only (so the collection is JSON‑serialised);
     synchronous writes; scoped per‑browser/per‑device (no cross‑device sync).

2. **IndexedDB.**
   - *Pros:* asynchronous, far larger storage headroom, structured/indexed queries —
     better if the app grew to many large documents or stored binary attachments.
   - *Cons:* significantly more boilerplate (transactions, async access, versioned
     schema upgrades) for capabilities this app does not need.

3. **A backend / server database.** Surfaced only to be explicitly ruled out: the brief
   says the app runs locally with no hosting, so anything requiring a server (and the
   accounts, sync, and deployment that come with it) was out of scope.

## Why we went with `localStorage`

We chose `localStorage` because the **data shape and scale fit it precisely** — a handful
of small text documents per user — so IndexedDB's extra power would have been complexity
without benefit, and a server was excluded by the requirements. The synchronous, string
key/value model also matched the architecture cleanly.

**Trade‑offs we knowingly accepted:**

- The ~5 MB limit and string‑only storage are fine for text; they would *not* be fine if
  we later added images/attachments — that would be the trigger to revisit IndexedDB.
- Data is per‑browser and per‑device: there is no sync between machines. Acceptable for a
  deliberately "personal, local‑first" tool.
- Synchronous writes could, in theory, block the main thread on very large payloads — a
  non‑issue at this data size.

## How the decision shaped the implementation

- All reads/writes go through one place (`lib/storage.ts`), which **normalises older saved
  data** so documents written by earlier versions still load (forward‑compatible).
- The whole collection lives under a single key; on every change it is re‑serialised —
  this *is* the app's **autosave** (no save button).
- State is held in a small module store read through React's `useSyncExternalStore`
  (`lib/documents-store.ts`, `lib/use-documents.ts`), giving one shared source of truth
  across the sidebar and editor and a clean server/hydration story.

## If I had to defend or revisit this

The decision is correct for the requirements as written. The clearest signal that it
should change would be **scope growth**: many/large documents, binary attachments, or a
need for cross‑device sync. The first two point to **IndexedDB**; the third points to a
**backend**. Because persistence is funnelled through `lib/storage.ts` and a single store,
swapping the mechanism later would be a contained change rather than a rewrite.
