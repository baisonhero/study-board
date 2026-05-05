"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { GraphData, GraphNode, GraphEdge } from "@/lib/graph";

interface Props {
  data: GraphData;
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const WIDTH = 800;
const HEIGHT = 600;
const NODE_RADIUS_MIN = 4;
const NODE_RADIUS_MAX = 12;

function layout(data: GraphData): { nodes: SimNode[]; edges: GraphEdge[] } {
  const nodes: SimNode[] = data.nodes.map((n, i) => ({
    ...n,
    x: WIDTH / 2 + (Math.cos((i / data.nodes.length) * Math.PI * 2) * WIDTH) / 3 + (Math.random() - 0.5) * 50,
    y: HEIGHT / 2 + (Math.sin((i / data.nodes.length) * Math.PI * 2) * HEIGHT) / 3 + (Math.random() - 0.5) * 50,
    vx: 0,
    vy: 0,
  }));

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (let iter = 0; iter < 150; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 800 / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    for (const edge of data.edges) {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) continue;
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 80) * 0.005;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      src.vx += fx;
      src.vy += fy;
      tgt.vx -= fx;
      tgt.vy -= fy;
    }

    for (const node of nodes) {
      node.vx += (WIDTH / 2 - node.x) * 0.001;
      node.vy += (HEIGHT / 2 - node.y) * 0.001;
    }

    const damping = 0.85;
    for (const node of nodes) {
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
      node.x = Math.max(30, Math.min(WIDTH - 30, node.x));
      node.y = Math.max(30, Math.min(HEIGHT - 30, node.y));
    }
  }

  return { nodes, edges: data.edges };
}

export default function GraphClient({ data }: Props) {
  const router = useRouter();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [mounted, setMounted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only compute layout on client to avoid hydration mismatch from Math.random()
  const graph = useMemo(() => {
    if (!mounted) return null;
    return layout(data);
  }, [data, mounted]);

  const nodeMap = useMemo(
    () => (graph ? new Map(graph.nodes.map((n) => [n.id, n])) : new Map()),
    [graph]
  );

  const maxLinks = graph
    ? Math.max(1, ...graph.nodes.map((n) => n.linkCount))
    : 1;
  const getRadius = (n: SimNode) =>
    NODE_RADIUS_MIN +
    (n.linkCount / maxLinks) * (NODE_RADIUS_MAX - NODE_RADIUS_MIN);

  const handleNodeClick = useCallback(
    (slug: string) => {
      router.push(`/notes/${encodeURIComponent(slug)}/`);
    },
    [router]
  );

  return (
    <div className="space-y-4 px-6 py-8 pb-28 lg:px-10 lg:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-display text-[var(--text)]">
            Knowledge Graph
          </h1>
          <p className="mt-1 font-serif text-ui-caption text-[var(--text-variant)]">
            {data.nodes.length} nodes, {data.edges.length} connections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--outline-variant)] bg-[var(--bg-container)] text-[var(--text-variant)] hover:bg-[var(--bg-high)] hover:text-[var(--text)]"
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--outline-variant)] bg-[var(--bg-container)] text-[var(--text-variant)] hover:bg-[var(--bg-high)] hover:text-[var(--text)]"
          >
            -
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--bg-low)]">
        {!graph ? (
          <div className="flex h-[60vh] min-h-[400px] items-center justify-center text-[var(--text-variant)]">
            Loading graph...
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-[60vh] w-full"
            style={{ minHeight: 400 }}
          >
            <defs>
              <radialGradient id="nodeGlow">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </radialGradient>
            </defs>

            <g transform={`scale(${zoom}) translate(${(1 - zoom) * WIDTH / 2 / zoom}, ${(1 - zoom) * HEIGHT / 2 / zoom})`}>
              {graph.edges.map((e, i) => {
                const src = nodeMap.get(e.source);
                const tgt = nodeMap.get(e.target);
                if (!src || !tgt) return null;
                const isHighlighted =
                  hoveredNode === e.source || hoveredNode === e.target;
                return (
                  <line
                    key={i}
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    className="graph-edge"
                    style={{
                      opacity: isHighlighted ? 0.8 : 0.2,
                      stroke: isHighlighted
                        ? "var(--primary)"
                        : "var(--outline-variant)",
                      transition: "opacity 0.2s, stroke 0.2s",
                    }}
                  />
                );
              })}

              {graph.nodes.map((n) => {
                const r = getRadius(n);
                const isHovered = hoveredNode === n.id;
                return (
                  <g
                    key={n.id}
                    onClick={() => handleNodeClick(n.slug)}
                    onMouseEnter={() => setHoveredNode(n.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    {isHovered && (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={r * 3}
                        fill="url(#nodeGlow)"
                      />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r}
                      fill={isHovered ? "var(--primary)" : "var(--primary-on-container)"}
                      className="graph-node"
                      style={{
                        filter: isHovered
                          ? "drop-shadow(0 0 12px rgba(182, 202, 204, 0.7))"
                          : `drop-shadow(0 0 ${2 + n.linkCount}px rgba(182, 202, 204, 0.3))`,
                      }}
                    />
                    {isHovered && (
                      <g>
                        <rect
                          x={n.x - 4}
                          y={n.y + r + 6}
                          width={n.title.length * 7 + 16}
                          height={24}
                          rx={6}
                          fill="var(--bg-container)"
                          stroke="var(--glass-border)"
                          strokeWidth={1}
                        />
                        <text
                          x={n.x + 4}
                          y={n.y + r + 22}
                          fill="var(--text)"
                          fontSize={12}
                          fontFamily="Inter, sans-serif"
                        >
                          {n.title}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}
