---
tags: [inbox, learning, product]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - coder.com
  - Coder OSS
---

# Coder

> [!summary]
> **Coder** はクラウド開発環境 (Cloud Development Environment, CDE) をセルフホストで構築するためのプラットフォーム。GitHub [[Codespaces]] や Gitpod の "OSS / Enterprise" 版にあたり、開発環境を **Terraform テンプレートとして定義**し、Kubernetes / VM / Docker / クラウドVM上にエンジニアごとのワークスペースをプロビジョニングする。社内のセキュリティ要件で外部CDEが使えない企業や、GPU開発・大型ビルドが必要な場面で採用されている。

## なぜCDEか

- **「自分のMacのセットアップが壊れた」を撲滅**: 環境はTerraformテンプレート定義、起動するたびにクリーンな環境
- **本番に近いリソースで開発**: ローカルMacでは無理なメモリ・GPU・ネットワーク到達性を確保
- **オンボーディング高速化**: 新人入社→数分で全リポジトリと依存が揃った環境
- **退職時のクリーンアップ**: ワークスペース削除で完了。デバイス上に資産が残らない（ゼロトラスト的）

## アーキテクチャ

```
[Developer Mac] -- coder CLI / VSCode / JetBrains Gateway -->
                                                            [Coder Server (Control Plane)]
                                                                     ↓
                                                         provisions via Terraform
                                                                     ↓
                                                         [Workspace] on K8s / EC2 / GCE / Docker
```

ユーザーは `coder ssh my-ws` で SSH 接続するか、VSCode リモートで開く。

## 競合との比較

| 製品 | モデル | 特徴 |
|---|---|---|
| **Coder** | Self-hosted, OSS+Ent | Terraformでテンプレート、エンタープライズ向け |
| GitHub Codespaces | SaaS | GitHubに統合、devcontainer.json |
| Gitpod | SaaS / Self-hosted | プレビルド、`.gitpod.yml` |
| Daytona | OSS | Coderの後発、軽量寄り |
| JetBrains Space CDE | SaaS | JetBrains統合 |

## テンプレート例

```hcl
data "coder_workspace" "me" {}

resource "docker_container" "workspace" {
  count = data.coder_workspace.me.start_count
  image = "codercom/enterprise-base:ubuntu"
  hostname = data.coder_workspace.me.name
  ...
}

resource "coder_agent" "main" {
  arch = "amd64"
  os   = "linux"
  startup_script = "code-server --port 13337 &"
}
```

## セキュリティ的な利点

- **コードがエンドポイントに残らない**: ノートPCを失くしてもソースは安全
- **集中管理されたシークレット**: 各ワークスペースに環境変数で配布
- **VPN不要**: Coderサーバーが公開エンドポイント、ワークスペースはプライベートサブネット
- **監査ログ集中化**: 誰がいつどのワークスペースを起動したかが残る

## 出典

- Coder 公式: https://coder.com/
- Coder OSS: https://github.com/coder/coder
- Terraform Coder Provider: https://registry.terraform.io/providers/coder/coder

## 関連MOC

- [[MOC Product]]
- [[MOC DevSecOps]]

## 関連ノート

- [[Codespaces]]
- [[IaCとTerraform基礎]]
- [[Kubernetes基礎]]
- [[Linuxサーバー運用基礎]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
