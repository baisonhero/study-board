import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// `output: "export"` triggers a Next.js 15 dev-server bug where
// generateStaticParams pathnames are matched literally against the
// URL-encoded request path, so any slug containing a space or non-ASCII
// character ("MOC Learning", "Kubernetes基礎", …) 500s under `next dev`.
// Scope the static export to non-dev phases; the production build still
// emits a fully static `out/` directory.
export default function nextConfig(phase: string): NextConfig {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    ...(isDev ? {} : { output: "export" }),
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
    // Type checking + linting are run as separate `tsc --noEmit` / `next lint`
    // steps; skipping them here keeps the build itself snappy.
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  };
}
