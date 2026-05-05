import {
  getHomeNote,
  getNotesByCategory,
  renderMarkdown,
} from "@/lib/markdown";
import { stripMarkdown } from "@/lib/search";
import NoteCard from "@/components/NoteCard";
import Link from "next/link";

export default async function HomePage() {
  const home = getHomeNote();
  const notes = getNotesByCategory("note");
  const daily = getNotesByCategory("daily").slice().reverse();
  const weekly = getNotesByCategory("weekly").slice().reverse();

  const homeHtml = home ? await renderMarkdown(home.body) : null;

  const allRecent = [
    ...notes.map((n) => ({ ...n, sortKey: n.created || "" })),
    ...daily.map((n) => ({ ...n, sortKey: n.created || "" })),
    ...weekly.map((n) => ({ ...n, sortKey: n.created || "" })),
  ]
    .filter((n) => n.slug !== home?.slug)
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
    .slice(0, 8);

  const pinnedNotes = notes
    .filter(
      (n) => n.slug !== home?.slug && n.frontmatter.pinned
    )
    .slice(0, 4);

  return (
    <div className="space-y-10 px-6 py-8 pb-28 lg:px-10 lg:pb-8">
      {/* Welcome section */}
      <section>
        <h1 className="font-sans text-display text-[var(--text)]">
          Library
        </h1>
        <p className="mt-1 font-serif text-reading text-[var(--text-variant)]">
          The architecture of your thoughts, organized for clarity.
        </p>
      </section>

      {/* Home note content */}
      {home && homeHtml && (
        <section className="rounded-xl border border-[var(--outline-variant)] bg-[var(--bg-container)] p-6">
          <h2 className="mb-3 font-sans text-lg font-semibold text-[var(--text)]">
            {home.title}
          </h2>
          <article
            className="prose"
            dangerouslySetInnerHTML={{ __html: homeHtml }}
          />
        </section>
      )}

      {/* Pinned notes */}
      {pinnedNotes.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="var(--secondary)"
              stroke="var(--secondary)"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <h2 className="text-ui-label uppercase text-[var(--text-variant)]">
              Pinned Notes
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pinnedNotes.map((n) => (
              <NoteCard
                key={n.slug}
                slug={n.slug}
                title={n.title}
                excerpt={stripMarkdown(n.body).slice(0, 120)}
                tags={n.tags}
                created={n.created}
                pinned
              />
            ))}
          </div>
        </section>
      )}

      {/* Notes section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-ui-label uppercase text-[var(--text-variant)]">
            Notes
            <span className="ml-2 text-[var(--outline)]">{notes.length}</span>
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {notes
            .filter((n) => n.slug !== home?.slug)
            .sort((a, b) => a.title.localeCompare(b.title))
            .slice(0, 12)
            .map((n) => (
              <NoteCard
                key={n.slug}
                slug={n.slug}
                title={n.title}
                excerpt={stripMarkdown(n.body).slice(0, 100)}
                tags={n.tags}
                created={n.created}
                category={n.category}
              />
            ))}
        </div>
        {notes.length > 12 && (
          <p className="mt-4 text-center">
            <Link
              href="/search/"
              className="text-ui-caption text-[var(--primary)] hover:text-[var(--text)]"
            >
              View all {notes.length} notes
            </Link>
          </p>
        )}
      </section>

      {/* Recent Thoughts */}
      {allRecent.length > 0 && (
        <section>
          <h2 className="mb-4 text-ui-label uppercase text-[var(--text-variant)]">
            Recent Thoughts
          </h2>
          <div className="space-y-2">
            {allRecent.map((n) => (
              <Link
                key={n.slug}
                href={`/notes/${encodeURIComponent(n.slug)}/`}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-[var(--text)] transition-colors hover:bg-[var(--bg-container)] hover:no-underline"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-sans text-ui-main">
                      {n.title}
                    </span>
                    {n.category !== "note" && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${
                          n.category === "daily"
                            ? "bg-[var(--secondary)]/15 text-[var(--secondary)]"
                            : "bg-[var(--tertiary)]/15 text-[var(--tertiary)]"
                        }`}
                      >
                        {n.category}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-serif text-ui-caption text-[var(--text-variant)]">
                    {stripMarkdown(n.body).slice(0, 80)}
                  </p>
                </div>
                {n.created && (
                  <span className="shrink-0 text-[10px] text-[var(--outline)]">
                    {n.created}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Daily logs */}
      {daily.length > 0 && (
        <section>
          <h2 className="mb-4 text-ui-label uppercase text-[var(--text-variant)]">
            Daily Logs
            <span className="ml-2 text-[var(--outline)]">{daily.length}</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {daily.slice(0, 6).map((n) => (
              <NoteCard
                key={n.slug}
                slug={n.slug}
                title={n.title}
                created={n.created}
                category={n.category}
              />
            ))}
          </div>
        </section>
      )}

      {/* Weekly reviews */}
      {weekly.length > 0 && (
        <section>
          <h2 className="mb-4 text-ui-label uppercase text-[var(--text-variant)]">
            Weekly Reviews
            <span className="ml-2 text-[var(--outline)]">{weekly.length}</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {weekly.slice(0, 6).map((n) => (
              <NoteCard
                key={n.slug}
                slug={n.slug}
                title={n.title}
                created={n.created}
                category={n.category}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
