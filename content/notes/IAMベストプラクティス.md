---
tags: [inbox, learning, security, ops]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - AWS IAM ベストプラクティス
---

# IAMベストプラクティス

> [!summary]
> AWS / GCP / Azure を運用するうえで **IAM (Identity and Access Management) の設計品質** がそのままセキュリティとコスト両面の品質を決める。本ノートは AWS IAM を中心に、業界共通のベストプラクティスを集約する。「**最小権限の原則**」と「**ルートアクセス禁止**」が二大原則。クラウドインシデントの大半が IAM 設定ミス起因なので、組織のセキュリティ成熟度の物差しになる。

## 大原則

1. **最小権限 (Least Privilege)**: 各 IAM ロール・ユーザーは業務に必要な最小権限だけ持つ
2. **ルートアカウントは使わない**: 初期セットアップ後は鍵を破棄、MFAを有効化、緊急時のみアクセス
3. **アクセスキーよりロール / IAM Identity Center**: 長期キーは漏洩リスク。一時クレデンシャルに置き換える
4. **CloudTrail で監査ログ**: 全API呼び出しを長期保存。SOC2/ISO27001の根幹

## 個別ベストプラクティス（AWS）

### ルート保護

- ルートユーザーのアクセスキーを削除
- ハードウェアMFA推奨 (YubiKey)
- メールアドレスを共有メーリングリストに

### ユーザー管理

- IAM Identity Center (旧 AWS SSO) でユーザー集中管理
- 開発者は **SSO + 短命クレデンシャル** で利用
- IAM ユーザーは外部システム連携など最小限のみ
- パスワードポリシー: 14文字以上、MFA必須

### 権限設計

- **ジョブ機能別ポリシー** (AdministratorAccess, ReadOnlyAccess, PowerUserAccess) を基礎に
- **AWS マネージドポリシー** を出発点にし、本番では絞り込む
- **権限境界 (Permission Boundary)**: 開発者がIAM作成権限を持つ場合、エスカレーション防止に必須
- **SCP (Service Control Policy)**: 組織レベルで「絶対に許可しない」リージョン・サービスを制限

### ロール・フェデレーション

- **IAM Role for EC2 / ECS / Lambda**: アプリは IAM ユーザーキーを持たない
- **IRSA (IAM Roles for Service Accounts)**: EKS Podごとに最小権限ロール
- **AssumeRoleWithWebIdentity**: GitHub Actions OIDC でアクセスキー不要のCI/CD

### 監査・継続改善

- **Access Analyzer**: 外部公開リソース・組織外への委任を自動検出
- **IAM Access Advisor**: 各ロールの「最終アクセス日」を確認 → 未使用権限を削除
- **CSPM ([[CSPM]])** / Wiz / Defender for Cloud で日次監査

## 過剰権限の典型例

- `*:*` (=AdministratorAccess) を本番ロールに付与
- `s3:*` を全バケットに付与 → スコープを resource ARN で絞る
- `iam:PassRole` をワイルドカードで → 権限昇格の温床
- 長期 AccessKeyId/SecretAccessKey を `~/.aws/credentials` に保存 → 漏洩リスク

## CIEM ツールとの関係

[[CNAPP]] の CIEM 機能 (Wiz, Prisma Cloud, Lacework, Microsoft Entra Permissions Management) が **「使われていない権限」** を継続検出し、ポリシーを絞り込む提案をしてくれる。手動運用では追い切れない規模になったら導入する。

## 出典

- AWS IAM Best Practices: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
- AWS Security Best Practices Whitepaper: https://aws.amazon.com/architecture/security-identity-compliance/
- IAM Access Analyzer: https://aws.amazon.com/iam/access-analyzer/

## 関連MOC

- [[MOC AWS]]
- [[MOC Security]]
- [[MOC DevSecOps]]

## 関連ノート

- [[AWSセキュリティ実装]]
- [[A01 Broken Access Control]]
- [[A05 Security Misconfiguration]]
- [[CSPM]]
- [[CNAPP]]
- [[認証と認可]]
- [[ゼロトラストとネットワーク基礎]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
