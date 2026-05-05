import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllNotes,
  getBacklinks,
  getNoteBySlug,
  renderMarkdown,
} from "@/lib/markdown";
import RightPanel from "@/components/RightPanel";

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
  return { title: note ? `${note.title} — Sanctuary` : "Sanctuary" };
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
    <div className="flex">
      {/* Main article */}
      <article className="min-w-0 flex-1 px-6 py-8 pb-28 lg:px-10 lg:pb-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-ui-caption text-[var(--text-variant)]">
          <Link
            href="/"
            className="hover:text-[var(--text)] hover:no-underline"
          >
            Library
          </Link>
          <span className="text-[var(--outline)]">/</span>
          <span className="truncate text-[var(--text)]">{note.title}</span>
        </div>

        {/* Header */}
        <header className="mb-6 space-y-3 border-b border-[var(--outline-variant)] pb-5">
          <div className="flex flex-wrap items-center gap-3 text-ui-caption text-[var(--text-variant)]">
            {note.category !== "note" && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                  note.category === "daily"
                    ? "bg-[var(--secondary)]/15 text-[var(--secondary)]"
                    : "bg-[var(--tertiary)]/15 text-[var(--tertiary)]"
                }`}
              >
                {note.category === "daily" ? "Daily" : "Weekly"}
              </span>
            )}
            {note.created && <span>{note.created}</span>}
          </div>

          <h1 className="font-sans text-3xl font-bold leading-tight text-[var(--text)] lg:text-4xl">
            {note.title}
          </h1>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {note.tags.map((t) => (
                <Link
                  key={t}
                  href={`/tags/${encodeURIComponent(t)}/`}
                  className="inline-flex items-center rounded-full border border-[var(--outline-variant)] bg-[var(--bg-container)] px-2.5 py-1 text-[11px] font-medium text-[var(--primary)] transition-colors hover:border-[var(--primary)]/40 hover:bg-[var(--bg-high)] hover:no-underline"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Article body */}
        <div
          className="prose prose-dropcap"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Mobile backlinks */}
        {backlinks.length > 0 && (
          <section className="mt-10 border-t border-[var(--outline-variant)] pt-6 xl:hidden">
            <h2 className="mb-3 flex items-center gap-2 text-ui-label uppercase text-[var(--text-variant)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Backlinks
              <span className="text-[10px] font-normal normal-case text-[var(--outline)]">
                {backlinks.length}
              </span>
            </h2>
            <ul className="space-y-1 rounded-lg border border-[var(--outline-variant)] bg-[var(--bg-container)] p-2">
              {backlinks.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/notes/${encodeURIComponent(b.slug)}/`}
                    className="block rounded-md px-3 py-2 text-ui-caption text-[var(--text-variant)] hover:bg-[var(--bg-high)] hover:text-[var(--text)] hover:no-underline"
                  >
                    {b.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      {/* Desktop right panel - in flow, not fixed */}
      <RightPanel backlinks={backlinks} tags={note.tags} />
    </div>
  );
}
