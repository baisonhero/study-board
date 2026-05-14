# study-board

> 🌐 **Live**: [https://study-board-delta.vercel.app](https://study-board-delta.vercel.app)

Obsidian Vault を Next.js で静的に公開する、個人ナレッジビューア。Vault の `notes/` を `content/` に同期して Vercel 上でホスティングする構成。

## 主要構成

- **Frontend**: Next.js 15.5 (App Router)
- **Content source**: Obsidian Vault (`~/Documents/Obsidian Vault/notes/`)
- **Sync**: `scripts/sync-vault.sh` で Vault → `content/` にコピー
- **Observability**: OpenTelemetry (server + client RUM)
- **Hosting**: Vercel
- **Auth**: なし（公開閲覧）

## 開発フロー

```bash
npm install
npm run sync         # Vault → content/ 同期
npm run dev          # 開発サーバー起動
npm run test:lib     # スモークテスト
npm run build        # 本番ビルド
```

`prebuild` フックで自動的に `sync-vault.sh` が走るので、ローカルビルドや Vercel デプロイ時は最新の Vault 内容が反映される。

## ハーネス

このリポジトリは AI エージェントによる自動開発を前提とした **harness 構造** を持つ：

- `AGENTS.md` — Iron Law (TDD)、過去事故のコミット参照、Side disciplines
- `.claude/agents/` — `commit_push_agent` / `feature_implementer` / `bug_fixer` / `code_reviewer`
- `.claude/skills/` — `using-replica-harness` / `tdd-discipline` / `replica-conventions` / `retro` (placeholder)
- `.claude/journal/` — ミスログ、観測層（自己改修ループの基盤）

詳細は `AGENTS.md` を参照。

## 関連リンク

- 本番デプロイ: [https://study-board-delta.vercel.app](https://study-board-delta.vercel.app)
- GitHub: [github.com/baisonhero/study-board](https://github.com/baisonhero/study-board)（旧名 obsidian-replica、auto-redirect）
- Vault: ローカル `~/Documents/Obsidian Vault/` （非公開）

## ライセンス

私用リポジトリ。ライセンスは未設定（all rights reserved）。
