import Link from "next/link";
import type { Note } from "@/lib/markdown";

interface Props {
  notes: Pick<Note, "slug" | "title" | "created">[];
  emptyText?: string;
}

export default function NoteList({ notes, emptyText = "ノートがありません" }: Props) {
  if (notes.length === 0) {
    return <p className="text-sm text-[var(--subtext)]">{emptyText}</p>;
  }
  return (
    <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--bg-elev)]">
      {notes.map((n) => (
        <li key={n.slug}>
          <Link
            href={`/notes/${encodeURIComponent(n.slug)}/`}
            className="tap flex w-full items-center justify-between gap-3 px-4 hover:no-underline"
          >
            <span className="truncate text-[var(--text)]">{n.title}</span>
            {n.created && (
              <span className="shrink-0 text-xs text-[var(--subtext)]">
                {n.created}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
