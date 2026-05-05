import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 px-6 py-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-container)]">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-variant)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>
      <div>
        <h1 className="font-sans text-2xl font-bold text-[var(--text)]">
          Page not found
        </h1>
        <p className="mt-2 font-serif text-reading text-[var(--text-variant)]">
          The note or page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary-dark)] px-5 py-2.5 font-sans text-ui-main text-[var(--primary)] transition-colors hover:bg-[var(--bg-container)] hover:no-underline"
      >
        &larr; Back to Library
      </Link>
    </div>
  );
}
