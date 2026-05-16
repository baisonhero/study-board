---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Cloud Security Posture Management
---

# CSPM

> [!summary]
> **CSPM (Cloud Security Posture Management)** は AWS / Azure / GCP / SaaS のアカウント設定を継続的に監査し、**「公開S3バケット」「全開きSG」「KMSキー回転無効」「IAMルートユーザーのMFA未設定」** のような設定ミス (misconfiguration) を検知・是正するカテゴリ。設定ミスはクラウドインシデントの**主因（推定70%以上）**で、[[A05 Security Misconfiguration]] のクラウド版にあたる。CSPMはこれを SaaS / OSS のスキャナで日次監視する。

## 主な機能

- **コンプライアンス監査**: CIS Benchmark / PCI-DSS / SOC2 / NIST 800-53 等のフレームワークに照らした自動採点
- **設定ドリフト検知**: Terraform で正しく定義されていても、誰かがコンソールで変更すると即時発見
- **資産インベントリ**: クラウド全リージョン横断のリソース一覧
- **リスクスコアリング**: 脆弱性を組み合わせた攻撃経路評価（[[CNAPP]] と連携）
- **自動修復（Auto-remediation）**: Lambda / Function を起動して即パッチ

## 主要ツール

| 種別 | ツール |
|---|---|
| OSS | Prowler, ScoutSuite, CloudSploit, Cloudfox |
| SaaS（汎用） | [[Wiz]], Lacework, Orca Security, Palo Alto Prisma Cloud |
| クラウドネイティブ | AWS Security Hub, AWS Config, Azure Defender for Cloud, GCP Security Command Center |

CSPM単独ではなく、[[CNAPP]] パッケージの一部として提供されるケースが多くなった。

## AWS Security Hub との関係

[[Security Hub 導入メモ]] にあるように、AWS Security Hub は CSPM 機能（CIS AWS Foundations Benchmark、AWS Foundational Security Best Practices）を **AWS純正で** 提供する。GuardDuty（脅威検知）+ Security Hub（設定監査）+ Config（リソース変更追跡）の3点セットがAWSネイティブCSPMの基本構成。

## 主要なCSPMルール例

- **S3**: パブリックアクセスブロック有効、Bucket Policy public-read 禁止、デフォルト暗号化、versioning
- **IAM**: ルートアクセスキー存在禁止、MFA強制、未使用ロール削除、過剰権限ポリシー検出
- **EC2 / SG**: SSH(:22) / RDP(:3389) を 0.0.0.0/0 で開放しない、IMDSv2強制
- **KMS**: 顧客管理キーの自動回転、未使用キーの削除
- **CloudTrail**: 全リージョン有効、Multi-region trail、ログのS3 + 暗号化

## ZTA との関係

[[ゼロトラストとネットワーク基礎]] の "Assume Breach" には、**侵入された前提でラテラルムーブを止める**設計が必要。CSPM が IAM 過剰権限や VPC 設定の弱点を継続的に直すことで、横展開の難度を上げる役割を持つ。

## 出典

- Gartner CSPM: https://www.gartner.com/en/information-technology/glossary/cloud-security-posture-management
- AWS Security Hub: https://aws.amazon.com/security-hub/
- Prowler OSS: https://github.com/prowler-cloud/prowler

## 関連MOC

- [[MOC Security]]
- [[MOC AWS]]

## 関連ノート

- [[A05 Security Misconfiguration]]
- [[CNAPP]]
- [[Wiz]]
- [[AWSセキュリティ実装]]
- [[Security Hub 導入メモ]]
- [[IaC Scanning]]
- [[インフラセキュリティ運用]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
