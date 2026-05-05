// Server-side OpenTelemetry registration for Next.js 15.5.
//
// We use @vercel/otel — Vercel's first-party Next.js integration — instead of
// the bare @opentelemetry/sdk-node. Reason: NodeSDK pulls in the gRPC
// exporter transitively, which Next.js's webpack config can't bundle for the
// edge/Node runtime split. @vercel/otel uses HTTP-only exporters and is
// designed to work with Next's instrumentation hook out of the box.
//
// Disabled gracefully: if OTEL_EXPORTER_OTLP_TRACES_ENDPOINT is unset, we
// don't register anything and the app behaves exactly as before.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) return;

  const { registerOTel, OTLPHttpJsonTraceExporter } = await import(
    "@vercel/otel"
  );

  registerOTel({
    serviceName:
      process.env.OTEL_SERVICE_NAME ?? "obsidian-replica-api",
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
      headers: parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
    }),
    attributes: {
      "deployment.environment": process.env.NODE_ENV ?? "development",
      "service.version": process.env.npm_package_version ?? "0.0.0",
    },
  });
}

function parseHeaders(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  // Standard OTel format: "key1=value1,key2=value2"
  return raw.split(",").reduce<Record<string, string>>((acc, pair) => {
    const idx = pair.indexOf("=");
    if (idx <= 0) return acc;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    if (k) acc[k] = v;
    return acc;
  }, {});
}
