---
tags: [inbox, learning, observability]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - 可観測性
  - オブザーバビリティ
---

# Observability

> [!summary]
> **Observability（可観測性）** は外部から観測可能な出力（テレメトリ）だけで、システム内部の状態を **推測・診断できる度合い**。元は制御理論の概念で、「監視 (Monitoring)」が "既知の問題を見張る" のに対し、Observability は **未知の問題に出会った瞬間に深掘りできる** ことを重視する。[[OpenTelemetry]] の標準化と、トレース・メトリクス・ログ（3本柱）の統合により、現代のクラウドネイティブ運用の基礎概念になった。

## Monitoring と Observability の違い

| 観点 | Monitoring | Observability |
|---|---|---|
| 想定する問題 | 既知（known unknowns） | 未知（unknown unknowns） |
| 主な質問 | 「閾値を越えたか?」 | 「なぜ遅いのか?」 |
| 主な道具 | Alert + Dashboard | Trace + Log + High-cardinality Metrics |
| データ構造 | 集約済み数値 | イベント単位の詳細 |

> Monitoring は Observability の **サブセット**。Monitoring だけだと「赤いダッシュボードは出るが、原因が分からない」状態になる。

## 3本柱（Three Pillars）

1. **Traces**（分散トレース）— 1つのリクエストが複数サービスを跨ぐときの因果関係
2. **Metrics**（時系列メトリクス）— 数値の集計
3. **Logs**（構造化ログ）— イベント単位の詳細記録

最近は **Events / Profiles** を含めた **5 Signals** という言い方も増えている。

## High-cardinality の重要性

未知の問題に出会ったとき、**「特定の user_id だけ」「特定の region × tenant_id 組み合わせだけ」** で起きていることが分かれば、原因切り分けが一気に進む。これには **メトリクスのラベル次元（cardinality）が高い** ことが必須。従来の時系列DBは high-cardinality に弱かったが、Honeycomb / ClickHouse / Grafana Mimir 等が解決した。

## 実装スタック例

```
[App] --[OTel SDK]--> [OTel Collector] --> Traces: Tempo / Jaeger / Datadog
                                       --> Metrics: Prometheus / Mimir / Datadog
                                       --> Logs: Loki / OpenSearch / Datadog
                                                    ↓
                                          [Grafana] でクエリ・可視化
```

ベンダー中立化のため、**SDKは [[OpenTelemetry]] 一択** が業界の合意になりつつある。

## SLO/SLI との関係

Observability は「現象を深掘りする能力」だが、ビジネスの観点では **SLO (Service Level Objective)** を立て、SLI (Indicator) で進捗を測ることが運用の北極星になる。Error Budget が枯渇するペースを Observability で深掘りする、というのが SRE の典型ワークフロー。

## 設計上の注意

- **ログレベルを統一する**: structured logging で `trace_id` / `span_id` / `user_id` を必ず入れる
- **PII を attribute に入れない**: GDPR / [[プロダクト開発における個人情報保護]] 違反になる
- **コストとの戦い**: 全リクエストを完全保存すると即座に破綻する。サンプリング戦略が必須

## 出典

- Observability Engineering（Charity Majors他, O'Reilly）
- Google SRE Book: https://sre.google/books/
- OpenTelemetry: https://opentelemetry.io/

## 関連MOC

- [[MOC Observability]]

## 関連ノート

- [[OpenTelemetry]]
- [[OTelで送れる情報の全体像]]
- [[システム監視と可観測性]]
- [[セキュリティロギング設計]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
