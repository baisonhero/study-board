---
tags: [inbox, learning, security]
created: 2026-04-26
aliases:
  - API Top 10
  - APIセキュリティ
---

# OWASP API Security Top 10

> [!summary]
> [[OWASP Top 10]] のWebアプリ版に対する **API特化版**。2023年版が現行。Web版と被る部分も多いが、認可粒度・リソース消費・インベントリ管理など API固有の落とし穴に焦点。Next.js API Routes / Supabase REST API でも全面的に該当する。

## 2023年版の10カテゴリ

| # | 名称 | 内容 |
|---|---|---|
| **API1** | Broken Object Level Authorization (BOLA / IDOR) | あるユーザーが他人のリソースに ID を変えるだけでアクセスできる |
| **API2** | Broken Authentication | トークン検証不備、推測可能なトークン、ブルートフォース対策不足 |
| **API3** | Broken Object Property Level Authorization | 一部プロパティの権限不備（例: 自分のプロフィールは更新OKだが `is_admin` も書き換えられてしまう） |
| **API4** | Unrestricted Resource Consumption | レート制限なし、ペイロードサイズ制限なし → DoS / コスト爆発 |
| **API5** | Broken Function Level Authorization | 管理者向けエンドポイントを一般ユーザーが叩けてしまう |
| **API6** | Unrestricted Access to Sensitive Business Flows | 商品購入や送金など、自動化されると害があるフローへの過剰アクセス |
| **API7** | Server Side Request Forgery (SSRF) | API経由で内部リソースに到達される |
| **API8** | Security Misconfiguration | デフォルトのまま、エラー詳細露出、不要なメソッド有効 |
| **API9** | Improper Inventory Management | 古いAPIバージョンが残ってる、ドキュメント外のエンドポイント |
| **API10** | Unsafe Consumption of APIs | 自分が使う側のAPIを盲信して、レスポンスを検証せず使う |

## 2019年版からの主な変化

- **API3 Object Property Level Auth** が新設 — 「mass assignment」と呼ばれていた問題を独立カテゴリ化
- **API6 Sensitive Business Flows** が新規 — 単なる脆弱性ではなく「ビジネスロジックの悪用」を取り扱う画期的なカテゴリ
- **API4 Lack of Resources & Rate Limiting** → **Unrestricted Resource Consumption** に拡大

## 個別解説（重要なもの）

### API1 BOLA（最も多い、最も致命的）

URLやペイロードに含まれる ID を書き換えるだけで他人のデータにアクセスできる。例：

```
GET /api/orders/12345  ← 自分の注文
GET /api/orders/12346  ← 隣のユーザーの注文（取れてしまう）
```

防御：

- すべての操作で **「このリソースは要求者のものか」を必ずチェック**
- Supabaseなら RLS でDBレベル強制
- IDをUUIDにすればマシだが**根本対策にはならない**（推測しにくくしただけ）

### API3 Property Level（mass assignment）

```javascript
// 危険
db.user.update(userId, req.body)  // is_admin: true が混入されたら？

// 安全
const { name, email } = req.body  // 許可フィールドだけ取り出す
db.user.update(userId, { name, email })
```

ORMやフレームワークの「便利機能」が罠になりやすい。**allowlistでフィールド指定**が原則。

### API4 Resource Consumption（コスト爆発）

クラウド時代に経済的損害が大きい：

- 1リクエストで重い処理（N+1、フルテーブルスキャン）
- 巨大ペイロードを受け付けてメモリ枯渇
- LLM API のような従量課金エンドポイントで無制限ループ
- 無制限ファイルアップロード

防御：

- レート制限（Vercel Edge Config、Cloudflare、Upstash Ratelimit等）
- ペイロードサイズ上限
- タイムアウト設定
- 認証必須化

### API6 Sensitive Business Flows

技術的脆弱性ではないがビジネスダメージを与える例：

- bot で限定商品を全買い占め
- 紹介報酬を自動マッチで稼ぐ
- パスワードリセットを連打して相手を妨害

防御：

- CAPTCHA、デバイスフィンガープリント、振る舞い分析
- ビジネスロジック側で「人間らしさ」を担保する仕組み

### API9 Inventory Management

「使ってないつもりの v1 API がまだ生きてる」「ドキュメントにないエンドポイントが残ってる」がよくある。

防御：

- API カタログを管理（OpenAPI / GraphQL schema を真実の源に）
- Deprecation policy を持って計画的に廃止
- 本番のリクエストログから「使われてないエンドポイント」を見つける

## Web Top 10 との関係

| API Top 10 | Web Top 10 |
|---|---|
| API1 BOLA | A01 Broken Access Control（の API版） |
| API2 Broken Auth | A07 Identification and Authentication Failures |
| API3 Property Level | A01 + A04 Insecure Design |
| API5 Function Level | A01 |
| API7 SSRF | A10 SSRF |
| API8 Misconfig | A05 |

API版は「**認可の粒度**」「**ビジネス文脈**」が独立しているのが特徴。

## 学習リソース

- OWASP API Security Project: https://owasp.org/www-project-api-security/
- OpenAPI仕様（自分のAPIをスキーマ化する第一歩）
- PortSwigger Web Security Academy（一部API向けラボあり）

## 関連MOC

- [[MOC Security]]
- [[MOC Learning]]

## 関連ノート

- [[セキュリティ学習ロードマップ]]
- [[OWASP]]
- [[OWASP Top 10]]
- [[認証と認可]]
- [[Web脆弱性の実装防御]]
- [[Supabase RLS]]
