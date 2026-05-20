import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import MermaidRenderer from "@/components/MermaidRenderer";
import { getAllNotes, getAllTags } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Sanctuary",
  description: "Your digital sanctuary for deep work and intellectual growth.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d1518" },
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allNotes = getAllNotes();
  const navItems = allNotes.map((n) => ({
    slug: n.slug,
    title: n.title,
    category: n.category,
  }));
  const tags = getAllTags();

  return (
    <html lang="ja">
      <head>
        {/* Apply the saved theme before first paint to avoid a flash.
            Falls back to the OS preference when nothing is stored. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var light=t==='light'||(!t&&window.matchMedia('(prefers-color-scheme: light)').matches);if(light){document.documentElement.classList.add('light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-dvh bg-[var(--bg)] text-[var(--text)] antialiased">
        <AppShell navItems={navItems} tags={tags}>
          {children}
        </AppShell>
        <MermaidRenderer />
      </body>
    </html>
  );
}
