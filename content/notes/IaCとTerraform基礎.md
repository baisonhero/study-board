---
tags: [inbox, learning]
created: 2026-04-26
aliases:
  - IaC
  - Terraform
  - CloudFormation
---

# IaCとTerraform基礎

> [!summary]
> Infrastructure as Code = インフラを**コードで宣言的に管理**する手法。手動コンソール作業から脱却して、レビュー・再現・差分管理を可能にする。Terraformはマルチクラウド対応のデファクト。

## なぜIaCか

手動構築の問題：

- 「**前回どうやって作ったか**」が消える
- 環境差分（dev / staging / prod）が発生
- 設定変更がレビューできない
- 災害復旧（DR）が困難
- スケール時に再現性なし

IaC で解決：

- **コードがドキュメント** — リポジトリ見ればわかる
- **PRレビュー** — 変更がチームで議論可能
- **環境を一発再現** — staging も prod も同じコード
- **差分検出** — 「本番がコードと違う」を検出可能
- **ロールバック** — 前のコミットに戻せる

## 主要IaCツール

### 宣言的（Declarative）

「**最終状態を書く**」スタイル。ツールが現在状態と差分計算して反映：

| ツール | 特徴 |
|---|---|
| **Terraform** | HashiCorp、マルチクラウド、HCL言語、デファクト |
| **OpenTofu** | Terraform fork、完全OSS、Linux Foundation配下 |
| **AWS CloudFormation** | AWS純正、JSON/YAML、ロックイン強い代わりに統合深い |
| **AWS CDK** | TypeScript/Python等で書ける、内部はCloudFormation |
| **Pulumi** | TypeScript/Python等、Terraform的だがプログラミング言語使用 |
| **Bicep** | Azure純正、ARMテンプレートのDSL |
| **Crossplane** | Kubernetes native、CRDでクラウドリソース管理 |

### 命令的（Imperative）

「**こう操作する**」スタイル。Ansible、Chef、Puppet などのプロビジョニングツール。サーバー設定向き。

「IaC」の文脈では宣言型が主流で、命令型は **Configuration Management** と呼んで区別することが多い。

## Terraformの基本フロー

```
1. tf ファイルを書く
   ↓
2. terraform init
   ↓
3. terraform plan       ← 差分を確認（必須）
   ↓
4. terraform apply      ← 実際に反映
```

### プロジェクト構造（最小）

```
project/
├── main.tf           # リソース定義
├── variables.tf      # 入力変数
├── outputs.tf        # 出力値
├── versions.tf       # プロバイダ・Terraformバージョン
└── terraform.tfvars  # 変数の値（gitignore候補、機密含むなら）
```

### main.tf の例

```hcl
provider "aws" {
  region = "ap-northeast-1"
}

resource "aws_s3_bucket" "logs" {
  bucket = "my-logs-${var.environment}"

  tags = {
    Environment = var.environment
    Owner       = "platform-team"
  }
}

resource "aws_s3_bucket_versioning" "logs" {
  bucket = aws_s3_bucket.logs.id
  versioning_configuration {
    status = "Enabled"
  }
}
```

### variables.tf

```hcl
variable "environment" {
  type        = string
  description = "Environment name (dev/staging/prod)"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Must be dev, staging, or prod."
  }
}
```

## State（状態ファイル）

Terraform の **最重要概念**。「現状の認識」を保持するファイル `terraform.tfstate`：

- リソースID と Terraform管理リソースの対応
- 機密情報を含むことがある
- 複数人で作業するなら**リモートに置く**

### Remote State

ローカルファイルだとチーム作業できない → S3 や Terraform Cloud に置く：

```hcl
terraform {
  backend "s3" {
    bucket         = "my-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "tf-locks"   # ロック制御
    encrypt        = true
  }
}
```

DynamoDB によるロックで「同時applyによる破壊」を防ぐ。

### State 操作（緊急時）

```bash
# state 一覧
terraform state list

# 詳細
terraform state show aws_s3_bucket.logs

# 既存リソースをstateに取り込む
terraform import aws_s3_bucket.logs my-existing-bucket

# stateからリソース削除（実体は残す）
terraform state rm aws_s3_bucket.logs

# state を移動（リネーム）
terraform state mv aws_s3_bucket.old aws_s3_bucket.new
```

## Module

再利用可能な単位。同じパターン（VPC + サブネット + IGW）を何回も書かない：

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "my-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["ap-northeast-1a", "ap-northeast-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
}
```

[Terraform Registry](https://registry.terraform.io/) に公式・コミュニティのmoduleが大量にある。最初は登録モジュール使うのが早い。

## Workspace と環境分離

複数環境（dev / staging / prod）の管理パターン：

### パターン1: Workspace

```bash
terraform workspace new dev
terraform workspace select prod
```

state がワークスペースごとに分かれる。シンプルだが、環境差を if 文で制御することになり微妙。

### パターン2: ディレクトリ分離（推奨）

```
infra/
├── modules/
│   ├── network/
│   └── app/
├── environments/
│   ├── dev/
│   │   └── main.tf      # module "network" { ... } を呼ぶ
│   ├── staging/
│   └── prod/
```

各環境ディレクトリで `terraform apply` する。明示的で安全。

### パターン3: Terragrunt

DRY化する thin wrapper（HashiCorpではなくGruntwork製）。複数環境管理が楽になる。

## CI/CD連携

### よくあるGitHub Actions構成

```yaml
on:
  pull_request:
    paths: ["infra/**"]

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: terraform init
      - run: terraform plan -no-color | tee plan.txt
      - uses: actions/github-script@v7
        with:
          script: |
            const plan = require('fs').readFileSync('plan.txt', 'utf8')
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `\`\`\`\n${plan}\n\`\`\``
            })
```

PR 上で `plan` 結果が見える → レビュー後にマージ → main で `apply`。

## ベストプラクティス

### コード規約

- **module化**：再利用可能な単位を切り出す
- **変数化**：環境差は variable で
- **タグ強制**：`default_tags` で全リソースに `Environment`、`Owner`、`CostCenter`
- **`for_each` を使う**：count より明示的、追加削除時の差分が安全

### 安全運用

- **本番stateは別リポジトリ or 別バックエンド**
- **drift detection 定期実行**（`terraform plan` を定期で）
- **destroy は権限分離** — IAMで applyと別ロール
- **クリティカル resource に `prevent_destroy`**：

```hcl
resource "aws_db_instance" "main" {
  # ...
  lifecycle {
    prevent_destroy = true
  }
}
```

### セキュリティ

- **stateにシークレットを置かない設計**：DBパスワードは `aws_secretsmanager_secret` 参照
- **stateバックエンドを暗号化**（S3なら SSE）
- **アクセスログ**：Terraform Cloud / S3 のアクセスログ
- **IaC scan**：[[ソフトウェアサプライチェーン強化]] の Checkov、tfsec

### コスト

- `terraform plan` の結果を **Infracost** に流すとコスト差分が見える
- リソースに `tag` 必須化 → コスト分析しやすい

## CloudFormation との対比

| 観点 | Terraform | CloudFormation |
|---|---|---|
| マルチクラウド | ◎ | × （AWS専用） |
| 言語 | HCL（独自） | YAML/JSON |
| State管理 | 自分で（リモートバックエンド） | AWS側で自動管理 |
| Drift検知 | plan で表示 | Drift Detection機能あり |
| ロールバック | terraformの仕組みでは限定的 | 自動ロールバック |
| エコシステム | 広い | AWS統合は最強 |

CDKを使うとTypeScript等で書けるので、CloudFormationの面倒さがかなり解消される。

## 関連MOC

- [[MOC Learning]]
- [[MOC DevSecOps]]
- [[MOC AWS]]

## 関連ノート

- [[インフラエンジニア学習ロードマップ]]
- [[クラウドの基礎概念]]
- [[AWSとGCPとAzureの比較]]
- [[ソフトウェアサプライチェーン強化]]
- [[AWSセキュリティ実装]]
