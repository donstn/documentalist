# Reflection — Design Requests (this session)

A record of the design-, layout-, and styling-related requests made during this
build session, in the order they came up, with the resulting decision for each.
(Pure functionality/feature, git, and naming requests are intentionally left out.)

## 1. Home CTA button + "old paper" palette
- "Open your workspace" was light-on-light. Make it **black text, round, with a
  black border and nice shading** that suits the theme.
- Change the background to an **"old paper" colour — lightly yellowish, like
  older book pages**, not a plain warm-white.

→ Restyled the CTA as a raised, rounded, ink-bordered chip with a layered
shadow; shifted the whole palette to aged paper tones.

## 2. Bottom command legend + centered title
- At the **bottom of the screen, show the main editorial (Markdown) commands**
  that are supported by the writer.
- **Center the title** between the editing and preview sides.

→ Added a slim Markdown command legend pinned to the bottom; centered the title
across both panes.

## 3. Legend symbol size
- The command **symbols in the bottom line look a bit small — make them bigger
  by about 2 font sizes.**

→ Bumped the syntax chips from 11px up to `text-sm` (14px).

## 4. Separate the two panes; tint them
- Make the **writing side and preview side clearly separable with borders** that
  fit the theme — **brownish**.
- Make the **editable section whiter** and the **preview more yellow, like a page
  of a book**.

→ Introduced distinct write/preview surface colours and a brown divider.

## 5. Reframe the panes (square sheet + scroll)
- The writing side still looked too similar to preview — make the **writing
  background white**.
- The **dividing line looked awful** — remove it.
- **Frame the writing side as a square with rounded brown borders.**
- **Frame the preview as an ancient scroll.**

→ Made the write surface pure white; replaced the seam with two separate framed
cards on the paper "desk" — a rounded brown-bordered white sheet, and a parchment
preview with rolled scroll dowels top and bottom.

## 6. Adaptive (fluid) typography
- Make the **write text and preview text adapt to the page size**, but **never
  smaller than 6px** as a bare minimum.

→ Drove both panes' body text from a shared `clamp(6px, 1.6vw, 1.6rem)`; preview
headings scale from that base via `em`.

## 7. Responsive mobile layout
- **Remove the Write/Preview toggle** on mobile — **stack instead.**
- **Landscape:** write and preview **side by side**, with the documents bar
  **extendable via a button named "Documents".**
- **Portrait:** **preview below, editable text above**, and the **"Documents"
  panel extendable from above the editor.**

→ Removed the toggle; panes follow orientation (portrait stacks, landscape
side-by-side); the sidebar became a "Documents" drawer that slides from the top
in portrait and from the left in landscape (desktop keeps the pinned sidebar).

## 8. Tag placement & sidebar display (layout aspects)
- Put the **tag entry below the main editing area**, so the **editing area is
  slightly smaller than the preview**.
- Show the **tags in the documents list panel instead of the text preview.**

→ Tag bar sits inside the white sheet under the textarea (shrinking it relative
to the preview); sidebar rows show tag chips in place of the old body snippet.

## 9. Tag input microcopy (responsive placeholder)
- When adding tags, **show "write a tag word and press enter to confirm"** until
  **there isn't enough room**, then just show **"Add tag".**

→ The tag input measures its own width (ResizeObserver) and swaps between the
full hint and the short "Add tag" so the text is never clipped.

## 10. Sidebar info layout + trash button
- Show the **creation date** in each list entry (Name / tags / creation date),
  later upgraded to **full created date-time plus last-edited date-time side by
  side.**
- The **Trash button text should be centered.**

→ Added the timestamps to each entry; centered the Trash button's content.

## 11. Color themes (toggleable)
- Make the **themes different and toggleable.**
- Wanted **brown, (white,) and black** themes — black having **white text and
  icons**, with the **preview window black and a dark-red frame.**
- Follow-up: **remove the white option — leave only brown and black.**

→ Added a Brown/Black theme switcher (persisted, no flash on load); black theme
uses white text/icons and a pure-black preview with a dark-red scroll frame.
