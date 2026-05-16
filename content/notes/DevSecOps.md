---
tags: [inbox, learning, security, devsecops]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - devsecops
  - Shift Left Security
---

# DevSecOps

> [!summary]
> **DevSecOps** は DevOps にセキュリティを **左シフト (Shift Left)** で組み込む文化・実践。「セキュリティはリリース直前のレビューで担保する」という従来モデルから、**「コードを書く瞬間から、CIから、運用中まで自動でセキュリティ検査を回す」** モデルへの移行を指す。SAST / SCA / IaC Scanning / DAST / CSPM / Secret Scanning などのツール群を CI/CD に組み込む実装と、セキュリティを開発者の責任に分散させる組織変革の両輪。

## 三本柱

1. **People (人)**: 開発者・運用者・セキュリティ担当が一つのチーム
2. **Process (プロセス)**: CI/CD パイプラインの各ステージにセキュリティ検査を埋め込む
3. **Tools (ツール)**: 自動化される検査ツール群

## パイプライン例

```
[コミット] -> [SAST] -> [Secret Scan] -> [SCA] ->
[コンテナビルド] -> [Image Scan] -> [SBOM生成] ->
[IaC Scan] -> [デプロイ] -> [DAST] -> [Runtime Security] -> [CSPM]
```

各ステージで使うツール例：

- **SAST**: [[Semgrep]] / CodeQL / SonarQube
- **Secret Scan**: gitleaks / trufflehog
- **SCA**: [[Trivy]] / [[Dependabot]] / Snyk
- **Image Scan**: [[Trivy]] / Grype + [[Syft]]
- **SBOM生成**: [[Syft]] / Trivy → [[CycloneDX]] / [[SPDX]]
- **IaC Scan**: Checkov / tfsec / Trivy IaC
- **DAST**: [[OWASP ZAP]] / Burp Suite
- **Runtime**: Falco / Tetragon / [[CNAPP]] CWPP
- **CSPM**: [[CSPM]] ツール / [[Wiz]] / Security Hub

## Shift Left の本質

「**問題を早く・安く・確実に見つける**」が核心。バグ修正コストは **設計時の100倍が本番時** と言われる古いデータ通り、セキュリティバグも同じ法則に従う。コーディング時に SAST が指摘する方が、PR レビューで見つかるより、デプロイ後に発覚するより、何桁も安い。

## Shift Right も大事

近年は **Shift Left だけでは不十分** という認識が広がった：

- 実行時にしか分からない脆弱性 (config, ランタイム) は Right Shift で
- **Runtime Application Self-Protection (RASP)**, eBPF ベースの監視 (Falco, Tetragon)
- **Chaos Security Engineering**: 障害注入で検知能力を検証
- **Production-grade [[CNAPP]]**: 本番のリアルタイム検出

## メトリクス

DevSecOps の成熟度を測る代表的KPI：

- **MTTD (Mean Time To Detect)**: 検知までの平均時間
- **MTTR (Mean Time To Resolve)**: 解決までの平均時間
- **DORA Metrics**: Deployment Frequency / Lead Time for Changes / Change Failure Rate / MTTR
- **Critical CVE Aging**: Critical 脆弱性が修正されるまでの日数
- **依存パッチ率**: 全依存のうち最新版に追従できているもの

## 組織的な落とし穴

- **「セキュリティの専門家が全部やってくれる」文化が残る**: 開発者が自分のコードのセキュリティに責任を持たない
- **ツール導入だけして文化が変わらない**: Findings が放置される
- **アラート疲労**: 検知が多すぎて重要なものが埋もれる → SLA設計 + ノイズ抑制

## 出典

- OWASP DevSecOps Guideline: https://owasp.org/www-project-devsecops-guideline/
- DORA Research: https://dora.dev/
- CNCF Security Whitepaper: https://github.com/cncf/tag-security

## 関連MOC

- [[MOC DevSecOps]]
- [[MOC Security]]

## 関連ノート

- [[SAST]]
- [[SCA]]
- [[DAST]]
- [[SBOM]]
- [[CSPM]]
- [[CNAPP]]
- [[IaC Scanning]]
- [[Dependabot]]
- [[Trivy]]
- [[Semgrep]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
