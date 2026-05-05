// Browser-side OpenTelemetry initialization. Next.js 15.5 picks up
// `instrumentation-client.ts` at the project root and runs it once before any
// page hydrates.
//
// Disabled gracefully: if NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT is
// unset, no provider is registered and the rest of the app behaves exactly
// as before.

import { trace, SpanStatusCode, type Tracer } from "@opentelemetry/api";
import {
  WebTracerProvider,
  BatchSpanProcessor,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
  type SpanProcessor,
} from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";

const SERVICE_NAME =
  process.env.NEXT_PUBLIC_OTEL_SERVICE_NAME ?? "obsidian-replica";
const ENDPOINT = process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
const HEADERS_RAW = process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_HEADERS;

let tracer: Tracer | null = null;

if (typeof window !== "undefined" && ENDPOINT) {
  const headers = parseHeaders(HEADERS_RAW);

  // Build span processors before constructing the provider (Next 15 OTel API).
  const processors: SpanProcessor[] = [
    new BatchSpanProcessor(
      new OTLPTraceExporter({ url: ENDPOINT, headers }),
    ),
  ];
  if (process.env.NODE_ENV === "development") {
    processors.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  }

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
      "deployment.environment": process.env.NODE_ENV ?? "development",
    }),
    spanProcessors: processors,
  });

  provider.register({ contextManager: new ZoneContextManager() });

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        // Propagate trace context to our own /api/* routes only — avoid leaking
        // trace headers to third-party origins (CDN, analytics, etc).
        propagateTraceHeaderCorsUrls: [/^\/api\//, /^https?:\/\/[^/]+\/api\//],
      }),
      new UserInteractionInstrumentation({
        eventNames: ["click", "submit"],
      }),
    ],
  });

  tracer = trace.getTracer(SERVICE_NAME);

  installWebVitals(tracer);
  installGlobalErrorCapture(tracer);
}

function parseHeaders(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  return raw.split(",").reduce<Record<string, string>>((acc, pair) => {
    const idx = pair.indexOf("=");
    if (idx <= 0) return acc;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    if (k) acc[k] = v;
    return acc;
  }, {});
}

function installWebVitals(t: Tracer) {
  // Lazy-load web-vitals so it doesn't block first paint.
  import("web-vitals")
    .then(({ onCLS, onLCP, onINP, onTTFB, onFCP }) => {
      const record =
        (name: string) =>
        (metric: { value: number; rating?: string; id: string }) => {
          const span = t.startSpan(`web-vital ${name}`);
          span.setAttribute("web_vital.name", name);
          span.setAttribute("web_vital.value", metric.value);
          span.setAttribute("web_vital.id", metric.id);
          if (metric.rating) {
            span.setAttribute("web_vital.rating", metric.rating);
          }
          span.end();
        };
      onCLS(record("CLS"));
      onLCP(record("LCP"));
      onINP(record("INP"));
      onTTFB(record("TTFB"));
      onFCP(record("FCP"));
    })
    .catch((err) =>
      // eslint-disable-next-line no-console
      console.warn("[otel] web-vitals load failed", err),
    );
}

function installGlobalErrorCapture(t: Tracer) {
  window.addEventListener("error", (event) => {
    const span = t.startSpan("window.error");
    span.recordException(event.error ?? new Error(event.message));
    span.setStatus({ code: SpanStatusCode.ERROR, message: event.message });
    span.end();
  });
  window.addEventListener("unhandledrejection", (event) => {
    const span = t.startSpan("unhandledrejection");
    const reason = event.reason;
    span.recordException(
      reason instanceof Error ? reason : new Error(String(reason)),
    );
    span.setStatus({ code: SpanStatusCode.ERROR, message: String(reason) });
    span.end();
  });
}
