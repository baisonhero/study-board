import { getAllNotes, buildLinkIndex } from "./markdown";
import { extractWikiLinkTargets } from "./wiki-links";

export interface GraphNode {
  id: string;
  slug: string;
  title: string;
  category: string;
  linkCount: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildGraphData(): GraphData {
  const notes = getAllNotes();
  const linkIndex = buildLinkIndex();

  const nodeMap = new Map<string, GraphNode>();
  for (const n of notes) {
    nodeMap.set(n.slug, {
      id: n.slug,
      slug: n.slug,
      title: n.title,
      category: n.category,
      linkCount: 0,
    });
  }

  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  for (const note of notes) {
    const targets = extractWikiLinkTargets(note.body);
    for (const t of targets) {
      const targetSlug = linkIndex.get(t) ?? linkIndex.get(t.toLowerCase());
      if (!targetSlug || targetSlug === note.slug) continue;
      if (!nodeMap.has(targetSlug)) continue;

      const edgeKey = [note.slug, targetSlug].sort().join("||");
      if (edgeSet.has(edgeKey)) continue;
      edgeSet.add(edgeKey);

      edges.push({ source: note.slug, target: targetSlug });

      const srcNode = nodeMap.get(note.slug);
      const tgtNode = nodeMap.get(targetSlug);
      if (srcNode) srcNode.linkCount++;
      if (tgtNode) tgtNode.linkCount++;
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}
