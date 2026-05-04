import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllNotes,
  getBacklinks,
  getNoteBySlug,
  renderMarkdown,
} from "@/lib/markdown";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllNotes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const note = getNoteBySlug(decoded);
  return { title: note ? `${note.title} — Vault` : "Vault" };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const note = getNoteBySlug(decoded);
  if (!note) notFound();

  const html = await renderMarkdown(note.body);
  const backlinks = getBacklinks(note.slug);

  return (
    <article className="space-y-6">
      <header className="space-y-2 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold leading-tight">{note.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--subtext)]">
          {note.created && <span>{note.created}</span>}
          {note.category !== "note" && (
            <span className="rounded bg-[var(--bg-elev)] px-2 py-0.5">
              {note.category === "daily" ? "デイリーログ" : "週次レビュー"}
            </span>
          )}
          <span className="font-mono opacity-60">{note.filePath}</span>
        </div>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {note.tags.map((t) => (
              <Link
                key={t}
                href={`/tags/${encodeURIComponent(t)}/`}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-elev)] px-2.5 py-1 text-xs text-[var(--tag)] hover:no-underline"
              >
                #{t}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {backlinks.length > 0 && (
        <section className="mt-10 border-t border-[var(--border)] pt-6">
          <h2 className="mb-3 text-base font-semibold text-[var(--subtext)]">
            このノートにリンクしているノート ({backlinks.length})
          </h2>
          <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--bg-elev)]">
            {backlinks.map((b) => (
              <li key={b.slug}>
                <Link
                  href={`/notes/${encodeURIComponent(b.slug)}/`}
                  className="tap block w-full px-4 hover:no-underline"
                >
                  {b.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
