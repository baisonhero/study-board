---
tags: [inbox, learning, security]
created: 2026-04-26
aliases:
  - XSS
  - CSRF
  - SSRF
  - CSP
  - CORS
  - Webセキュリティ実装
---

# Web脆弱性の実装防御

> [!summary]
> [[OWASP Top 10]] で名前を知った状態から「実装でどう防ぐか」へ降りる。XSS、CSRF、SSRF、Open Redirect、CORS設定ミス、Subdomain Takeover、CSP の正しい書き方。Next.js特有の落とし穴も含む。

## XSS（Cross-Site Scripting）

ユーザー入力がブラウザでスクリプトとして実行されてしまう脆弱性。3種類：

- **Reflected XSS** — URLパラメータ等が即座に出力に反映される
- **Stored XSS** — DBに保存された悪意ある入力が他ユーザーに表示される
- **DOM-based XSS** — クライアントJSが`innerHTML`等で安全でない処理をする

防御の原則：

1. **出力時にコンテキストに合わせてエスケープ**（HTML / 属性 / URL / JS / CSS）
2. ReactやVueは**自動エスケープ**するが、`dangerouslySetInnerHTML` / `v-html` で抜ける
3. **CSP（Content Security Policy）を補助層として併用**

### CSP の書き方

最小限から始める：

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{ランダム}'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

Next.jsで `unsafe-inline` を避けるには nonce を middleware で発行する。`unsafe-eval` も避ける。

## CSRF（Cross-Site Request Forgery）

被害者のブラウザに勝手にリクエストを送らせる攻撃。ログイン中Cookieが自動付与されて成立する。

防御：

1. **SameSite cookie 属性を `Lax` 以上に**（モダンブラウザのデフォルト）
2. **CSRFトークン**を状態変更操作に必須化（hiddenフィールド or カスタムヘッダ）
3. **Bearer Token方式（Authorization ヘッダ）はCookieに依存しないのでCSRF発動しない** — ただしXSSでトークン盗まれるリスクは別途

> [!info] SameSite=Lax だけで十分か？
> ほとんどのケースでは十分だが、トップレベルナビゲーションでGETリクエストが状態変更する設計だと防げない。**状態変更はPOST/PUT/DELETE/PATCH限定**にする原則を徹底すれば、Lax + 一般的な対策でほぼ封じられる。

## SSRF（Server-Side Request Forgery）

サーバが攻撃者の指示で内部リソース（メタデータエンドポイント、内部API）にアクセスしてしまう。クラウド時代に致命的（AWS IMDSv1からクレデンシャル盗取の事例）。

防御：

- 外部URLを受け取って fetch する機能には**ホスト/IPアロウリスト**
- 内部レンジ（10.0.0.0/8、169.254.169.254 等）を**ブロックリスト**
- AWSは必ず **IMDSv2** に強制（`HttpTokens: required`）
- リダイレクト追跡を制限、最大ホップ数指定

## Open Redirect

`?next=` パラメータでリダイレクト先を指定できる設計が、攻撃者URLにリダイレクトされる経路に。フィッシング元になる。

防御：

- 内部パスのみ許可（先頭が `/` で外部URLでないこと）
- ドメインアロウリスト
- リダイレクト先を識別子化して内部マップで解決

## CORS設定ミス

「とりあえず動かす」で `Access-Control-Allow-Origin: *` + `Allow-Credentials: true` を付けると致命傷。

正しい設定：

- 信頼できるOriginを**個別に指定**
- credentials を含むリクエストでは `*` は使えない（ブラウザが拒否する）
- preflightキャッシュ時間（max-age）を適切に

## Subdomain Takeover

DNSは残っているが裏のサービス（HerokuアプリやS3バケット等）が削除済みのドメインを攻撃者が乗っ取る。CNAMEが指すサービスを攻撃者が新規取得すると、被害者ドメインで任意のコンテンツを配信できる。

防御：

- DNSレコードの定期棚卸し（dangling CNAMEの検出）
- 廃止サービスのDNS削除をリリース手順に組み込む

## Next.js 特有の落とし穴

- **Server Actions** — 認可チェックを忘れがち。クライアントから直接呼べる前提で必ず `auth.uid()` を確認
- **API Routes / Route Handlers** — 同上
- **`Image` コンポーネント** — `remotePatterns` を緩く設定するとSSRFリスク
- **環境変数の `NEXT_PUBLIC_` プレフィックス** — クライアントバンドルに混入するので、シークレットは絶対に付けない

## OWASP Top 10 との対応

- **A01 Broken Access Control** — Server Actions / API Routes の認可漏れ
- **A03 Injection** — XSS含む
- **A05 Security Misconfiguration** — CORS、CSPの誤設定
- **A10 SSRF** — そのまま

## 学習リソース

- OWASP Cheat Sheet Series（XSS、CSRF、CSP、各々独立したチートシート）
- PortSwigger Web Security Academy（無料、ハンズオンで学べる最高品質）
- [[OWASP Juice Shop]] で実際に攻撃を試す

## 関連MOC

- [[MOC Security]]
- [[MOC Learning]]

## 関連ノート

- [[セキュリティ学習ロードマップ]]
- [[OWASP Top 10]]
- [[認証と認可]]
- [[OWASP Juice Shop]]
- [[CSP]]
