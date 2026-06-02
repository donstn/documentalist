# Documentalist

A personal, local‑first **Markdown document manager**. Open the app and you get a
two‑pane workspace — a sidebar listing your documents on the left, and an editor with
a live preview on the right. Everything is stored in your browser, so your notes never
leave the device and there is no account or backend.

## Features

### Documents & editing
- **Two‑pane workspace** at `/docs`: document list on the left, editor on the right.
- **One‑click new document** — the *New* button creates a blank doc and opens it immediately.
- **Markdown editor with a live split preview**: write on a white sheet, see the rendered
  result on a parchment "scroll" beside it. Supports headings, **bold**, *italic*, bullet
  lists, quotes, links, and inline code. A single Enter is treated as a real line break.
- **A command legend** pinned to the bottom of the editor shows the supported Markdown syntax.
- **Autosave** — every change is written to storage instantly; there is no save button.
- **Fluid typography** — the editor and preview text scale with the viewport (down to a 6px floor).

### Organising
- **Sidebar list sorted by most recently updated.**
- **Live title search** — filter the list as you type.
- **Star / favourite** documents, and **filter to starred only** via the star button or the (from pptional requirements - was fun)
  `is:starred` search pattern (`*` works too).
- **Tags** — add/remove tags below the editor; tags are shown on each entry in the sidebar. (from pptional requirements - was fun)
- **Per‑document metadata** — created and last‑edited timestamps (`YYYY/MM/DD HH:mm:ss`) on every entry. (i thought this would be nicer to view - my own addition)

### Trash (soft delete)
- **Deleting moves a document to the trash** instead of removing it (with a confirmation).(from pptional requirements - was fun)
- The sidebar **trash icon fills and shows a count** when the trash isn't empty. (from pptional requirements - was fun)
- A dedicated **trash view** (`/docs/trash`) lets you **Restore**, **Delete forever**, or **Empty trash**, 
  and shows how many days remain before each item is removed.
- **30‑day auto‑purge** — trashed documents are permanently deleted after 30 days. (my own addition)

### Persistence & navigation
- **Stored in `localStorage`** — documents persist across full page reloads.
- **Every document has its own address** (e.g. `/docs/abc123`); links are bookmarkable and shareable.
- Opening an **unknown document id** shows a friendly *"Document not found"* page with a link back to main list

### Usability
- **Keyboard‑first flow** — create a document, type the title, press **Enter** to jump straight to the
  body, and write — all without touching the mouse.
- **Responsive layout** — side‑by‑side panes on desktop; on phones the sidebar becomes a
  *Documents* drawer and the panes follow orientation (portrait stacks write‑over‑preview,
  landscape sits side‑by‑side).
- **Readable empty states** throughout (no documents, no search results, empty trash, empty preview).

## Tech stack

- **Next.js (App Router)** + **React** + **TypeScript**
- **Tailwind CSS v4**
- **react-markdown** + **remark-gfm** + **remark-breaks** for the preview
- Persistence via the browser's **localStorage** (no server, no database)

## Getting started to run the page

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home page links into the workspace at `/docs`.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Project structure

```
app/
  page.tsx            # home page
  layout.tsx          # root layout (fonts, metadata)
  docs/
    layout.tsx        # workspace shell (sidebar + responsive Documents drawer)
    page.tsx          # /docs empty state
    [id]/page.tsx     # the editor (title, body, live preview, tags, star)
    trash/page.tsx    # /docs/trash (restore / delete forever / empty)
    sidebar.tsx       # list, search, starred filter, trash entry
lib/
  types.ts            # the Doc type
  storage.ts          # localStorage read/write (backward‑compatible)
  documents-store.ts  # module store (CRUD, soft delete, 30‑day purge)
  use-documents.ts    # React hook over the store (useSyncExternalStore)
  format.ts           # date/time + relative‑time helpers
```

## Color themes (separate branch) - One of the optional tasks to fill the requirment of a seperate branch to be reviewed. 

A **theme switcher** is developed on the **`color-themes`** branch (it is **not merged into
`main`**). It adds toggleable **Brown** (the default aged‑paper look) and **Black** themes —
in the Black theme the text and icons are white and the preview is a black page with a dark‑red
frame. The choice is persisted and applied before first paint to avoid a flash.

To try it:

```bash
git checkout color-themes
npm install
npm run dev
```

## Notes

- This is a local‑first app: all data lives in `localStorage`, so it is per‑browser and per‑device.
  There is nothing to deploy and no secrets in the code.
