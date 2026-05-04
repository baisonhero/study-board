import Link from "next/link";
import { getAllTags } from "@/lib/markdown";

export const metadata = { title: "タグ一覧 — Vault" };

export default function TagsPage() {
  const tags = getAllTags();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">タグ一覧 ({tags.length})</h1>
      {tags.length === 0 ? (
        <p className="text-sm text-[var(--subtext)]">タグがありません。</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}/`}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elev)] px-4 text-sm text-[var(--tag)] hover:no-underline"
            >
              <span>#{tag}</span>
              <span className="text-xs text-[var(--subtext)]">{count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
