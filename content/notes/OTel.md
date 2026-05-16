---
tags: [inbox, learning, observability]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - OpenTelemetry
---

# OTel

> [!summary]
> **OTel** は **[[OpenTelemetry]]** の略称・通称。本ノートはエイリアスとして残す位置づけ。実体は [[OpenTelemetry]] を参照。

## 経緯

OpenTelemetry は名前が長く、口頭でも文書でも `OTel` という略称が定着している。プロトコル名 **OTLP** (OpenTelemetry Protocol)、ライブラリ名 `opentelemetry-instrumentation-*`、Collector名 **OTel Collector** など、関連用語で略称が使われる。

## 主要キーワード（[[OpenTelemetry]] への入口）

- **OTLP**: 標準プロトコル（gRPC / HTTP）
- **OTel SDK**: アプリ側の計装ライブラリ。Python / Java / Go / Node / .NET / Ruby / Rust 等
- **OTel Collector**: テレメトリの集約・ルーティング・サンプリング・PII削除を担うプロキシ
- **OTel Operator**: KubernetesでCollectorとAuto-instrumentationを管理するOperator
- **OTel SemConv (Semantic Conventions)**: Span属性・メトリクス名・ログ属性の標準命名規則

## 3本柱

- Traces
- Metrics
- Logs

詳細は [[OpenTelemetry]] および [[OTelで送れる情報の全体像]] を参照。

## 出典

- OpenTelemetry: https://opentelemetry.io/
- Semantic Conventions: https://opentelemetry.io/docs/specs/semconv/

## 関連MOC

- [[MOC Observability]]

## 関連ノート

- [[OpenTelemetry]]
- [[OTelで送れる情報の全体像]]
- [[Observability]]
- [[システム監視と可観測性]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
