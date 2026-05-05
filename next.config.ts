import type { NextConfig } from "next";

// Switched away from `output: "export"` so API Routes (e.g. /api/health) can
// run on Vercel as Serverless/Edge Functions while the rest of the site is
// still automatically prerendered as static. This gives us:
//   - working /api/* (needed for OpenTelemetry server-side spans)
//   - same fast static delivery for note pages (Next.js ISR/SSG handles it)
//   - no more `next dev` 500s on non-ASCII slugs (the bug was specific to
//     `output: "export"` + dev server)
export default function nextConfig(_phase: string): NextConfig {
  return {
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
    // Type checking + linting are run as separate `tsc --noEmit` / `next lint`
    // steps; skipping them here keeps the build itself snappy.
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    // @vercel/otel needs to be loaded as a server external package so its
    // OpenTelemetry transitive dependencies (which use Node-only APIs) aren't
    // bundled into edge runtime chunks.
    serverExternalPackages: ["@vercel/otel"],
    ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  };
}
