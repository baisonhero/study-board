---
tags: [inbox, learning, security, devsecops]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - IaCスキャン
  - Infrastructure as Code Scanning
---

# IaC Scanning

> [!summary]
> **IaC Scanning** は Terraform / CloudFormation / Kubernetes manifest / Helm / Pulumi / ARM / Ansible などの **インフラ定義コードをデプロイ前に静的解析**し、セキュリティ・コンプライアンス違反を検知する手法。[[SAST]] のインフラ版にあたる。デプロイ後の [[CSPM]] が「現状の設定」を見るのに対し、IaC Scanning は **PRを止める** ことで設定ミスをそもそも本番に入れない予防策として機能する。

## 主要ツール

| ツール | 開発元 | 特徴 |
|---|---|---|
| **Checkov** | Bridgecrew (現Palo Alto) | OSS、Terraform/CFN/K8s/Helm対応、ルール数最多級 |
| **tfsec** | Aqua | OSS、Terraform特化、軽量 |
| **Trivy** | Aqua | [[Trivy]] にIaCモジュールが統合済み |
| **Terrascan** | Tenable | OSS, OPA連携 |
| **Snyk IaC** | 商用 | デベロッパーUX重視 |
| **Kics** | Checkmarx | OSS、多フォーマット対応 |

## 検知例（Terraform）

```hcl
resource "aws_s3_bucket" "data" {
  bucket = "my-data"
  # 検知: パブリックアクセスブロックが設定されていない (CKV_AWS_53)
}

resource "aws_security_group_rule" "ingress" {
  type        = "ingress"
  from_port   = 22
  to_port     = 22
  cidr_blocks = ["0.0.0.0/0"]
  # 検知: SSH を 0.0.0.0/0 に開放 (CKV_AWS_24)
}

resource "aws_db_instance" "main" {
  storage_encrypted = false
  # 検知: RDS未暗号化 (CKV_AWS_16)
}
```

## CI/CD への組み込み

```yaml
# GitHub Actions
- name: Run Checkov
  uses: bridgecrewio/checkov-action@master
  with:
    directory: infra/
    soft_fail: false  # 違反があれば PR を落とす
```

PR の Conversation タブにインライン警告がつき、修正なしではマージできない。重要度の高い違反だけ ❌、低いものは ⚠️、というルールセットの段階運用が現実的。

## ポリシーアズコード（OPA / Rego）

ルールセットを **自社固有** にカスタマイズしたい場合、Open Policy Agent (OPA) + Rego DSL でルールを書く。たとえば「タグ `cost-center` が無い RDS は禁止」「特定リージョン外でリソース作成禁止」のような社内固有規則を Rego で記述し、Checkov / Terrascan / Conftest から呼び出す。

## CSPM との位置づけ

| 観点 | IaC Scanning | [[CSPM]] |
|---|---|---|
| タイミング | デプロイ**前** | デプロイ**後** |
| 対象 | 定義ファイル | 実際のクラウド状態 |
| 防御モード | 予防（PR ブロック） | 検知（既存リスクの可視化） |
| 抜け道 | コンソール直編集には弱い | コンソール直編集も検出 |

両者は **補完関係**。IaC Scanning でも漏れる「手動変更」を CSPM が拾う。

## 出典

- Checkov: https://www.checkov.io/
- tfsec: https://github.com/aquasecurity/tfsec
- OWASP IaC Top 10: https://owasp.org/www-project-top-10-infrastructure-as-code-security-risks/

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC AWS]]

## 関連ノート

- [[IaCとTerraform基礎]]
- [[CSPM]]
- [[CNAPP]]
- [[Trivy]]
- [[AWSセキュリティ実装]]
- [[A05 Security Misconfiguration]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
