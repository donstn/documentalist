"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "./sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Drawer state only matters on small screens; desktop keeps the sidebar pinned.
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = () => setNavOpen(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop: persistent sidebar */}
      <aside className="hidden w-80 shrink-0 flex-col border-r border-border bg-sidebar md:flex lg:w-96">
        <Sidebar />
      </aside>

      {/* Main content */}
      <section className="relative flex min-w-0 flex-1 flex-col bg-paper">
        {/* Mobile top bar with the Documents toggle */}
        <header className="flex items-center gap-3 border-b border-border bg-sidebar/70 px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
            aria-controls="documents-panel"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 font-sans text-sm font-medium text-ink transition-colors hover:bg-sidebar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <PanelIcon />
            Documents
          </button>
          <Link
            href="/"
            className="ml-auto font-serif text-base font-semibold tracking-tight text-ink"
          >
            Documentalist
          </Link>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>

        {/* Mobile Documents drawer — slides from the top in portrait
            ("above the edit"), from the left in landscape. */}
        <div
          onClick={closeNav}
          aria-hidden
          className={`fixed inset-0 z-30 bg-ink/40 transition-opacity duration-300 md:hidden ${
            navOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <div
          id="documents-panel"
          className={`fixed z-40 flex flex-col bg-sidebar shadow-2xl transition-transform duration-300 md:hidden portrait:inset-x-0 portrait:top-0 portrait:h-[70%] portrait:border-b-2 portrait:border-divider landscape:left-0 landscape:top-0 landscape:h-full landscape:w-80 landscape:max-w-[85%] landscape:border-r-2 landscape:border-divider ${
            navOpen
              ? "translate-x-0 translate-y-0"
              : "portrait:-translate-y-full landscape:-translate-x-full"
          }`}
        >
          <Sidebar onNavigate={closeNav} />
        </div>
      </section>
    </div>
  );
}

function PanelIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="14" y2="18" />
    </svg>
  );
}
