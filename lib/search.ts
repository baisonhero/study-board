import { getAllNotes, type NoteCategory } from "./markdown";

export interface SearchEntry {
  slug: string;
  title: string;
  category: NoteCategory;
  tags: string[];
  body: string; // plain-text excerpt suitable for substring/keyword matching
}

/** Strip markdown noise to produce plain text for search & previews. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, a, b) => b || a)
    .replace(/^>+\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Build a search index for shipping to the client at build time.
 * Body is truncated to keep page-weight reasonable on slow networks.
 */
export function buildSearchIndex(): SearchEntry[] {
  return getAllNotes().map((n) => ({
    slug: n.slug,
    title: n.title,
    category: n.category,
    tags: n.tags,
    body: stripMarkdown(n.body).slice(0, 4000),
  }));
}
