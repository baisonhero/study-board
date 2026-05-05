import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { getAllNotes, getAllTags } from "@/lib/markdown";

export const metadata: Metadata = {
  title: "Sanctuary",
  description: "Your digital sanctuary for deep work and intellectual growth.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d1518",
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
      <body className="min-h-dvh bg-surface text-on-surface antialiased">
        <AppShell navItems={navItems} tags={tags}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
