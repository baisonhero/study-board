---
tags: [inbox, learning, security]
created: 2026-04-26
aliases:
  - OWASP Top Ten
  - Top 10
---

# OWASP Top 10

> [!summary]
> Webアプリケーションで頻発・致命的な脆弱性を10個に絞ってランク付けしたリスト。約3〜4年ごとに更新される。AppSec分野の事実上の共通語彙で、商用診断ツールやセキュリティ教育、コンプライアンス要件もこのカテゴリ分類を引用する。

## 何のためのリスト？

「世のWebアプリで実際に起きている脆弱性のうち、頻度・影響度・検知しやすさを総合して**特に注意すべきトップ10**」という位置付け。**網羅的な脆弱性カタログではない**点に注意（網羅性は CWE や ASVS の役割）。

> [!warning] 誤解されがちなポイント
> OWASP Top 10 は「これさえ対策すれば安全」という意味のリストではない。あくまで「**最低限ここから始める**」「**共通語彙として使う**」ための入門マップ。

## 2021年版（現行）

| # | 名称 | 内容 |
|---|---|---|
| **A01** | Broken Access Control | 認可制御の不備（権限昇格、IDOR、横移動） |
| **A02** | Cryptographic Failures | 暗号化の失敗（旧: Sensitive Data Exposure）。TLS未使用、弱いアルゴリズム、平文保存 |
| **A03** | Injection | SQLi、コマンドインジェクション、LDAPi、XSSもここに統合された |
| **A04** | Insecure Design | 設計レベルの欠陥（このカテゴリは2021で新設） |
| **A05** | Security Misconfiguration | デフォルト設定のまま、不要機能ON、エラーで内部情報漏洩 |
| **A06** | Vulnerable and Outdated Components | 古いライブラリの利用（[[SCA]] / [[SBOM]] と直結） |
| **A07** | Identification and Authentication Failures | 認証の不備、セッション管理の弱さ |
| **A08** | Software and Data Integrity Failures | サプライチェーン、CI/CDの改ざん（[[サプライチェーン攻撃]]） |
| **A09** | Security Logging and Monitoring Failures | ログ不足で侵害検知できない |
| **A10** | Server-Side Request Forgery（SSRF） | サーバから内部リソースへ意図しないリクエスト |

## 2017年版からの主な変化

参考：直前の版との差分を押さえるとカテゴリの意図が掴みやすい。

- **Insecure Design (A04)** が新設 — 「実装ミス」ではなく「設計時点で詰んでいる」ケースを別建て
- **XSS** が独立カテゴリから消えて **Injection (A03)** に統合
- **CSRF** がランキングから消滅（フレームワーク標準対策が普及したため）
- **SSRF (A10)** がコミュニティ投票で新規ランクイン
- **Insufficient Logging & Monitoring** が **A09** で順位上昇

## 次版について（要確認）

OWASP Top 10 は3〜4年周期で更新される慣習があり、**2025年版**が議論・データ収集中。コミュニティ投票や脆弱性データセット（HackerOne、CVE等）の集計を経て公開される予定。最新ステータスは https://owasp.org/Top10/ を要確認。

## 各カテゴリと対策ツールの対応

| Top 10 カテゴリ | 主な検出手段 |
|---|---|
| A01 Broken Access Control | [[DAST]] + 手動ペンテスト（ロジックエラーは自動検知が苦手） |
| A02 Cryptographic Failures | [[SAST]]（弱い暗号API利用検知）+ コードレビュー |
| A03 Injection | [[SAST]] + [[DAST]] |
| A04 Insecure Design | 脅威モデリング（[[OWASP Threat Dragon]]） |
| A05 Security Misconfiguration | [[CSPM]] / [[IaC Scanning]] |
| A06 Vulnerable Components | [[SCA]] / [[SBOM]] / [[Dependabot]] |
| A07 Auth Failures | [[DAST]] + 手動 + [[OWASP ASVS]] |
| A08 Integrity Failures | [[SCA]] + [[SBOM]] + 署名検証 |
| A09 Logging Failures | [[Observability]] / [[OpenTelemetry]] |
| A10 SSRF | [[SAST]] + ネットワーク分離 |

[[アプリケーションセキュリティ ツール分類]] のツールがそれぞれ Top 10 のどこをカバーするかをマッピングすると、自分のスタックの隙間が見える。

## 派生版

[[OWASP]] 本体側にもまとめあり。Top 10 自体に複数派生がある：

- **OWASP API Security Top 10**（2023年版）— REST/GraphQL等API特有のリスク
- **OWASP Mobile Top 10**
- **OWASP LLM Top 10**（生成AI／LLMアプリ）
- **OWASP Top 10 CI/CD Security Risks**

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[セキュリティ学習ロードマップ]]
- [[OWASP]]
- [[OWASP API Security Top 10]]
- [[アプリケーションセキュリティ ツール分類]]
- [[SAST]]
- [[SCA]]
- [[SBOM]]
- [[サプライチェーン攻撃]]
- [[CWE]]
