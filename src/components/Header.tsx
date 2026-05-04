import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/75">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4">
        <Link
          href="/"
          className="tap text-base font-semibold text-[var(--text)] hover:no-underline"
        >
          Vault
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/search/"
            className="tap text-sm text-[var(--subtext)] hover:text-[var(--link)] hover:no-underline"
          >
            検索
          </Link>
          <Link
            href="/tags/"
            className="tap text-sm text-[var(--subtext)] hover:text-[var(--link)] hover:no-underline"
          >
            タグ
          </Link>
        </nav>
      </div>
    </header>
  );
}
