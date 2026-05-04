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
  return (start > 0 ? "…" : "") + snippet + (end < body.length ? "…" : "");
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
        className="rounded bg-[var(--link)]/30 px-0.5 text-[var(--text)]"
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
      const score = (titleHit ? 100 : 0) + (tagHit ? 50 : 0) + (bodyHit ? 1 : 0);
      out.push({
        entry,
        preview: makePreview(entry.body, qLower),
        score,
      });
    }
    out.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
    return out.slice(0, MAX_RESULTS);
  }, [q, index]);

  const qLower = q.trim().toLowerCase();

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        autoComplete="off"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`${index.length} 件のノートを検索…`}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-4 py-3 text-base text-[var(--text)] placeholder:text-[var(--subtext)] focus:border-[var(--link)] focus:outline-none"
      />

      {q.trim() === "" ? (
        <p className="text-sm text-[var(--subtext)]">
          タイトル・タグ・本文を対象に検索します。
        </p>
      ) : hits.length === 0 ? (
        <p className="text-sm text-[var(--subtext)]">
          「{q}」に一致するノートはありません。
        </p>
      ) : (
        <>
          <p className="text-xs text-[var(--subtext)]">
            {hits.length} 件{hits.length === MAX_RESULTS ? "（上位）" : ""}
          </p>
          <ul className="space-y-2">
            {hits.map((h) => (
              <li
                key={h.entry.slug}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-elev)]"
              >
                <Link
                  href={`/notes/${encodeURIComponent(h.entry.slug)}/`}
                  className="block px-4 py-3 hover:no-underline"
                >
                  <div className="text-base font-medium text-[var(--text)]">
                    {highlight(h.entry.title, qLower)}
                  </div>
                  {h.entry.tags.length > 0 && (
                    <div className="mt-1 text-xs text-[var(--tag)]">
                      {h.entry.tags.map((t) => `#${t}`).join("  ")}
                    </div>
                  )}
                  {h.preview && (
                    <p className="mt-2 line-clamp-3 text-sm text-[var(--subtext)]">
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
