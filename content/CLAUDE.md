# Claude Life OS

## 自己紹介
- AWS全冠保持者、Webアプリ開発経験あり
- セキュリティは学習中
- 目標: Claudeを活用してマネタイズ可能なサービスを構築する
- 技術スタック: Next.js + Supabase + Vercel + OTel

## 方針
- 全ての情報はこのVaultに一元化する
- 学習(#learning)と開発(#product)は明確に分ける
- 意思決定には必ず理由を残す(#decision)
- 「作ってから売り先を探す」はしない
- 設計書: `claude-life-os-v2.md` を参照すること

## ノートルール
- 保存先: notes/ にフラットに置く（サブフォルダ禁止）
- ファイル名: 内容を表すタイトル（日本語OK）
- 必ず1つ以上のMOCにリンクすること（孤立ノート禁止）
- タグ: #inbox → 整理後 #done に変更
- 日本語で記述
- 日次ログは _daily/ に YYYY-MM-DD.md で保存
- 週次レビューは _weekly/ に YYYY-Www.md で保存
- 生成資料は _outputs/ に保存
- raw/ は原資料の保管場所。Claudeは読むが絶対に書かない
- raw/ に新資料が追加されたら、notes/ を更新し関連MOCにリンク

## ノートのフォーマット
全てのノートは以下の形式で作成する:
```
---
tags: [inbox]
created: YYYY-MM-DD
---

# タイトル

本文

## 関連リンク
- [[関連ノート]]
- [[MOC名]]
```

## タグ体系
状態: #inbox #wip #done
トラック: #learning #product
形式: #decision #reading #daily #incident #ops

## MOC構成
- [[MOC Home]] → 全体の入口
  - [[MOC Learning]] → 学習全体
    - [[MOC AWS]]
    - [[MOC Security]]
    - [[MOC AI Engineering]]
    - [[MOC Observability]]
    - [[MOC DevSecOps]]
    - [[MOC Business]]
  - [[MOC Product]] → プロダクト開発全体
    - [[MOC Ideas]]
  - [[MOC Comms]] → コミュニケーション
  - [[MOC Reading]] → 読んだもの全て

## 定期タスク

### 毎朝（自動実行）
以下を巡回して _daily/YYYY-MM-DD.md に要約を保存:
- Claude Code チェンジログ（https://code.claude.com/docs/en/changelog）
- Anthropic公式ニュース（https://www.anthropic.com/news）
- Hacker News の AI 関連トップ記事
- OpenAI / Codex / Cursor / GitHub Copilot の動き
- Vercel / Supabase のアップデート
- 主要なセキュリティ脆弱性ニュース
- X（Twitter）でのClaude Code / AI Agent関連の注目ツイート
→ 関連する既存ノートがあればリンクを追記

### 毎晩（対話型）
- デイリーログを構造化して _daily/ に保存
- 新しいノートを該当MOCにリンク
- #inbox ノートがあれば整理を提案
- 未完了タスクを翌日に繰り越し

### 毎週日曜
- 週次サマリー自動生成 → _weekly/ に保存
- 学習トラック: 今週学んだこと → 来週の学習提案
- 開発トラック: 進捗 vs 計画のギャップ分析
- DevSecOps: Dependabot PR状況、セキュリティアラート棚卸し
- 孤立ノート検出・整理
- ビジュアルレポート（HTML）を _outputs/ に生成

### 毎月1日
- 月次レビュー: コスト・時間投資・学習進捗・プロダクト状況
- MOCの棚卸し（分割・統合の判断）
- 全依存パッケージのメジャーバージョン確認
- インフラコスト確認（Vercel, Supabase, Grafana の使用量）

## 開発フロー
1. 実装の前に必ず計画を立てて、ユーザーに確認を取る
2. 計画が承認されたら、テストを先に書く（TDD）
3. テストが失敗することを確認してから実装する
4. 実装後、テストが全て通ることを確認する
5. セキュリティ観点でOWASP Top 10に照らしてセルフレビューする
6. 完了前にリファクタリングの余地がないか確認する

## プロダクト開発ルール
- 企画・仕様・意思決定 → Vault の notes/ にノートとして残す
- コード → ~/projects/プロダクト名/ に独立リポジトリとして管理
- ストーリー管理 → 各リポジトリの .stories/ にファイルで管理
- 進捗ダッシュボードは _outputs/ にHTML生成

## DevSecOpsルール
- 新規リポジトリ作成時: Dependabot Alerts ON、.gitignore に .env 追加
- コミット前: lint・型チェック・テストを通す
- シークレットは .env ファイルに書く。ターミナルに直接打たない
- 依存パッケージの脆弱性アラートは放置しない
- インシデント発生時: Vaultに #incident ノートを作成

## Karpathy LLM Wikiパターン
- raw/ に原資料を入れる
- Claudeは raw/ を読んで notes/ にノートを生成・更新する
- 既存ノートとの矛盾があればフラグを立てる
- raw/ には絶対に書き込まない

## 現在のフォーカス
- 学習: 環境構築 + セキュリティ基礎
- 開発: Phase A（学習プロダクト）準備中
- 次のマイルストーン: Vault + GitHub + Cowork の基盤確立
