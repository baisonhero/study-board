---
tags: [done, moc]
created: 2026-04-19
auto-generated: 2026-05-06
aliases:
  - MOC AI Engineering
  - MOC AI
---

# MOC AI Engineering

> [!summary]
> Claude API・エージェント設計・プロンプトエンジニアリング・AI駆動開発の地図。「AIで作る」と「AIを組み込んだプロダクトを作る」の両面を扱う。[[MOC Learning]] の一分野でありつつ、[[MOC Product]] の中核技術でもある二重所属のMOC。

## なぜこのMOCがあるか

2025〜2026年は AI エージェント／エージェント型コーディングが急速にコモディティ化しつつある時期で、追いかけるべき領域が **モデル本体・プロンプト・ハーネス・セキュリティ・運用** に分散している。ここで分野を分けて全体地図を持っておかないと、ニュースや論文を読み続けても自分のスタックに繋がらない。

## サブ領域

### モデル & API

- Claude API の使い方（Messages API、Tool Use、Extended Thinking など）
- モデル選定の基準: コスト・レイテンシ・能力・コンテキスト長
- マルチモーダル: 画像・PDF・音声入力

### エージェント設計（ハーネス）

- ループ構造（observe → think → act）
- ツール設計（小さく分割、副作用は明示、戻り値を機械可読に）
- コンテキスト管理（要約・圧縮・サブエージェント）
- 失敗のリカバリ（再試行・スキップ・人間エスカレーション）

### プロンプトエンジニアリング

- システムプロンプトの構造化（XMLタグ、思考促進、出力制約）
- Few-shot / Chain-of-Thought の使い分け
- 評価駆動の改善（評価セットを先に作る）

### AIアプリ・セキュリティ

- [[LLMアプリケーションセキュリティ]] — OWASP LLM Top 10
- プロンプトインジェクション対策、出力ハンドリング、Tool Use の権限境界
- 機密情報のリーク防止

### AI駆動開発（自分の作業の効率化）

- [[AI駆動開発の変遷 2020-2026]] — 2020年からの時系列
- Claude Code / Cursor / Copilot / Codex / Devin の使い分け
- vibe coding と TDD のバランス

## 主要ノート

- [[AI駆動開発の変遷 2020-2026]]
- [[LLMアプリケーションセキュリティ]]
- [[Claude Life OS 設計書]] — Claude を中心に据えた個人OSの設計
- [[AWS で Claude を利用する 3 つの選択肢]] — Bedrock / Claude Platform on AWS / Claude Enterprise の違い、1st/3rd party、Marketplace の役割

## 学習の進め方

1. **公式から**: Anthropic / OpenAI / Google のドキュメントが最も速い情報源。書籍は半年〜1年遅れる
2. **手を動かす**: API直接呼び出し → エージェントループの自作 → ツール設計、の順で組む
3. **評価をセットで**: プロンプトを書いたら必ず評価セットも作る。改善のループを回せる単位にする
4. **セキュリティ後付け禁止**: [[LLMアプリケーションセキュリティ]] を最初の設計時から考慮

## プロダクトとの接続

- [[MOC Product]] — Claude を使ったプロダクト機能の検討はここから
- [[MOC Ideas]] — 「AI で解決可能な課題」のアイデアパイプライン
- [[MOC Business]] — マネタイズ視点（API原価管理、競合差別化）

## 関連リンク

- [[MOC Learning]]
- [[MOC Product]]
- [[MOC Reading]]
- [[MOC Business]]
- [[MOC Home]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-06）。レビュー・加筆・修正をお願いします。元の構造は保持しつつ、サブ領域・学習方針・プロダクト接続を補強しました。
