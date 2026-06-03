import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Documentalist — your documents",
  description:
    "A calm, personal place to write and keep your documents. Markdown, autosave, and instant search.",
};

// Applies the saved theme to <html> before first paint, so there's no flash of
// the default theme on load. Kept tiny and inline; mirrors the values in theme.ts.
const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem('documentalist:theme');
    if (t !== 'black') t = 'brown';
    document.documentElement.dataset.theme = t;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="brown"
      suppressHydrationWarning
      className={`${inter.variable} ${sourceSerif.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
