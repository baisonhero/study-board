"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchEntry } from "@/lib/search";

interface Props {
  index: SearchEntry[];
}

interface Hit {
  entry: SearchEntry;
  preview: string;
  score: number;
}

const PREVIEW_RADIUS = 60;
const MAX_RESULTS = 50;

function makePreview(body: string, qLower: string): string {
  if (!qLower) return body.slice(0, 140);
  const idx = body.toLowerCase().indexOf(qLower);
  if (idx === -1) return body.slice(0, 140);
  const start = Math.max(0, idx - PREVIEW_RADIUS);
  const end = Math.min(body.length, idx + qLower.length + PREVIEW_RADIUS);
  const snippet = body.slice(start, end).trim();
  return (start > 0 ? "..." : "") + snippet + (end < body.length ? "..." : "");
}

function highlight(text: string, qLower: string): React.ReactNode {
  if (!qLower) return text;
  const lower = text.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let i = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const found = lower.indexOf(qLower, cursor);
    if (found === -1) {
      parts.push(text.slice(cursor));
      break;
    }
    if (found > cursor) parts.push(text.slice(cursor, found));
    parts.push(
      <mark
        key={i++}
        className="rounded bg-[var(--tertiary)]/25 px-0.5 text-[var(--text)]"
      >
        {text.slice(found, found + qLower.length)}
      </mark>
    );
    cursor = found + qLower.length;
  }
  return parts;
}

export default function SearchClient({ index }: Props) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hits = useMemo<Hit[]>(() => {
    const query = q.trim();
    if (!query) return [];
    const qLower = query.toLowerCase();
    const out: Hit[] = [];
    for (const entry of index) {
      const titleHit = entry.title.toLowerCase().includes(qLower);
      const tagHit = entry.tags.some((t) => t.toLowerCase().includes(qLower));
      const bodyHit = entry.body.toLowerCase().includes(qLower);
      if (!titleHit && !tagHit && !bodyHit) continue;
      const score =
        (titleHit ? 100 : 0) + (tagHit ? 50 : 0) + (bodyHit ? 1 : 0);
      out.push({
        entry,
        preview: makePreview(entry.body, qLower),
        score,
      });
    }
    out.sort(
      (a, b) =>
        b.score - a.score || a.entry.title.localeCompare(b.entry.title)
    );
    return out.slice(0, MAX_RESULTS);
  }, [q, index]);

  const qLower = q.trim().toLowerCase();

  return (
    <div className="space-y-4">
      {/* Glassmorphic search input */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-variant)]"
          width="18"
          height="18"
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
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Traverse your second brain... (${index.length} notes)`}
          className="w-full rounded-xl border border-[var(--outline-variant)] bg-[var(--bg-container)] py-3.5 pl-11 pr-4 font-sans text-base text-[var(--text)] placeholder:text-[var(--text-variant)] focus:border-[var(--tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--tertiary)]/30"
        />
      </div>

      {q.trim() === "" ? (
        <p className="text-ui-caption text-[var(--text-variant)]">
          Search across titles, tags, and content.
        </p>
      ) : hits.length === 0 ? (
        <p className="text-ui-caption text-[var(--text-variant)]">
          No notes matching &quot;{q}&quot;.
        </p>
      ) : (
        <>
          <p className="text-ui-caption text-[var(--text-variant)]">
            {hits.length} result{hits.length !== 1 ? "s" : ""}
            {hits.length === MAX_RESULTS ? " (top)" : ""}
          </p>
          <ul className="space-y-2">
            {hits.map((h) => (
              <li key={h.entry.slug}>
                <Link
                  href={`/notes/${encodeURIComponent(h.entry.slug)}/`}
                  className="group block rounded-lg border border-[var(--outline-variant)] bg-[var(--bg-container)] px-4 py-3.5 transition-all hover:border-[var(--primary)]/40 hover:bg-[var(--bg-high)] hover:no-underline hover:shadow-glass"
                >
                  <div className="font-sans text-base font-medium text-[var(--text)] group-hover:text-[var(--primary)]">
                    {highlight(h.entry.title, qLower)}
                  </div>
                  {h.entry.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {h.entry.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[var(--primary-dark)] px-2 py-0.5 text-[10px] text-[var(--primary)]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                  {h.preview && (
                    <p className="mt-2 line-clamp-3 font-serif text-ui-caption text-[var(--text-variant)]">
                      {highlight(h.preview, qLower)}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
