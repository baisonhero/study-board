import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, getNotesByTag } from "@/lib/markdown";
import { stripMarkdown } from "@/lib/search";
import NoteCard from "@/components/NoteCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  return { title: `#${decodeURIComponent(tag)} — Sanctuary` };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const notes = getNotesByTag(decoded);
  if (notes.length === 0) notFound();

  return (
    <div className="space-y-6 px-6 py-8 pb-28 lg:px-10 lg:pb-8">
      <div>
        <Link
          href="/tags/"
          className="text-ui-caption text-[var(--text-variant)] hover:text-[var(--text)]"
        >
          &larr; All Tags
        </Link>
      </div>
      <div>
        <h1 className="font-sans text-display text-[var(--primary)]">
          #{decoded}
        </h1>
        <p className="mt-1 text-ui-caption text-[var(--text-variant)]">
          {notes.length} note{notes.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {notes.map((n) => (
          <NoteCard
            key={n.slug}
            slug={n.slug}
            title={n.title}
            excerpt={stripMarkdown(n.body).slice(0, 120)}
            tags={n.tags}
            created={n.created}
            category={n.category}
          />
        ))}
      </div>
    </div>
  );
}
