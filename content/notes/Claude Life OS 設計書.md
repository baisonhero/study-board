# Claude Life OS — 全活動をClaudeに集約する設計書 v2

## コンセプト

「Claudeに話しかけることから、全てが始まる」

Obsidian Vault = Claudeの長期記憶。リンクとMOCで知識が有機的に繋がり、
フォルダではなく「つながり」で情報を見つける。

---

## アーキテクチャ

```
iPhone (移動中)
  └─ Claude Mobile → Dispatch (Macに作業を投げる)

MacBook Pro (メイン)
  ├─ Claude Desktop (Cowork) → ~/vault/ を常時監視
  ├─ Claude Code → ~/projects/ で開発
  ├─ Claude in Chrome → Web全般の操作
  └─ Obsidian → ~/vault/ を表示・手動編集

GitHub
  └─ vault リポジトリ (全デバイス同期・バージョン管理)
```

**情報の流れ**: あらゆる活動 → Claudeとの対話 → Vault に保存 → リンクで繋ぐ → GitHubにsync

---

## Vault 構成: リンク中心設計

### フォルダは「ノートの種類」で最小限に

```
~/vault/
├── CLAUDE.md            # Claudeへの常駐指示書
├── _daily/              # 日次ログ（自動生成）
├── _weekly/             # 週次レビュー（自動生成）
├── _templates/          # Obsidianテンプレート
├── _attachments/        # 画像・PDF等の添付ファイル
├── _outputs/            # 生成した資料（pptx, xlsx, pdf）
├── raw/                 # 原資料（Claudeは読むが書かない。不可変の情報源）
│                        #   記事、論文、スクショ、参考資料など
│                        #   → Karpathy LLM Wikiパターン
└── notes/               # 全てのノートはここ（フラット）
                         #   Claudeが raw/ を読んでノートを生成・更新する
```

これだけ。`notes/` の中にサブフォルダは作らない。
ノートはリンク・タグ・MOCで整理する。

### Karpathy LLM Wikiパターンの導入

`raw/` は Karpathy が提唱した「LLM Wiki」の原資料層。
Claudeはここを読むが絶対に書かない。元ソースの真正性を保つ。

```
raw/ に記事や論文を入れる
  → Coworkに「raw/の新しい資料を読んで、notes/を更新して」と依頼
  → Claudeが既存ノートを更新、新規ノートを作成、MOCにリンク追加
  → 矛盾があればフラグを立てる
```

RAGと違って毎回ゼロから検索しない。知識が蓄積・構造化されていく。

### なぜフラットか

- 「AWSのセキュリティ学習メモ」→ aws/ ？ security/ ？ learning/ ？ → 迷う時点で破綻
- フラットなら迷わず書ける。整理はリンクとMOCが自動的にやる
- Claudeにとっても全ノートが1箇所にある方が検索・参照しやすい

---

## MOC（Map of Content）で知識を繋ぐ

MOCは「他のノートへのリンクを集めた地図ノート」。フォルダの代わり。

### コアMOC（最初に作るもの）

```
MOC Home（ホーム）
├── MOC Learning（学習全体の地図）
│   ├── MOC AWS
│   ├── MOC Security
│   ├── MOC AI Engineering
│   ├── MOC Observability
│   ├── MOC DevSecOps
│   └── MOC Business
├── MOC Product（プロダクト開発の地図）
│   ├── MOC Ideas
│   └── MOC Project-X（各プロダクトごと）
├── MOC Comms（コミュニケーションの地図）
└── MOC Reading（読んだもの全ての地図）
```

### MOCの中身（例: MOC Security）

```markdown
# MOC Security

## なぜ学ぶか
セキュリティが疎いと自覚 → 最大の伸びしろ。
プロダクト開発にも直結する。→ [[MOC Product]]

## 基礎
- [[OWASP Top 10 まとめ]]
- [[認証と認可の違い]]
- [[TLSの仕組み]]

## AWS関連（→ [[MOC AWS]] とも繋がる）
- [[IAMベストプラクティス]]
- [[Security Hub 導入メモ]]

## 気になるニュース
- [[2026-04-10 Log4j後継の脆弱性]]

## 未整理・要深掘り
- [[ゼロトラストって結局何]]
```

**ポイント**: 1つのノート（例: IAMベストプラクティス）がMOC SecurityからもMOC AWSからもリンクされる。フォルダでは不可能な「多重所属」。

---

## タグの使い方

タグはノートの「状態」や「横断的な属性」に使う。トピック分類はMOCに任せる。

```
状態タグ:
  #inbox     — 未整理、とりあえず書いた
  #wip       — 作業中・深掘り中
  #done      — 一旦完了

トラックタグ:
  #learning  — 学習トラック
  #product   — 開発トラック

形式タグ:
  #decision  — 意思決定ログ
  #reading   — 読書・記事メモ
  #daily     — 日次ログ
  #incident  — インシデント記録
  #ops       — 運用・保守メモ
```

---

## ノートの書き方ルール

### 全ノート共通

```markdown
---
tags: [inbox, learning]
created: 2026-04-14
---

# タイトルは内容を表す文にする

本文をここに書く。

## 関連リンク
- [[関連するノートA]]
- [[MOC Security]]
```

- ファイル名 = タイトル（日本語OK）
- 必ず1つ以上のMOCにリンクする（孤立ノートを防ぐ）
- #inbox で始めて、整理したら #done に変える

### Claudeが作るノートも同じルール

CLAUDE.md にこのルールを書いておけば、
Coworkが自動生成するノートも同じフォーマットで統一される。

---

## 二つのトラック

### トラック1: 学習（知識の底上げ） #learning

**目的**: 自分の市場価値と判断力を上げる。直接の収益は狙わない。

| 分野 | なぜ必要か | Claudeの役割 |
|------|-----------|-------------|
| セキュリティ | 自称「疎い」→ 最大の伸びしろ | 日次で脆弱性ニュース要約、学習ロードマップ管理 |
| AI/LLMエンジニアリング | Claude APIを使い倒すための基礎 | ハンズオン課題の生成、コードレビュー |
| 可観測性（o11y） | OTel/Grafana/SigNozの実践知識 | 計装パターンの提案、ダッシュボード設計支援 |
| DevSecOps | 開発だけでなく保守運用まで一人で回す力 | CI/CD構築、依存パッケージ監視、インシデント対応支援 |
| ビジネス/マーケティング | 作っても売れないを防ぐ | 書籍・記事の要約、フレームワーク整理 |
| AWSアップデート | 全冠の知識を陳腐化させない | 週次でアップデート情報収集・整理 |

学んだことは全て `notes/` にノートとして保存し、該当するMOCにリンク。
過去の学習履歴を踏まえて「次に学ぶべきこと」をClaudeが提案する。

### トラック2: プロダクト開発 #product

プロダクト開発は2段階で進める。

**Phase A: 学習プロダクト（マネタイズしない）**
→ Claudeの使い方を体で覚えるための開発。詳細は後述。

**Phase B: マネタイズプロダクト（Phase A完了後）**
→ 実際にお金を生むサービス。Phase Aで身につけたClaude活用力が武器になる。

**フェーズ（Phase B向け）**:
```
課題発見 → 市場検証 → MVP開発 → ユーザー獲得 → 改善 → 収益化
```

**Claudeの役割（フェーズ別）**:
- **課題発見**: 日常の不便を #inbox でメモ → Claudeが定期的にパターン分析
- **市場検証**: Claudeが競合調査・市場規模推定 → MOC Ideas に追加
- **MVP開発**: Claude Codeで高速プロトタイピング
- **ユーザー獲得**: LP作成、SNS文案、コミュニティ投稿の下書き
- **改善**: ユーザーフィードバックの分析・優先順位づけ
- **収益化**: 価格設定の壁打ち、コスト構造の管理

**鉄則**: 意思決定は #decision タグ付きノートに必ず残す。
「なぜやる」「なぜやらない」の判断理由が全て蓄積される。

---

## プロダクト開発アーキテクチャ

### Vault とコードの分離

```
~/vault/                    ← POの頭の中（Obsidian + Cowork）
  notes/
    Product-A 企画書.md      ← なぜ作るか、誰のためか
    Product-A 競合分析.md    ← 市場調査
    Product-A ユーザーストーリー.md
    Product-A 技術選定の判断.md  (#decision)
    ...
  raw/                       ← 原資料（Claudeは読むだけ。LLM Wikiパターン）
  _outputs/
    product-a-dashboard.html ← 進捗ダッシュボード（Claude自動生成）

~/projects/                 ← エンジニアの成果物（Claude Code）
  product-a/                ← 独立したGitリポジトリ
    CLAUDE.md               ← Claude Codeへの開発指示書
    README.md
    src/
    tests/
    ...
  product-b/                ← 別の独立したGitリポジトリ
    ...

~/sandbox/                  ← 実験・検証用（Hermes Agent等）
  hermes-agent/             ← 本体系とは完全に分離
```

**Vaultに置くもの**: Why（なぜ作るか）、Who（誰のためか）、What（何を作るか）、意思決定ログ
**リポジトリに置くもの**: How（どう作るか）、コード、技術ドキュメント

### PO × Claude の開発フロー

```
1. 企画（Vault + Cowork）
   Claudeと壁打ち → 課題定義・仕様をノートに → MOC Product-A にリンク

2. 指示（CLAUDE.md）
   リポジトリのCLAUDE.mdに開発方針・アーキテクチャ・コーディング規約を記述
   Vaultの仕様ノートを参照させてもOK

3. 実装（Claude Code）
   「この仕様で作って」→ Claude Codeがコード生成・テスト実行
   自分はVS Codeで眺めて方向性を確認、必要に応じて介入

4. 確認（ダッシュボード）
   Claude Codeが日次で進捗サマリーを生成
   _outputs/ にHTMLダッシュボード出力（タスク完了率、残課題、技術的負債）
   ブラウザで確認 → フィードバックをClaudeに伝える

5. 記録（Vault）
   意思決定・方針変更は全てVaultにノートとして残す
   開発ログもデイリーログに自動で反映
```

---

## 可観測性（Observability）戦略

### 技術スタック

```
アプリ（Next.js on Vercel）
  └─ OpenTelemetry（@vercel/otel）でトレース・メトリクス・ログを収集
       │
       ├─【学習段階】→ SigNoz（Docker、ローカル完結、完全無料）
       │                 仕組みを理解するための環境
       │                 ClickHouseがDB兼務、Docker Compose一発で全部立つ
       │
       └─【本番段階】→ Grafana Cloud（無料枠: 10Kメトリクス、50GBログ、3ユーザー、14日保持）
                        インフラ管理不要、商用利用OK、永続無料
                        超えたらPro（月$19）に移行

Supabase
  └─ Metrics API → Grafana Cloud で可視化（公式ダッシュボードJSON 200+チャート）
```

### なぜこの順番か

- OTelで計装しておけば、送り先を変えるのは環境変数1つ。コード書き直し不要
- SigNozはバックエンド含め全部ローカルにあるので「データがどう流れるか」が見える
- Grafana Cloudは1人運用なら3ユーザー枠は無関係、使用量のみが制限
- Grafana Cloudの無料枠は商用利用OK、期限なし

### プロアクティブ監視（Grafana Cloud移行後）

- APIの応答時間が500msを超えたらSlackに通知
- Supabaseの接続数が上限の80%に達したら警告
- エラーレートが急増したら即座にアラート
- これらはGrafanaのアラート機能でノーコードで設定可能

---

## DevSecOps戦略

### 思想

「作って終わり」にしない。開発（Dev）・セキュリティ（Sec）・運用（Ops）を
学習プロダクトの段階から組み込んで、Phase Bでは自然に回っている状態を作る。

### DevSecOpsパイプライン（全プロダクト共通）

```
コード作成 → Push → CI自動実行 → デプロイ → 本番監視 → フィードバック
                      │
                      ├─ Lint / 型チェック（ECC Hooksで自動）
                      ├─ テスト実行（Claude Codeが生成したテスト）
                      ├─ セキュリティスキャン
                      │   ├─ Dependabot（依存パッケージの脆弱性検出、GitHub無料）
                      │   ├─ AgentShield（CLAUDE.md/MCP設定のスキャン、ECC無料）
                      │   └─ GitHub Code Scanning（コード内の脆弱性、無料）
                      ├─ OTel計装チェック
                      └─ ビルド・デプロイ（Vercel自動デプロイ）
```

### Dev: 開発フェーズ

| ツール | 用途 | コスト |
|--------|------|--------|
| Claude Code + ECC | コード生成・レビュー・テスト | Maxプラン内 |
| ECC Hooks | 保存時自動lint・型チェック・console.log検出 | 無料 |
| ECC Continuous Learning | 失敗パターンをInstinctとして自動蓄積 | 無料 |
| GitHub Actions | CI/CD パイプライン実行 | 無料枠（2,000分/月） |
| Vercel | 自動デプロイ・プレビュー環境 | 無料枠 |

### Sec: セキュリティフェーズ

| ツール | 用途 | コスト |
|--------|------|--------|
| Dependabot Alerts | 依存パッケージの既知脆弱性を通知 | 無料（GitHub内蔵） |
| Dependabot Security Updates | 脆弱性修正PRを自動作成 | 無料（GitHub内蔵） |
| Dependabot Version Updates | 定期的にパッケージを最新化 | 無料（.github/dependabot.yml） |
| AgentShield | AI設定の脆弱性スキャン | 無料（ECC内蔵） |
| GitHub Code Scanning | コード内のセキュリティ問題検出 | パブリックリポジトリ無料 |
| ECC security-reviewer | セキュリティ観点のコードレビュー | Maxプラン内 |
| `.env` + `.gitignore` | シークレット漏洩防止 | — |

### Ops: 運用フェーズ

| ツール | 用途 | コスト |
|--------|------|--------|
| OpenTelemetry | トレース・メトリクス・ログ収集 | 無料（OSS） |
| SigNoz → Grafana Cloud | 可視化・ダッシュボード・アラート | 無料枠 |
| Vercel Analytics | フロントエンドパフォーマンス | 無料枠 |
| Supabase Metrics API | DB監視 | 無料枠 |
| Coworkスケジュール | 定期的な健全性チェック自動実行 | Maxプラン内 |

### 学習プロダクトでのDevSecOps段階的導入

```
Project 0（Week 2）: まだ不要。Coworkの体験に集中。

Project 1（Week 3-4）: Dev基礎
  - GitHub リポジトリ作成時に Dependabot Alerts ON（GUI）
  - .gitignore に .env を追加
  - ECC Rules + Hooks を導入
  - Claude Code にテストを書かせる習慣

Project 2（Week 5-6）: Sec + Ops 導入
  - Dependabot Version Updates 追加（.github/dependabot.yml）
  - GitHub Actions で CI パイプライン構築（lint → test → build）
  - OTel 計装 → SigNoz → Grafana Cloud
  - Vercel 自動デプロイ設定
  - AgentShield でプロジェクト設定をスキャン

Project 3（Week 7-8）: 全部回す
  - DevSecOps パイプライン完全稼働
  - Grafana でアラート設定
  - Dependabot の PR を確認・マージする運用体験
  - インシデント対応シミュレーション（意図的に障害を起こして復旧する）
```

### 運用ルーティン（Phase B以降）

**日次（Claudeが自動実行）**:
- Dependabot PRの有無を確認 → 内容要約してデイリーログに記載
- Grafana アラートの確認 → 異常があればVaultにインシデントノート作成
- デプロイ状況の確認

**週次（週次レビューに含める）**:
- 依存パッケージの更新状況まとめ
- セキュリティアラートの棚卸し
- パフォーマンストレンド（応答時間、エラーレート）の振り返り
- 技術的負債のリストアップ

**月次**:
- 全依存パッケージのメジャーバージョン確認
- セキュリティポリシーの見直し
- インフラコスト確認（Vercel, Supabase, Grafana の使用量）

---

## 学習プロダクト計画（Phase A）

**目的**: マネタイズは一切考えない。
Claudeの全機能（Claude Code, API, Cowork, コネクター）を実戦で体験し、
「Claudeで何がどこまでできるか」の肌感覚を得る。

### Project 0: Vault Dashboard（Week 2）

**学べること**: Coworkでのファイル生成、HTML/JS、Vault連携

Coworkに「Vaultの状態を可視化するダッシュボードを作って」と依頼。
ノート数、MOCごとのノート数、最近の活動、孤立ノート一覧、
学習進捗グラフなどをHTMLで自動生成させる。
→ _outputs/vault-dashboard.html をブラウザで開いて確認。

**ゴール**: Coworkに指示して成果物を得る体験。POとしての第一歩。

### Project 1: AWS構成レビューCLI（Week 3-4）

**学べること**: Claude Code開発フロー、Claude API呼び出し、CLI設計

```
~/projects/aws-config-reviewer/
```

CloudFormation / Terraform のテンプレートを読み込んで、
Claude APIにセキュリティ観点でのレビューを依頼するCLIツール。

```bash
$ aws-review scan template.yaml
⚠ S3バケットにパブリックアクセスが許可されています
⚠ IAMロールに過剰な権限が付与されています
✓ VPCフローログが有効です
```

- AWS知識（強み）× セキュリティ学習（弱み）× Claude API（新スキル）の交差点
- Claude Codeに「このCLIを作って」と指示 → PO体験
- 自分でもコードを読んでAPI呼び出しの仕組みを理解
- 自分のAWS環境に実際に使える実用ツールになる

**ゴール**: Claude API統合の基本パターン習得。PO→実装の流れを体験。

### Project 2: 開発日報ジェネレーター（Week 5-6）

**学べること**: Web UI開発、GitHub API連携、複数データソース統合、**OTel + 可観測性**

```
~/projects/dev-daily-report/
```

GitHub のコミットログ + Vaultのデイリーログを読み込んで、
見やすい日報・週報をHTML/Reactで自動生成するWebアプリ。

- GitHub API からコミット・PR情報を取得
- Vaultの _daily/ からその日の学習・思考ログを取得
- Claude APIで自然な文章にまとめる
- React UIで表示（フィルタ、期間選択）
- **OTel計装を組み込み、まずSigNoz（Docker）で動作を理解**
- **理解したらGrafana Cloudに送り先を切り替え（環境変数変更のみ）**

**ゴール**: フルスタック開発をClaude Codeに任せるPO体験。
複数APIの統合パターンを学ぶ。OTelの実践経験を積む。
→ これ自体がPhase Bのマネタイズプロダクトのヒントになる可能性あり。

### Project 3: セキュリティ学習クイズBot（Week 7-8）

**学べること**: Claude APIの高度な使い方（プロンプト設計、会話管理）

```
~/projects/security-quiz-bot/
```

Vaultの MOC Security 配下のノートを教材として読み込み、
自分の理解度に合わせたクイズを出題するWebアプリ。

- Vault内の学習ノートをコンテキストとしてClaudeに渡す
- 間違えた問題は記録して重点的に出題（間隔反復）
- 正答率の推移をダッシュボード表示

**ゴール**: プロンプトエンジニアリングの実践。
RAG（自分のノートを検索して回答に使う）パターンの理解。
→ セキュリティ学習トラックとの相乗効果。

### 番外: Hermes Agent 体験（Week 7-8 の空き時間）

**学べること**: 自己改善型エージェントの仕組み、ECC/Claude Codeとの違い

```
~/sandbox/hermes-agent/    ← 本体系とは完全に分離
```

本体の開発計画（ECC + Claude Code）には影響させない。
純粋に「自己改善型エージェントとはどういうものか」を触って学ぶ。

- `curl` 一発でインストール（MIT、完全無料）
- Ollama（ローカルモデル）を使えばAPI料金もゼロ
- スキル自動生成・記憶の永続化・cronタスクを体験
- ECCのInstinct/Evolveの仕組みと比較して違いをVaultにメモ
- 将来Telegramボット等に活用できるかの判断材料にする

**ゴール**: 自己改善エージェントの肌感覚を得る。
ECCとの比較をノートに残して MOC AI Engineering にリンク。

### Phase A 完了の判断基準

以下を全て体験したらPhase A完了、Phase Bへ移行:
- [ ] Coworkでファイル生成を指示できた
- [ ] Claude Codeでゼロからプロジェクトを立ち上げた
- [ ] Claude APIを自分のアプリから呼び出した
- [ ] POとして仕様を書き、Claude Codeに実装させた
- [ ] VS Codeでコードを確認し、方向修正のフィードバックを出せた
- [ ] 複数のデータソースをClaude経由で統合した
- [ ] プロンプト設計で出力品質を制御する感覚を得た
- [ ] OTelでアプリを計装し、SigNozでトレースを確認した
- [ ] Grafana Cloudへの切り替えを実施した
- [ ] GitHub ActionsでCI/CDパイプラインを構築した
- [ ] Dependabotを有効化し、PRの確認・マージを体験した
- [ ] AgentShieldでプロジェクト設定のセキュリティスキャンを実施した
- [ ] Vercelへの自動デプロイを設定した
- [ ] Grafanaでアラートを設定し、通知を受け取った
- [ ] 「Claudeで何ができて何ができないか」を自分の言葉で説明できる

---

## 定期タスクスケジュール

Cowork + CLAUDE.md の指示で、Claudeが実行するルーティン。

### 毎朝（自動実行）

Coworkスケジュールタスクで以下を自動巡回 → `_daily/` にログ保存:

**AI駆動開発**:
- Claude Code チェンジログ（https://code.claude.com/docs/en/changelog）
- Anthropic公式ニュース（https://www.anthropic.com/news）
- everything-claude-code リリース（GitHub Releases）
- Hacker News の AI 関連トップ記事

**競合・業界動向**:
- OpenAI / Codex のアップデート
- Cursor / Windsurf / GitHub Copilot の動き
- Vercel / Supabase のアップデート・ブログ

**セキュリティ**:
- 主要な脆弱性ニュース（CVE、GitHub Advisory）
- Dependabot が検出した新しいアラート

**AWS**:
- AWS What's New（週次でまとめ）

**開発者コミュニティ**:
- X（Twitter）でのClaude Code / AI Agent関連の注目ツイート
- Dev.to / Zenn のAIエージェント関連記事

→ 関連する既存ノートがあればリンクを追記
→ 前日のコミットログ・作業ログから振り返り生成
→ 今日のカレンダー確認 → 推奨タスクを提示

### 毎晩（対話型）

- 「今日何やった？何を学んだ？」をClaudeに話す
- Claudeがデイリーログを構造化して `_daily/` に保存
- 新しいノートを該当MOCにリンク
- #inbox ノートがあれば整理を提案
- 未完了タスクを翌日に繰り越し

### 毎週日曜（自動 + 対話）

- 週次サマリー自動生成 → `_weekly/` に保存
- 今週作成したノート一覧と、繋がったリンクの可視化
- 学習トラック: 今週学んだこと → 来週の学習提案
- 開発トラック: 進捗 vs 計画のギャップ分析
- **DevSecOps**: Dependabot PRの状況確認、セキュリティアラート棚卸し
- **DevSecOps**: パフォーマンストレンド確認（応答時間、エラーレート）
- **DevSecOps**: 技術的負債のリストアップ
- 孤立ノート（どのMOCにもリンクされていない）の検出・整理
- ビジュアルレポート（HTML）も生成

### 毎月1日（自動 + 対話）

- 月次レビュー: コスト・時間投資・学習進捗・プロダクト状況
- MOCの棚卸し（成長したMOCの分割、不要なMOCの統合）
- アイデアの棚卸し（捨てる・育てる判断）
- **DevSecOps**: 全依存パッケージのメジャーバージョン確認
- **DevSecOps**: セキュリティポリシーの見直し
- **DevSecOps**: インフラコスト確認（Vercel, Supabase, Grafana の使用量）
- 翌月の重点テーマ設定

### 不定期（Claudeが自動検知）

- AWS新サービス発表 → 要約 + 既存ノートへのリンク追加
- セキュリティ重大脆弱性 → 影響範囲チェック + 対応提案
- **Dependabot重大アラート** → 即座にVaultに #incident ノート作成 + 対応優先度判定
- 競合プロダクトの動き → MOC Ideas に追記

---

## Claudeを経由させる全活動

| 活動 | Claudeの関与 | 保存形式 |
|------|-------------|---------|
| アイデアを思いつく | Claudeに話して壁打ち→ノート化 | ノート + MOC Ideas にリンク |
| 記事・動画を見た | Claudeに要約+関連分析 | ノート(#reading) + 関連MOCにリンク |
| メールを書く | Claudeに文脈共有→下書き生成 | ノート(#comms) |
| 技術を学ぶ | Claudeに教材生成→理解度チェック | ノート(#learning) + 該当MOCにリンク |
| コードを書く | Claude Codeと共同開発 | ~/projects/ + 設計メモはVaultに |
| 判断に迷う | Claudeに材料整理→決定理由記録 | ノート(#decision) + プロジェクトMOCにリンク |
| 資料を作る | Vaultのノートからpptx/xlsx生成 | _outputs/ に保存 |
| 振り返り | Claudeがログから自動生成 | _daily/ _weekly/ |
| 情報収集 | Claudeが定期巡回→ノート化 | ノート + 関連MOCにリンク |
| 脆弱性対応 | Dependabot PR確認→Claudeが影響分析・対応 | ノート(#ops) + MOC DevSecOps にリンク |
| インシデント対応 | Grafanaアラート→Claudeが原因分析・復旧支援 | ノート(#incident) + MOC DevSecOps にリンク |
| 依存パッケージ更新 | Claudeが変更内容を要約・互換性チェック | ノート(#ops) + 週次レビューに反映 |

---

## Mac到着日チェックリスト

### Phase 1: 基盤構築（到着日）

- [ ] macOSセキュリティ設定（FileVault ON、ファイアウォール ON、自動アップデート ON）
- [ ] Homebrew インストール
- [ ] Git インストール + GitHub SSH鍵設定
- [ ] Claude Desktop インストール → Maxプランでログイン
- [ ] Claude in Chrome インストール
- [ ] Obsidian インストール
- [ ] `~/vault/` 作成 → 最小フォルダ構成を展開（_daily, _weekly, _templates, _attachments, _outputs, raw, notes）
- [ ] `~/vault/` を GitHub リポジトリとして初期化・push
- [ ] ObsidianでVaultを開く
- [ ] CLAUDE.md 作成（方針・ノートルール・自己紹介を記述）
- [ ] CoworkのプロジェクトにVaultフォルダを登録
- [ ] MOC Home を作成 → MOC Learning, MOC Product, MOC Reading をリンク
- [ ] 各MOCの初期版を作成（中身は空でOK、育てていく）

### Phase 2: 開発環境（到着日 or 翌日）

- [ ] VS Code インストール
- [ ] Node.js インストール（Claude Code用）
- [ ] Claude Code インストール
- [ ] Python + pip セットアップ
- [ ] Docker Desktop インストール（SigNoz用）
- [ ] `~/projects/` 作成
- [ ] `~/sandbox/` 作成（Hermes Agent等の実験用、本体系とは分離）
- [ ] Claude Codeでテストプロジェクト作成（動作確認）
- [ ] MOC Product を作成 → MOC Learning Project（Phase A用）をリンク
- [ ] everything-claude-code クローン → `~/tools/ecc/` に配置
- [ ] ECC Rules（common + typescript）を `~/.claude/rules/` にコピー
- [ ] ECC トークン最適化設定を `~/.claude/settings.json` に追加

### Phase 3: 連携拡張（最初の1週間）

- [ ] Gmail コネクター接続
- [ ] Google Calendar コネクター接続
- [ ] Google Drive コネクター接続
- [ ] GitHub コネクター接続
- [ ] Obsidianテンプレート作成（daily-log, idea, learning-note, decision-log）
- [ ] 朝・夜のルーティンをCLAUDE.mdに記述
- [ ] Dispatch設定（iPhoneからMacへのタスク投げ）
- [ ] 最初のデイリーログを実行 → リンク・タグの動作確認
- [ ] Coworkスケジュールタスク: Claude Codeの最新チェンジログを日次確認→Vaultにまとめる

### Phase 4: 実運用開始（2週目〜）

- [ ] 学習トラック: 最初のテーマ設定（セキュリティ推奨）→ MOC Security を育て始める
- [ ] **Project 0**: CoworkにVault Dashboardを作らせる（Week 2）
- [ ] **Project 1**: aws-config-reviewer CLI 開発開始（Week 3-4）
  - [ ] Dependabot Alerts ON、.gitignore に .env 追加、ECC Hooks 導入
- [ ] **Project 2**: dev-daily-report Web アプリ開発（Week 5-6）
  - [ ] GitHub Actions CI構築、Dependabot Version Updates追加
  - [ ] OTel → SigNoz → Grafana Cloud、Vercel自動デプロイ、AgentShieldスキャン
- [ ] **Project 3**: security-quiz-bot 開発（Week 7-8）
  - [ ] DevSecOpsパイプライン完全稼働、Grafanaアラート設定
  - [ ] インシデント対応シミュレーション実施
- [ ] **番外**: Hermes Agent を ~/sandbox/hermes-agent/ にインストールして体験（Week 7-8 空き時間）
- [ ] 週次レビューを初回実施（Dependabot PR状況、セキュリティアラート含む）
- [ ] グラフビュー（Obsidianのノード図）を確認 → 繋がりの可視化
- [ ] 孤立ノートの検出 → リンク整理
- [ ] 運用しながらMOC構成・テンプレートを調整
- [ ] Phase A 完了判定 → Phase B（マネタイズプロダクト）へ移行

---

## CLAUDE.md サンプル

```markdown
# Claude Life OS

## 自己紹介
- AWS全冠保持者、Webアプリ開発経験あり
- セキュリティは学習中
- 目標: Claudeを活用してマネタイズ可能なサービスを構築する

## 方針
- 全ての情報はこのVaultに一元化する
- 学習(#learning)と開発(#product)は明確に分ける
- 意思決定には必ず理由を残す(#decision)
- 「作ってから売り先を探す」はしない

## ノートルール
- 保存先: notes/ にフラットに置く（サブフォルダ禁止）
- ファイル名: 内容を表すタイトル（日本語OK）
- 必ず1つ以上のMOCにリンクすること（孤立ノート禁止）
- タグ: #inbox → 整理後 #done に変更
- 日本語で記述
- 日次ログは _daily/ に YYYY-MM-DD.md で保存
- 生成資料は _outputs/ に保存
- raw/ は原資料の保管場所。Claudeは読むが絶対に書かない
- raw/ に新資料が追加されたら、notes/ を更新し関連MOCにリンク

## 定期タスク
- 毎朝: AI駆動開発情報の巡回（Claude Code changelog, Anthropic news, ECC releases, HN, 競合動向, セキュリティ, AWS） → _daily/ に要約
- 毎晩: デイリーログ生成、#inbox ノートの整理提案
- 毎週日曜: 週次レビュー、孤立ノート検出、学習提案、DevSecOps棚卸し
- 毎月1日: 月次レビュー、MOC棚卸し、アイデア棚卸し、インフラコスト確認

## 現在のフォーカス
- 学習: [ここに現在の学習テーマ]
- 開発: Phase A（学習プロダクト） → [ここに現在のプロジェクト名]
- 次のマイルストーン: [ここに直近の目標]

## プロダクト開発ルール
- 企画・仕様・意思決定 → Vault の notes/ にノートとして残す
- コード → ~/projects/プロダクト名/ に独立リポジトリとして管理
- 各リポジトリには CLAUDE.md を置いて開発方針を記述
- 進捗ダッシュボードは _outputs/ にHTML生成

## DevSecOpsルール
- 新規リポジトリ作成時: Dependabot Alerts ON、.gitignore に .env 追加
- コミット前: lint・型チェック・テストを通す（ECC Hooksが自動実行）
- PR作成時: GitHub Actions CI が自動実行（lint → test → build → security scan）
- シークレットは .env ファイルに書く。ターミナルに直接打たない
- 依存パッケージの脆弱性アラートは放置しない。週次レビューで棚卸し
- デプロイ後: Grafana Cloudでアラート監視
- インシデント発生時: Vaultにインシデントノートを作成（#incident タグ）
```

---

*このドキュメント自体を `~/vault/notes/Claude Life OS 設計書.md` として保存し、
[[MOC Home]] からリンクして、運用しながら育てていく。*
