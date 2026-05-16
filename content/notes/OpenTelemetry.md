---
tags: [inbox, learning, observability]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - OTel
  - opentelemetry
  - otel
---

# OpenTelemetry

> [!summary]
> **OpenTelemetry (OTel)** は分散システムの **テレメトリ（トレース・メトリクス・ログ）** を計装し、ベンダー中立に送信するためのオープンスタンダード。CNCF配下の卒業プロジェクトで、OpenCensus と OpenTracing が統合された後継。**「アプリケーション側のSDK」と「収集・送信を担うCollector」**の2層で構成され、バックエンドを Datadog / New Relic / Grafana / Honeycomb など自由に差し替えられるのが最大の利点。

## なぜ重要か

OTel以前は、各ベンダーが独自の計装ライブラリを配っていた（Datadog Agent、New Relic Agent等）。一度組み込むとロックインされ、移行コストが高かった。OTelは **計装インターフェースを標準化** することで、SDKは1度書けばエクスポート先を差し替え可能にした。Datadogもいまや OTel互換のインテークを公式提供している。

## 3本柱（Signals）

- **Traces**: リクエストが複数サービスを跨ぐときの因果関係。Span / SpanContext / Trace ID で構成。[[OTelで送れる情報の全体像]] 参照
- **Metrics**: 数値の時系列。Counter / Gauge / Histogram。Prometheus互換のメトリクスとしてもエクスポート可能
- **Logs**: 構造化ログ。Trace ID と紐付けることで「このトレースのこの瞬間のログだけ」を引ける

将来的に Profiling（CPUプロファイル）も4本目の柱として標準化される予定（experimental）。

## アーキテクチャ

```
[App SDK] --OTLP--> [OTel Collector] --(複数のエクスポータ)--> Datadog
                                                            --> Grafana Tempo/Mimir/Loki
                                                            --> Honeycomb
                                                            --> S3 (aws-otlp)
```

**Collector** は中央集約のプロキシ。サンプリング・PII削除・ルーティング・複数バックエンド同時送信などを担う。プロトコルは **OTLP (OpenTelemetry Protocol)** が標準で、gRPC または HTTP/Protobuf で動く。

## 計装方式

- **Auto-instrumentation**（自動計装）: Java / .NET / Python / Node でエージェントをアタッチするだけで主要ライブラリ（HTTP, DB, gRPC）にspanが入る。最初の一歩として優秀
- **Manual instrumentation**（手動計装）: ビジネスロジック固有のspan・属性を追加。ドメイン名詞をスパン名にすると検索性が劇的に上がる
- **Library instrumentation**: フレームワーク作者が標準で OTel に対応している場合（Next.js, Spring Boot等）

## サンプリング

全リクエストを送ると保存コストとレイテンシが破綻する。**Head sampling**（リクエスト開始時にランダム決定）と **Tail sampling**（全データをCollectorに送ってから「エラー時だけ100%採用」のような条件で抽出）がある。Tailの方が情報量は多いが、Collectorのリソースが重い。

## 観測ツールとの関係

[[システム監視と可観測性]] / [[Observability]] の実装基盤として、OTelは「ベンダーロックインを避けつつフル可観測性を確保する」標準的な選択肢になった。Vercel / Supabase / AWS いずれも OTel エクスポートを公式サポート。

## 出典

- OpenTelemetry 公式: https://opentelemetry.io/
- OTLP仕様: https://opentelemetry.io/docs/specs/otlp/
- CNCF Landscape: https://landscape.cncf.io/

## 関連MOC

- [[MOC Observability]]
- [[MOC DevSecOps]]

## 関連ノート

- [[OTelで送れる情報の全体像]]
- [[システム監視と可観測性]]
- [[Observability]]
- [[セキュリティロギング設計]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
