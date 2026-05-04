import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, getNotesByTag } from "@/lib/markdown";
import NoteList from "@/components/NoteList";

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
  return { title: `#${decodeURIComponent(tag)} — Vault` };
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
    <div className="space-y-4">
      <div>
        <Link
          href="/tags/"
          className="text-sm text-[var(--subtext)] hover:text-[var(--link)]"
        >
          ← タグ一覧
        </Link>
      </div>
      <h1 className="text-xl font-bold text-[var(--tag)]">
        #{decoded}{" "}
        <span className="text-sm font-normal text-[var(--subtext)]">
          ({notes.length})
        </span>
      </h1>
      <NoteList notes={notes} />
    </div>
  );
}
