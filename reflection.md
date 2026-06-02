# Reflection — The persistence consultation



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



---

# Build‑process reflection (reviewer prompts)

I couldn`t find an instance where i could have used and citeded something that was not already known to claude. I uploaded approuter, instalation layouts, linking and navigaion, project structure and server and clieents MDs from the nextjs.org page - so claude had all the up-to-date information prior to starting coding. Did I do that wrong?

## 1. A prompt where search → paste → cite changed the outcome

**This did not happen in this build session.** I did not search external material, paste it
into a prompt, and cite it to steer Claude Code's output. The only docs‑driven behaviour
came from the *agent* side: `AGENTS.md` points the agent at the version‑matched Next.js 16
docs bundled in `node_modules/next/dist/docs/`, and Claude read those itself before writing
code — that is the agent reading docs, not me doing search → paste → cite.

`[TO ADD IF IT HAPPENED ELSEWHERE: what I searched for, what I pasted, and what Claude would
have produced without it.]`

## 2. A moment where CLAUDE.md caught the agent drifting

**There was no single, dramatic "caught mid‑drift" moment in this session** — largely
because much of `CLAUDE.md` was being *written as we went*, and the agent followed
`AGENTS.md` from the start rather than drifting and being pulled back.

The closest real effect was **preventive**, up front: `AGENTS.md` (imported into
`CLAUDE.md`) says *"this is NOT the Next.js you know — read the bundled docs; your training
data is outdated."* That stopped Claude reaching for stale patterns and pushed it to the
Next 16 / React 19 conventions actually required here — e.g. treating `params` as a Promise
/ using `useParams`, reading `localStorage` through `useSyncExternalStore` instead of a
Context+effect, and deciding "Document not found" on the client (gated on a `loaded` flag)
rather than a server 404. So `CLAUDE.md`/`AGENTS.md` *prevented* drift rather than catching
it after the fact.



## 3. The design pass

This **did** happen, and across several iterations.

**The direction I gave.** In the opening consultation I picked a **"warm editorial"** style
(serif headings, paper‑like background, document‑first). Over the session I made it concrete:

- **Tone / colour:** an **"old paper" / aged book‑page** palette — lightly yellowed and warm,
  not a flat warm‑white; later deepened to an aged cream. Burnt‑orange accent.
- **Typography:** serif for titles and the rendered preview (Source Serif), sans for the UI
  (Inter); and **viewport‑fluid body text** with a hard **6px floor**.
- **Components:** the home CTA (which looked invisible/low‑contrast to me) reworked into a
  **rounded, black‑bordered, softly shadowed "paper chip"**; the editor split into a
  **white, rounded, brown‑framed writing sheet** beside a preview **framed like an ancient
  scroll** (parchment body, rolled "dowels" top and bottom); a **Markdown command legend**
  pinned along the bottom; the **title centered** across both panes.
- **Spacing / separation:** first a brown divider between write and preview, then dropping
  the "awful" seam line in favour of two distinct framed cards sitting on the paper "desk."

**What changed from the scaffold.** The create‑next‑app default (Geist font, zinc/white
palette, the Next.js logo landing page) was fully replaced: a new home page, the warm
aged‑paper theme, the framed sheet + scroll editor, fluid type, the bottom legend, and a
calmer document‑first layout.

**Which iteration finally felt right.** The palette took a few passes — a subtle warm white
first, then the aged "old book page" cream — and the writing surface went from "barely
different from the preview" to **pure white** once I pushed back. The version that landed was
the **white square sheet + ancient‑scroll preview on aged paper**, with the centered title
and bottom legend. The final layer was **toggleable themes** (Brown default + a Black theme
with white text/icons and a black preview behind a dark‑red frame), kept on a separate branch.

## 4. One thing that was harder than expected vs. the plain‑HTML static‑site app

Understanding the assigment. Difficult to learn and then do without consultation. Probably since I partly understood some steps as being imporatnt - and missed them in the asignment. Will need to attend standups more often.

## 5. What I'd keep or change in my docs/ folder next time (useful vs. noise)

will probably have to look through the docs file - now just uploaded all that was recommended duering the course so everything would work :)
