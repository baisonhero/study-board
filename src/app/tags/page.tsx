import { getAllTags } from "@/lib/markdown";
import TagBadge from "@/components/TagBadge";

export const metadata = { title: "Tags — Sanctuary" };

export default function TagsPage() {
  const tags = getAllTags();
  return (
    <div className="space-y-6 px-6 py-8 pb-28 lg:px-10 lg:pb-8">
      <div>
        <h1 className="font-sans text-display text-[var(--text)]">Tags</h1>
        <p className="mt-1 font-serif text-reading text-[var(--text-variant)]">
          Explore your knowledge by topic.
        </p>
      </div>
      {tags.length === 0 ? (
        <p className="text-ui-caption text-[var(--text-variant)]">
          No tags yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {tags.map(({ tag, count }) => (
            <TagBadge key={tag} tag={tag} count={count} size="md" />
          ))}
        </div>
      )}
    </div>
  );
}
