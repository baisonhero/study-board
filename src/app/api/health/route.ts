import { trace, SpanStatusCode } from "@opentelemetry/api";
import { NextResponse } from "next/server";

// Force the Node.js runtime so the OpenTelemetry NodeSDK (registered in
// src/instrumentation.ts) picks up these requests. The default edge runtime
// doesn't expose the APIs the OTLP exporter needs.
export const runtime = "nodejs";

const startupTime = Date.now();

export async function GET() {
  const tracer = trace.getTracer("obsidian-replica-api");
  return tracer.startActiveSpan("GET /api/health", async (span) => {
    try {
      span.setAttribute("app.endpoint", "/api/health");
      span.setAttribute("app.runtime", "nodejs");

      const result = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime_ms: Date.now() - startupTime,
        service: "obsidian-replica-api",
        env: process.env.NODE_ENV ?? "unknown",
        otel_enabled: Boolean(
          process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
        ),
      };

      span.setStatus({ code: SpanStatusCode.OK });
      return NextResponse.json(result);
    } catch (e) {
      span.recordException(e as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: e instanceof Error ? e.message : String(e),
      });
      throw e;
    } finally {
      span.end();
    }
  });
}
