---
tags: [inbox, learning, security, ops]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - AWS Security Hub
  - Security Hub セットアップ
---

# Security Hub 導入メモ

> [!summary]
> **AWS Security Hub** は AWSアカウントのセキュリティ状態を **CSPM 的に統合可視化** するマネージドサービス。GuardDuty / Inspector / Macie / IAM Access Analyzer / Config の検出結果を集約し、CIS AWS Foundations Benchmark / AWS Foundational Security Best Practices / PCI DSS / NIST 800-53 などのコンプライアンス標準で日次採点する。本ノートは新規組織での導入手順と注意点を整理する。

## 提供するもの

- **コンプライアンス採点**: 標準フレームワークごとの自動採点
- **検出結果の集約**: GuardDuty / Inspector / Config / Macie 等の Findings を1ヶ所で確認
- **Cross-Account / Multi-Region 集約**: 組織アカウント全体の状態を1つの管理アカウントで確認
- **EventBridge 連携**: Critical findings を Slack/PagerDuty/Jira に流す
- **自動レメディエーション**: Lambda連携で自動修復可能

## 標準的な導入ステップ

### 1. 前提サービスの有効化

```bash
# 各アカウント・全リージョンで有効化
aws configservice put-configuration-recorder ...
aws guardduty create-detector --enable
aws inspector2 enable --resource-types EC2 ECR LAMBDA
```

### 2. Security Hub 有効化

```bash
aws securityhub enable-security-hub \
  --enable-default-standards \
  --tags Environment=production
```

### 3. 標準の選択

- **AWS Foundational Security Best Practices** (FSBP) を必ず有効化
- **CIS AWS Foundations Benchmark v3.0** を併用
- 業界要件があれば PCI DSS / NIST 800-53 / NIST CSF も追加

### 4. 組織アカウントの集約

AWS Organizations を使い、**delegated administrator** で Security 専用アカウントに集約：

```bash
aws organizations register-delegated-administrator \
  --account-id <security-account-id> \
  --service-principal securityhub.amazonaws.com
```

その後 Security Hub の "Auto-enable" を有効にすると、新規アカウント追加時に自動でSecurity Hub有効化。

### 5. 通知

```yaml
# EventBridge ルール例: Critical / High findings を Slack へ
{
  "source": ["aws.securityhub"],
  "detail-type": ["Security Hub Findings - Imported"],
  "detail": {
    "findings": {
      "Severity": { "Label": ["CRITICAL", "HIGH"] }
    }
  }
}
```

## 運用上の注意

- **コスト**: Findings あたり課金。検出数が多いリージョンでは想定以上に費用がかかる。`SuppressionRules` で常時 noisy なものを抑制
- **誤検知**: AWS の検出ルール (CIS など) は厳格で、業務上の意思決定で許容するケースもある → `WORKFLOW: SUPPRESSED` で個別記録
- **修復は別仕組み**: Security Hub は**検出だけ**。修復は Config Rules + Systems Manager Automation や Lambda
- **ログ保持**: Findings は90日間保持。長期保管は S3 / OpenSearch にエクスポート

## 競合・補完

- **AWS純正の総合**: GuardDuty + Inspector + Config + Macie + IAM Access Analyzer + Security Hub
- **商用 [[CNAPP]]** ([[Wiz]] / Lacework / Prisma Cloud) がより深い分析・Attack Path Analysis を提供
- 中小ならAWS純正で十分、エンタープライズなら商用CNAPPで補完が一般的

## 出典

- AWS Security Hub: https://aws.amazon.com/security-hub/
- AWS FSBP: https://docs.aws.amazon.com/securityhub/latest/userguide/fsbp-standard.html
- CIS AWS Foundations Benchmark v3.0: https://www.cisecurity.org/benchmark/amazon_web_services

## 関連MOC

- [[MOC AWS]]
- [[MOC Security]]
- [[MOC DevSecOps]]

## 関連ノート

- [[AWSセキュリティ実装]]
- [[CSPM]]
- [[CNAPP]]
- [[Wiz]]
- [[A05 Security Misconfiguration]]
- [[IAMベストプラクティス]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
