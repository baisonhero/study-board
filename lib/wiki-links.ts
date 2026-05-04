import { buildLinkIndex } from "./markdown";

const WIKI_LINK_REGEX = /\[\[([^\[\]\n]+?)\]\]/g;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Convert Obsidian-style [[wikilinks]] in a markdown string into either
 * standard markdown links (resolved targets) or HTML spans (broken targets).
 *
 * Forms supported:
 *   [[Note Name]]
 *   [[Note Name|Display Text]]
 *   [[Note Name#Heading]]
 *   [[Note Name#Heading|Display Text]]
 */
export function transformWikiLinks(markdown: string): string {
  const index = buildLinkIndex();

  return markdown.replace(WIKI_LINK_REGEX, (_match, inner: string) => {
    let target = inner;
    let alias: string | undefined;

    const pipeIdx = inner.indexOf("|");
    if (pipeIdx !== -1) {
      target = inner.slice(0, pipeIdx).trim();
      alias = inner.slice(pipeIdx + 1).trim();
    }

    let hash = "";
    const hashIdx = target.indexOf("#");
    if (hashIdx !== -1) {
      hash = target.slice(hashIdx);
      target = target.slice(0, hashIdx);
    }

    target = target.trim();
    const display = alias || `${target}${hash}`;
    if (!target) return escapeHtml(display);

    const slug = index.get(target) ?? index.get(target.toLowerCase());
    if (slug) {
      const url = `/notes/${encodeURIComponent(slug)}/${hash}`;
      // Use markdown link form so remark-gfm can parse it normally.
      // Escape brackets/parens inside the alias to keep markdown happy.
      const safeAlias = display.replace(/\\/g, "\\\\").replace(/\]/g, "\\]");
      return `[${safeAlias}](${url})`;
    }
    return `<span class="broken-link" title="${escapeHtml(
      target
    )}">${escapeHtml(display)}</span>`;
  });
}

/** Extract the basenames referenced by [[wikilinks]] in a markdown body. */
export function extractWikiLinkTargets(markdown: string): string[] {
  const out: string[] = [];
  for (const m of markdown.matchAll(WIKI_LINK_REGEX)) {
    const inner = m[1];
    const target = inner.split("|")[0].split("#")[0].trim();
    if (target) out.push(target);
  }
  return out;
}
