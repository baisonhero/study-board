import Link from "next/link";

interface Props {
  tag: string;
  count?: number;
  size?: "sm" | "md";
}

export default function TagBadge({ tag, count, size = "sm" }: Props) {
  const sizeClasses =
    size === "md"
      ? "px-4 py-2 text-sm min-h-[44px]"
      : "px-2.5 py-1 text-[11px]";

  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}/`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--outline-variant)] bg-[var(--bg-container)] font-sans font-medium text-[var(--primary)] transition-colors hover:border-[var(--primary)]/40 hover:bg-[var(--bg-high)] hover:no-underline ${sizeClasses}`}
    >
      <span>#{tag}</span>
      {count !== undefined && (
        <span className="text-[var(--outline)]">{count}</span>
      )}
    </Link>
  );
}
