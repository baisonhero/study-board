---
tags: [inbox, learning, security]
created: 2026-04-26
aliases:
  - AWS Security
  - クラウドセキュリティ
---

# AWSセキュリティ実装

> [!summary]
> AWS全冠の知識を AppSec 側に降ろすフェーズ。IAM最小権限の徹底、専用セキュリティサービス（Inspector / GuardDuty / Security Hub / Config）の使い分け、KMS実装、データ層の暗号化。SAA/SAP の知識を「セキュリティ専門の視点」で見直す。

## IAMの「実戦」運用

### 最小権限の原則

理屈は知っているが実装は難しい。実戦パターン：

- **IAM Access Analyzer** で実際に使われてない権限を炙り出す
- **Permissions Boundaries** でユーザー/ロールに上限を設ける
- **Service Control Policies (SCPs)** で組織アカウント横断の禁止事項
- **AWS Identity Center**（旧SSO）で人間ユーザーに長期キーを発行しない
- アプリケーションは必ず IAM Role を assume（EC2 Instance Profile / ECS Task Role / Lambda Execution Role）

### ありがちな失敗

- `*` を含むActionの濫用（`s3:*`、`iam:*` は要警戒）
- 一時credentialから永続キーを生成する経路を放置
- root アカウントの利用（**MFA付きで保管庫にしまう**）
- IAMユーザーへの長期 Access Key 発行（→ Identity Center / OIDC で代替）

### CIからAWSへのアクセス

GitHub Actions → AWS は **OIDC Federation** が現代の正解：

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::<account>:role/<role>
      aws-region: ap-northeast-1
```

長期 Access Key を Secrets に置くのを避けられる。

## 専用セキュリティサービス

### CSPM 系

| サービス | 役割 |
|---|---|
| **AWS Config** | リソース設定の継続記録、Rule で逸脱検知 |
| **Security Hub** | 各種セキュリティ findings の統合ダッシュボード、CIS / PCI / FSBP 標準ベンチマーク |
| **IAM Access Analyzer** | 公開リソース・外部アカウント信頼の検出 |
| **Trusted Advisor** | コスト・セキュリティ・パフォーマンスのチェック |

### 脅威検知

| サービス | 役割 |
|---|---|
| **GuardDuty** | ML/シグネチャベースの脅威検知（VPC Flow / DNS / CloudTrail） |
| **Macie** | S3内の機密データ（PII等）検出 |
| **Detective** | インシデント調査支援 |

### 脆弱性スキャン

| サービス | 役割 |
|---|---|
| **Inspector** | EC2 / ECR / Lambda の脆弱性スキャン（[[SCA]] 相当） |
| **ECR Image Scanning** | コンテナイメージスキャン（基本/拡張） |

## KMS と暗号化

### envelope encryption

- データ鍵（CMK配下のデータキー）でアプリデータを暗号化
- データ鍵自体を CMK で暗号化して保存
- 利点：CMKを叩く回数を減らしながら鍵階層を維持

### Customer Managed Key vs AWS Managed Key

- **AWS Managed**（`aws/<service>` の自動キー）— 楽だが**鍵ポリシーを自分で書けない**、Cross-Account共有不可
- **Customer Managed** — ポリシー記述、ローテーション制御、削除可能 → セキュリティ要件が厳しい場合は必須

### 暗号化が標準的に必要な層

| 層 | 手段 |
|---|---|
| データ転送中 | TLS（ALB、CloudFront、API Gateway すべてHTTPS化） |
| データ保管時（DB） | RDS / Aurora の暗号化、DynamoDBは標準で暗号化済み |
| データ保管時（オブジェクト） | S3 SSE-S3 / SSE-KMS / DSSE-KMS |
| バックアップ | AWS Backup の暗号化、スナップショット暗号化 |
| ログ | CloudWatch Logs / S3 ログバケット暗号化 |

## ネットワークセキュリティ

- **VPC設計** — Public / Private subnet 分離、egress制御
- **Security Group** — ステートフル、必要最小ポートのみ
- **NACLs** — ステートレス、補助的に使う
- **VPC Flow Logs** を有効化、S3 や CloudWatch Logs に
- **AWS Network Firewall** / **Cloud WAF** — L7制御
- **PrivateLink** で AWS API トラフィックをインターネット経由にしない

## マルチアカウント戦略

個人プロジェクトでも：

- **AWS Organizations** で複数アカウント
- 開発 / 本番をアカウント分離（権限事故の影響を局所化）
- 監査ログ（CloudTrail）を専用アカウントに集約
- セキュリティツール用アカウントを分離（GuardDuty / Security Hub 集約）

## 監視・ログ

- **CloudTrail** を**全リージョン有効**で organization trail として
- ログの**改ざん防止**：別アカウントの S3 バケット + Object Lock
- **EventBridge** + Lambda で「特定操作で即通知」
- 重要操作の例：`iam:*` 系、`kms:Disable*`、`s3:DeleteBucket`

## SDK/IaC レベルの実装

- **AWS CDK / Terraform** で構成管理、コードレビューを通す
- IaC scanning：**Checkov**、**tfsec**、**KICS**
- secret は `aws_ssm_parameter` / `aws_secretsmanager_secret` を Terraform で参照
- コミット禁止 → 値はパイプライン側

## Security Specialty試験

実務知識の体系化に向く資格。AWS全冠を持っているなら**学習コストは比較的低く、AppSec知識との橋渡しに最適**。

## 学習リソース

- AWS Well-Architected Framework: Security Pillar
- AWS Prescriptive Guidance（公式のベストプラクティス集）
- 「AWS Security Cookbook」by Heartin Kanikathottu

## 関連MOC

- [[MOC AWS]]
- [[MOC Security]]
- [[MOC DevSecOps]]

## 関連ノート

- [[セキュリティ学習ロードマップ]]
- [[アプリケーションセキュリティ ツール分類]]
- [[シークレット管理]]
- [[暗号の基礎]]
- [[セキュリティロギング設計]]
