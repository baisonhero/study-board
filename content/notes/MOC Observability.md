---
tags: [done, moc]
created: 2026-04-19
auto-generated: 2026-05-05
aliases:
  - MOC Observability
---

# MOC Observability

> [!summary]
> OpenTelemetry（OTel）/ SigNoz / Grafana Cloud を中心とした可観測性の実践知識を集約するMOC。メトリクス・ログ・トレース・プロファイルの三本柱（と最近は4本柱）を、個人開発のコスト範囲で運用可能なスタックで身につける。

## なぜこのMOCがあるか

「動いている」だけでは不十分で、 **なぜ動いているのか／なぜ遅いのか／なぜ落ちたのか** に答えられる必要がある。CLAUDE.md の技術スタック（Next.js + Supabase + Vercel + OTel）の OTel はここに対応する柱。学習・プロダクト両トラックで横断的に必要になる。

## 可観測性の基礎

- [[システム監視と可観測性]] — Monitoring と Observability の違い、4本柱（Metrics / Logs / Traces / Profiles）
- [[セキュリティロギング設計]] — 何をどこにどれだけ残すか、PII の扱い
- [[Linuxパフォーマンス計測]] — `perf` / `eBPF` / `bcc-tools` 等のローレベル計測

## OpenTelemetry（OTel）

- 仕様・コレクタ・SDK ベンダ非依存の標準
- Next.js / Node.js / Python / Go のSDKを使った計装パターン
- OTLP（OpenTelemetry Protocol）でバックエンドへ送信
- Auto-instrumentation と Manual-instrumentation の使い分け
- Sampling 戦略（Tail-based vs Head-based）

## バックエンド / 可視化

- **SigNoz** — OSS、自前ホスト可、OTel ネイティブ。個人開発のコストを抑えやすい
- **Grafana Cloud** — 無料枠あり、Loki / Tempo / Mimir / Pyroscope 統合
- **Datadog / New Relic** — 商用、機能リッチだがコスト要注意
- **AWS X-Ray / CloudWatch** — AWS固有、OTel→ADOT で統合可能（[[MOC AWS]]）
- **AWS Application Signals** — OTel をラップした AWS の APM ボード。Operations 画面でエンドポイント別 p99 を並べて見れる
  - [[ECS と Lambda の観測性設計]] — 採択メモ（パターン比較・実装手順・コスト）
- [[サイドカーパターン]] — CW agent / OTel Collector を ECS タスク内でアプリ隣に置く設計の基礎

## SLO / SLI

- Error Budget の設計
- アラート閾値設計（Burn rate ベース）
- ユーザ体験指標（Web Vitals）と内部指標の対応付け

## DevSecOps との接点

- [[MOC DevSecOps]] とは表裏一体。「何が起きているか」を見えるようにすることがセキュリティ運用の前提
- 監査ログ・アクセスログ・セキュリティイベントは [[セキュリティロギング設計]] に従う
- インシデント時の初動は [[インシデントレスポンス]]

## 学習ロードマップ

- [[インフラエンジニア学習ロードマップ]] — 計測の足腰として
- [[セキュリティ学習ロードマップ]] — Sec運用と連携する観点

## 関連MOC

- [[MOC Learning]]
- [[MOC DevSecOps]]
- [[MOC AWS]]
- [[MOC Home]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-05）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
