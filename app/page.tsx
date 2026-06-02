import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <p className="font-sans text-xs uppercase tracking-[0.25em] text-muted">
          Documentalist
        </p>
        <h1 className="mt-6 font-serif text-5xl leading-tight tracking-tight text-ink sm:text-6xl">
          A quiet home for
          <br />
          your words.
        </h1>
        <p className="mx-auto mt-6 max-w-md font-serif text-lg leading-relaxed text-muted">
          Write in Markdown, watch it save itself, and find anything in an
          instant. Everything lives privately in your browser — no account, no
          clutter.
        </p>
        <div className="mt-10">
          <Link
            href="/docs"
            className="group inline-flex items-center gap-2 rounded-full border border-ink/80 bg-card px-8 py-3.5 font-sans text-sm font-medium text-ink shadow-[0_1px_2px_rgba(51,46,33,0.12),0_6px_16px_-6px_rgba(51,46,33,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-paper hover:shadow-[0_2px_4px_rgba(51,46,33,0.14),0_12px_24px_-8px_rgba(51,46,33,0.42)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Open your workspace
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
        <p className="mt-6 font-sans text-xs text-muted">
          Your documents never leave this device.
        </p>
      </div>
    </main>
  );
}
