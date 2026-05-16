---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - OWASP Top 10 概要
  - OWASP Top 10 サマリ
---

# OWASP Top 10 まとめ

> [!summary]
> [[OWASP Top 10]] の全カテゴリを **1ページで横断把握** できる位置付けのノート。各カテゴリは別ノートで個別に深掘りされており、ここでは「カテゴリ名・典型例・典型対策・関連ツール」を一覧化する。2021年版が最新で、次の改訂は2025〜2026年に予定されている。

## 全カテゴリ一覧

| ID | 名称 | 典型例 | 典型対策 | 主要ツール |
|---|---|---|---|---|
| [[A01 Broken Access Control]] | アクセス制御の不備 | IDOR、垂直/水平権限昇格 | RBAC/ABAC、サーバーサイド認可、[[Supabase RLS]] | [[OWASP ZAP]] |
| [[A02 Cryptographic Failures]] | 暗号化の失敗 | HTTP通信、弱いハッシュ、Hardcoded key | [[TLS]] 1.2+、bcrypt/argon2、KMS | testssl.sh |
| [[A03 Injection]] | インジェクション | SQLi、XSS、CmdInj | パラメータ化、エンコーディング、[[CSP]] | [[Semgrep]] |
| [[A04 Insecure Design]] | 安全でない設計 | 認可設計欠如、ビジネスロジック欠陥 | [[脅威モデリング]]、ASVS | [[OWASP Threat Dragon]] |
| [[A05 Security Misconfiguration]] | セキュリティ設定不備 | デフォルト認証情報、不要ポート公開 | ハードニング、CIS Benchmark | [[CSPM]]、[[IaC Scanning]] |
| [[A06 Vulnerable and Outdated Components]] | 脆弱な依存 | 古いライブラリ、未パッチ | [[SCA]]、SBOM、[[Dependabot]] | [[Trivy]]、[[Syft]] |
| [[A07 Identification and Authentication Failures]] | 認証の失敗 | 弱パスワード、セッション固定 | MFA、[[Passkey]]、TOTP | Auth0/Cognito |
| [[A08 Software and Data Integrity Failures]] | 完整性失敗 | 自動更新で改ざん、署名なし | コード署名、SBOM、SLSA | sigstore |
| [[A09 Security Logging and Monitoring Failures]] | ロギング・監視不足 | 監査ログなし、検知遅延 | 集中ログ、SIEM、SLO | Loki/Datadog |
| [[A10 SSRF]] | SSRF | 内部APIへのリクエスト | Allowlist、metadata service保護 | Falco |

## 何から手を付けるべきか

[[OWASP Top 10]] は **「攻撃頻度 × 被害規模 × 検出難易度」** でランキングされている。新規プロジェクトで投資する優先順位の現実解：

1. **A01 (アクセス制御)**: 最重要。フレームワーク選定時から RLS / OPA / Casbin 等を組み込む
2. **A02 (暗号)**: HTTPS強制、HSTS、機微情報のハッシュ化
3. **A03 (インジェクション)**: ORM/プリペアドステートメント、出力エンコーディング、CSP
4. **A07 (認証)**: 認証SaaS (Auth0/Cognito/Clerk) を使い自前実装を避ける
5. **A06 (依存)**: Dependabot / Trivy 即日有効化
6. **A05 (設定)**: IaC化、CSPM、定期コンプライアンス監査
7. その他は中規模になってから順次

## 開発フェーズとの対応

- **設計時**: A04 (脅威モデリング)
- **コーディング時**: A01/A02/A03/A07/A10
- **デプロイ時**: A05/A06
- **運用時**: A06 (継続SCA)、A08、A09

## ASVS / CWE / Top 25 との関係

- [[OWASP ASVS]]: 各カテゴリを **具体的な要件項目** に展開した網羅版
- [[CWE]] Top 25: より粒度の細かい「弱点タイプ」のランキング
- OWASP Top 10 = 教育・コミュニケーション用、ASVS/CWE = 技術検証用、と用途が違う

## 出典

- OWASP Top 10: https://owasp.org/Top10/
- OWASP Top 10 (日本語): https://owasp.org/Top10/ja/

## 関連MOC

- [[MOC Security]]

## 関連ノート

- [[OWASP Top 10]]
- [[OWASP]]
- [[OWASP ASVS]]
- [[CWE]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
