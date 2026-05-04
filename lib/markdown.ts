import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { transformWikiLinks, extractWikiLinkTargets } from "./wiki-links";

export const CONTENT_DIR = path.join(process.cwd(), "content");

export type NoteCategory = "note" | "daily" | "weekly";

export interface NoteFrontmatter {
  title?: string;
  tags?: string[] | string;
  created?: string;
  [key: string]: unknown;
}

export interface Note {
  slug: string;
  filePath: string;
  title: string;
  basename: string;
  category: NoteCategory;
  frontmatter: NoteFrontmatter;
  body: string;
  tags: string[];
  created?: string;
}

const EXCLUDED_DIRS = new Set([
  "_templates",
  "_attachments",
  "raw",
  ".git",
  ".obsidian",
  ".trash",
  "node_modules",
]);

function walk(dir: string, base = dir): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (EXCLUDED_DIRS.has(e.name) || e.name.startsWith(".")) continue;
      files.push(...walk(full, base));
    } else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) {
      files.push(path.relative(base, full));
    }
  }
  return files;
}

function categorize(relPath: string): NoteCategory {
  const top = relPath.split(path.sep)[0];
  if (top === "_daily") return "daily";
  if (top === "_weekly") return "weekly";
  return "note";
}

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim().replace(/^#/, "")).filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,\s]+/)
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);
  }
  return [];
}

/**
 * Normalize a basename into a URL-friendly slug.
 *
 * Collapses whitespace runs to single hyphens. Non-ASCII characters
 * (e.g. Japanese) are preserved — browsers percent-encode them in the
 * request URL, and Next.js routing matches the decoded form correctly
 * outside of dev-mode `output: "export"` (see `next.config.ts`).
 */
function slugify(basename: string): string {
  return basename.trim().replace(/\s+/g, "-");
}

let cachedNotes: Note[] | null = null;

export function getAllNotes(): Note[] {
  if (cachedNotes) return cachedNotes;
  const files = walk(CONTENT_DIR).sort();
  const slugCount = new Map<string, number>();
  const notes: Note[] = files.map((rel) => {
    const full = path.join(CONTENT_DIR, rel);
    const raw = fs.readFileSync(full, "utf8");
    const { data, content } = matter(raw);
    const basename = path.basename(rel, path.extname(rel));
    const slugBase = slugify(basename);

    let slug = slugBase;
    const n = slugCount.get(slug) ?? 0;
    if (n > 0) slug = `${slugBase}-${n + 1}`;
    slugCount.set(slugBase, n + 1);

    const fm = data as NoteFrontmatter;
    const tags = normalizeTags(fm.tags);
    const titleFm = typeof fm.title === "string" ? fm.title.trim() : "";
    return {
      slug,
      filePath: rel,
      title: titleFm || basename,
      basename,
      category: categorize(rel),
      frontmatter: fm,
      body: content,
      tags,
      created: typeof fm.created === "string" ? fm.created : undefined,
    };
  });
  cachedNotes = notes;
  return notes;
}

export function getNoteBySlug(slug: string): Note | undefined {
  return getAllNotes().find((n) => n.slug === slug);
}

export function getNotesByCategory(cat: NoteCategory): Note[] {
  return getAllNotes().filter((n) => n.category === cat);
}

export function getAllTags(): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const n of getAllNotes()) {
    for (const t of n.tags) map.set(t, (map.get(t) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getNotesByTag(tag: string): Note[] {
  return getAllNotes().filter((n) => n.tags.includes(tag));
}

let cachedLinkIndex: Map<string, string> | null = null;

/** Map basename (and lowercase variant) → slug, for wikilink resolution. */
export function buildLinkIndex(): Map<string, string> {
  if (cachedLinkIndex) return cachedLinkIndex;
  const map = new Map<string, string>();
  for (const n of getAllNotes()) {
    if (!map.has(n.basename)) map.set(n.basename, n.slug);
    const lower = n.basename.toLowerCase();
    if (!map.has(lower)) map.set(lower, n.slug);
  }
  cachedLinkIndex = map;
  return map;
}

let cachedBacklinks: Map<string, { slug: string; title: string }[]> | null =
  null;

export function buildBacklinks(): Map<
  string,
  { slug: string; title: string }[]
> {
  if (cachedBacklinks) return cachedBacklinks;
  const map = new Map<string, { slug: string; title: string }[]>();
  const linkIndex = buildLinkIndex();
  for (const note of getAllNotes()) {
    const targets = extractWikiLinkTargets(note.body);
    const seen = new Set<string>();
    for (const t of targets) {
      const targetSlug = linkIndex.get(t) ?? linkIndex.get(t.toLowerCase());
      if (!targetSlug || targetSlug === note.slug) continue;
      if (seen.has(targetSlug)) continue;
      seen.add(targetSlug);
      const arr = map.get(targetSlug) ?? [];
      arr.push({ slug: note.slug, title: note.title });
      map.set(targetSlug, arr);
    }
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => a.title.localeCompare(b.title));
  }
  cachedBacklinks = map;
  return map;
}

export function getBacklinks(
  slug: string
): { slug: string; title: string }[] {
  return buildBacklinks().get(slug) ?? [];
}

/** Render a markdown body to HTML, including wikilink transforms. */
export async function renderMarkdown(md: string): Promise<string> {
  const transformed = transformWikiLinks(md);
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(transformed);
  return String(file);
}

/** Find the MOC Home note (case-insensitive variants). */
export function getHomeNote(): Note | undefined {
  const candidates = ["MOC Home", "MOC", "Home", "index"];
  const all = getAllNotes();
  for (const c of candidates) {
    const found =
      all.find((n) => n.basename === c) ||
      all.find((n) => n.basename.toLowerCase() === c.toLowerCase());
    if (found) return found;
  }
  return undefined;
}
