import Link from "next/link";

interface Props {
  slug: string;
  title: string;
  excerpt?: string;
  tags?: string[];
  created?: string;
  category?: string;
  pinned?: boolean;
}

const categoryColors: Record<string, string> = {
  daily: "bg-[var(--secondary)]/15 text-[var(--secondary)]",
  weekly: "bg-[var(--tertiary)]/15 text-[var(--tertiary)]",
};

export default function NoteCard({
  slug,
  title,
  excerpt,
  tags,
  created,
  category,
  pinned,
}: Props) {
  return (
    <Link
      href={`/notes/${encodeURIComponent(slug)}/`}
      className="group block rounded-lg border border-[var(--outline-variant)] bg-[var(--bg-container)] p-4 transition-all duration-200 hover:border-[var(--primary)]/40 hover:bg-[var(--bg-high)] hover:no-underline hover:shadow-glass"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-sans text-base font-medium text-[var(--text)] group-hover:text-[var(--primary)]">
          {title}
        </h3>
        {pinned && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="var(--secondary)"
            stroke="var(--secondary)"
            strokeWidth="2"
            className="shrink-0"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )}
      </div>

      {excerpt && (
        <p className="mt-2 line-clamp-3 font-serif text-ui-caption text-[var(--text-variant)]">
          {excerpt}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {category && category !== "note" && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
              categoryColors[category] || "bg-[var(--bg-high)] text-[var(--text-variant)]"
            }`}
          >
            {category === "daily" ? "Daily" : "Weekly"}
          </span>
        )}
        {tags &&
          tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] text-[var(--primary-on-container)]"
            >
              #{t}
            </span>
          ))}
        {created && (
          <span className="ml-auto text-[10px] text-[var(--outline)]">
            {created}
          </span>
        )}
      </div>
    </Link>
  );
}
