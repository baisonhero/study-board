import Link from "next/link";

interface BacklinkItem {
  slug: string;
  title: string;
}

interface Props {
  backlinks: BacklinkItem[];
  tags: string[];
}

export default function RightPanel({ backlinks, tags }: Props) {
  if (backlinks.length === 0 && tags.length === 0) return null;

  return (
    <aside className="hidden w-[260px] shrink-0 xl:block">
      <div className="sticky top-0 h-dvh overflow-y-auto border-l border-[var(--outline-variant)] bg-[var(--bg-low)] p-5">
        <div className="space-y-8 pt-4">
          {/* Backlinks */}
          {backlinks.length > 0 && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-ui-label uppercase text-[var(--text-variant)]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Backlinks
                <span className="text-[10px] font-normal normal-case text-[var(--outline)]">
                  {backlinks.length}
                </span>
              </h3>
              <ul className="space-y-1">
                {backlinks.map((b) => (
                  <li key={b.slug}>
                    <Link
                      href={`/notes/${encodeURIComponent(b.slug)}/`}
                      className="block rounded-md px-2.5 py-2 text-ui-caption text-[var(--text-variant)] hover:bg-[var(--bg-container)] hover:text-[var(--text)] hover:no-underline"
                    >
                      {b.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-ui-label uppercase text-[var(--text-variant)]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Link
                    key={t}
                    href={`/tags/${encodeURIComponent(t)}/`}
                    className="inline-flex items-center rounded-full bg-[var(--primary-dark)] px-2.5 py-1 text-[11px] text-[var(--primary)] hover:bg-[var(--bg-container)] hover:no-underline"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </aside>
  );
}
