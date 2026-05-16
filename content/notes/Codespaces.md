---
tags: [inbox, learning, product]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - GitHub Codespaces
---

# Codespaces

> [!summary]
> **GitHub Codespaces** は GitHub が提供するクラウド開発環境 (CDE) サービス。リポジトリの **`.devcontainer/devcontainer.json`** に書いた定義から、Microsoft管理のクラウドVM上にコンテナベースの開発環境を起動し、ブラウザ版VSCode または手元のVSCode/JetBrainsから接続できる。「`git clone` の代わりに `gh codespace create`」 でフル開発環境が数十秒で揃う、というのが本質。

## なぜCDEか

- **「自分のMacのセットアップが壊れた」を撲滅**: クリーンな環境を毎回起動
- **新人オンボーディング**: 「クローンしてDocker起動して...」が要らない
- **本番に近いリソース**: ローカルMacでは無理な GPU・大容量メモリ・ネットワーク到達性
- **デバイス紛失リスク**: コードはクラウドに残り、エンドポイントには無い

## devcontainer.json

```json
{
  "name": "my-dev",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/aws-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "postCreateCommand": "npm install",
  "forwardPorts": [3000, 5432],
  "customizations": {
    "vscode": {
      "extensions": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
    }
  }
}
```

VS Code / GitHub Codespaces / [[Coder]] / Gitpod など多くのCDEが同じ仕様を共有。

## 機能

- **prebuilds**: 主要ブランチのコンテナを定期ビルドしておき、起動時間を秒単位に短縮
- **port forwarding**: ローカルブラウザから Codespace 内の `localhost:3000` に到達
- **Secrets**: 環境変数を組織レベルで管理し各 Codespace に注入
- **Stop/Resume**: 30分非アクティブで自動停止 → コスト節約
- **GitHub.dev (web版)**: 軽量、コンテナなしでブラウザ内編集のみ

## 競合

| 製品 | モデル | 特徴 |
|---|---|---|
| **Codespaces** | SaaS | GitHubとシームレス統合 |
| [[Coder]] | Self-hosted / Ent | Terraformテンプレート、エンタープライズ |
| Gitpod | SaaS / Self-hosted | `.gitpod.yml`, OSS時代から先行 |
| Daytona | OSS | 軽量、後発 |
| JetBrains Space CDE | SaaS | JetBrains統合 |

## コスト

- 無料枠: アカウントごとに月 60 時間 (2-core) 程度
- 大型インスタンス (32-core, GPU 付き) は時間単価が高い
- 組織アカウントでは利用ポリシーと予算上限の設定が重要

## セキュリティ視点

- ソースコードはAzure VM内に閉じる → ローカルマシン紛失で漏洩しない
- 業務LANに繋ぐ場合は GitHub の Static IP オプション、または Private Networking
- Codespaceからの認証情報は Secrets で管理、`~/.aws/credentials` を直接置かない

## 出典

- GitHub Codespaces: https://github.com/features/codespaces
- Dev Containers仕様: https://containers.dev/

## 関連MOC

- [[MOC Product]]
- [[MOC - リモート開発環境]]

## 関連ノート

- [[Coder]]
- [[Linuxサーバー運用基礎]]
- [[IaCとTerraform基礎]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
