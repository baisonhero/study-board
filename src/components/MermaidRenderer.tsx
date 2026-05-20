"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Render <pre class="mermaid">...</pre> blocks as Mermaid diagrams.
 *
 * The markdown pipeline (lib/markdown.ts) converts ```mermaid code blocks
 * into <pre class="mermaid">SOURCE</pre> nodes (without syntax-highlight).
 * This client component lazy-loads `mermaid` after hydration and triggers
 * rendering on every route change so SPA navigation works.
 */
export default function MermaidRenderer() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const m = await import("mermaid");
        if (cancelled) return;
        const mermaid = m.default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          fontFamily:
            "var(--font-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif)",
        });
        // Reset any nodes that were previously processed (so re-rendering on
        // route change actually re-paints).
        document
          .querySelectorAll<HTMLPreElement>("pre.mermaid")
          .forEach((el) => {
            if (el.dataset.processed === "true") {
              // Restore original source from cache so mermaid.run() will
              // re-process it.
              const src = el.dataset.source;
              if (src) {
                el.innerHTML = src;
                el.removeAttribute("data-processed");
              }
            } else {
              // Cache the original source the first time we see this block.
              el.dataset.source = el.textContent ?? "";
            }
          });
        await mermaid.run({ querySelector: "pre.mermaid" });
      } catch (err) {
        // Diagrams will show as fallback text — log so we know in dev.
        console.warn("[MermaidRenderer] render failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
