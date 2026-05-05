import Link from "next/link";
import type { Note } from "@/lib/markdown";

interface Props {
  notes: Pick<Note, "slug" | "title" | "created">[];
  emptyText?: string;
}

export default function NoteList({
  notes,
  emptyText = "No notes",
}: Props) {
  if (notes.length === 0) {
    return (
      <p className="text-ui-caption text-[var(--text-variant)]">{emptyText}</p>
    );
  }
  return (
    <ul className="divide-y divide-[var(--outline-variant)] rounded-lg border border-[var(--outline-variant)] bg-[var(--bg-container)]">
      {notes.map((n) => (
        <li key={n.slug}>
          <Link
            href={`/notes/${encodeURIComponent(n.slug)}/`}
            className="tap flex w-full items-center justify-between gap-3 px-4 text-[var(--text)] transition-colors hover:bg-[var(--bg-high)] hover:no-underline"
          >
            <span className="truncate font-sans text-ui-main">
              {n.title}
            </span>
            {n.created && (
              <span className="shrink-0 text-[10px] text-[var(--outline)]">
                {n.created}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
