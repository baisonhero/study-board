import Link from "next/link";

interface NavItem {
  slug: string;
  title: string;
  category: string;
}

interface TagItem {
  tag: string;
  count: number;
}

interface Props {
  navItems: NavItem[];
  tags: TagItem[];
  onClose: () => void;
  className?: string;
}

export default function Sidebar({
  navItems,
  tags,
  onClose,
  className = "",
}: Props) {
  const notes = navItems.filter((n) => n.category === "note");
  const daily = navItems.filter((n) => n.category === "daily");
  const weekly = navItems.filter((n) => n.category === "weekly");

  return (
    <aside
      className={`flex flex-col border-r border-[var(--glass-border)] bg-[var(--bg-low)] ${className}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-dark)]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div>
          <Link
            href="/"
            onClick={onClose}
            className="text-base font-semibold tracking-tight text-[var(--text)] hover:no-underline"
          >
            Sanctuary
          </Link>
          <p className="text-ui-caption text-[var(--text-variant)]">
            Personal Vault
          </p>
        </div>
      </div>

      {/* Search link */}
      <div className="px-4 pb-3">
        <Link
          href="/search/"
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg border border-[var(--outline-variant)] px-3 py-2 text-ui-caption text-[var(--text-variant)] hover:border-[var(--primary)] hover:text-[var(--text)] hover:no-underline"
        >
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search notes...</span>
        </Link>
      </div>

      {/* Navigation sections */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-4">
        {/* Quick links */}
        <div className="mb-4 space-y-0.5">
          <SidebarLink
            href="/"
            onClick={onClose}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            }
            label="Library"
          />
          <SidebarLink
            href="/graph/"
            onClick={onClose}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <circle cx="4" cy="6" r="2" />
                <circle cx="20" cy="6" r="2" />
                <circle cx="4" cy="18" r="2" />
                <circle cx="20" cy="18" r="2" />
                <line x1="9.5" y1="10.5" x2="5.5" y2="7.5" />
                <line x1="14.5" y1="10.5" x2="18.5" y2="7.5" />
                <line x1="9.5" y1="13.5" x2="5.5" y2="16.5" />
                <line x1="14.5" y1="13.5" x2="18.5" y2="16.5" />
              </svg>
            }
            label="Knowledge Graph"
          />
          <SidebarLink
            href="/tags/"
            onClick={onClose}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            }
            label="Tags"
          />
        </div>

        {/* Notes */}
        {notes.length > 0 && (
          <SidebarSection title="NOTES" count={notes.length}>
            {notes
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/notes/${encodeURIComponent(n.slug)}/`}
                    onClick={onClose}
                    className="block truncate rounded px-2 py-1.5 text-ui-caption text-[var(--text-variant)] hover:bg-[var(--bg-container)] hover:text-[var(--text)] hover:no-underline"
                  >
                    {n.title}
                  </Link>
                </li>
              ))}
          </SidebarSection>
        )}

        {/* Daily logs */}
        {daily.length > 0 && (
          <SidebarSection title="DAILY LOGS" count={daily.length}>
            {daily
              .slice()
              .reverse()
              .slice(0, 10)
              .map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/notes/${encodeURIComponent(n.slug)}/`}
                    onClick={onClose}
                    className="block truncate rounded px-2 py-1.5 text-ui-caption text-[var(--text-variant)] hover:bg-[var(--bg-container)] hover:text-[var(--text)] hover:no-underline"
                  >
                    {n.title}
                  </Link>
                </li>
              ))}
          </SidebarSection>
        )}

        {/* Weekly reviews */}
        {weekly.length > 0 && (
          <SidebarSection title="WEEKLY REVIEWS" count={weekly.length}>
            {weekly
              .slice()
              .reverse()
              .slice(0, 10)
              .map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/notes/${encodeURIComponent(n.slug)}/`}
                    onClick={onClose}
                    className="block truncate rounded px-2 py-1.5 text-ui-caption text-[var(--text-variant)] hover:bg-[var(--bg-container)] hover:text-[var(--text)] hover:no-underline"
                  >
                    {n.title}
                  </Link>
                </li>
              ))}
          </SidebarSection>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <SidebarSection title="TAGS" count={tags.length}>
            <li className="flex flex-wrap gap-1.5 px-1">
              {tags.slice(0, 20).map(({ tag, count }) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}/`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-container)] px-2.5 py-1 text-[11px] text-[var(--primary)] hover:bg-[var(--bg-high)] hover:no-underline"
                >
                  #{tag}
                  <span className="text-[var(--text-variant)]">{count}</span>
                </Link>
              ))}
            </li>
          </SidebarSection>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--glass-border)] px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary-dark)] text-xs font-semibold text-[var(--primary)]">
            S
          </div>
          <span className="text-ui-caption text-[var(--text-variant)]">
            Scholar
          </span>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  onClick,
  icon,
  label,
}: {
  href: string;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-ui-main text-[var(--text-variant)] hover:bg-[var(--bg-container)] hover:text-[var(--text)] hover:no-underline"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function SidebarSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <h3 className="mb-1.5 flex items-center justify-between px-2 text-ui-label uppercase text-[var(--text-variant)]">
        <span>{title}</span>
        <span className="text-[10px] font-normal normal-case text-[var(--outline)]">
          {count}
        </span>
      </h3>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}
