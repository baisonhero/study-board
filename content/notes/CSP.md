---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Content Security Policy
---

# CSP

> [!summary]
> **CSP (Content Security Policy)** は Web アプリケーションが ブラウザに対して「**読み込み可能なリソースの出所**」を宣言する HTTP ヘッダ。`script-src 'self' https://cdn.example.com` のように指定すると、それ以外のドメインからのスクリプト読み込みを **ブラウザがブロック** する。XSS ([[A03 Injection]] サブカテゴリ) の被害を大幅に縮減する重要な防御策で、設定の有無で攻撃成功率が桁違いに変わる。

## なぜ重要か

XSS でスクリプトを注入されても、CSPが厳格なら：

- 攻撃者ドメインからの外部スクリプト読み込みが失敗
- インラインスクリプト (`<script>alert(1)</script>`) が実行されない (`'unsafe-inline'` 不許可時)
- `eval()` や `Function()` が動かない (`'unsafe-eval'` 不許可時)

→ 攻撃が **画面に何か出すだけ** で終わり、cookie 窃盗・操作実行までは届かない。

## 主要ディレクティブ

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-RANDOM' https://cdn.example.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  report-uri /csp-report;
```

- `default-src`: 個別指定がない時のフォールバック
- `script-src`: JSの読み込み源
- `style-src`: CSSの読み込み源
- `img-src` / `font-src` / `connect-src` / `media-src` / `frame-src`: 各リソースタイプ
- `frame-ancestors`: 自サイトを iframe に入れていいドメイン (X-Frame-Options 後継)
- `report-uri` / `report-to`: 違反レポートの送信先

## nonce / hash ベースの安全な書き方

`'unsafe-inline'` を許すと CSP の意味が大幅に薄れる。代替手段：

```html
<!-- サーバーがリクエストごとに nonce を発行 -->
<script nonce="abc123random">
  // ここはCSPで許可される
</script>
```

CSPヘッダ側で `'nonce-abc123random'` を許可。動的に値が変わるため攻撃者は推測できない。

## strict-dynamic と CSP3

`'strict-dynamic'` を使うと、nonceで信頼されたスクリプトが動的に追加した子スクリプトも信頼の連鎖で許可される。SPA / モダンフレームワークと相性が良い。

## Report-Only モード

```http
Content-Security-Policy-Report-Only: <policy>
```

実際にはブロックせず、違反だけ報告。**本番投入前に1〜2週間 Report-Only で観察** → ノイズを潰してから強制モードへ、というのが標準運用。

## よくある罠

- `'unsafe-inline'` を許してしまい意味がなくなる
- インラインの `onclick` 属性を全部書き換える必要がある (CSP は HTML 属性内のJSも禁じる)
- サードパーティウィジェット (Stripe, Intercom, Google Analytics 等) の URL を `script-src` に追記する必要がある
- 違反レポートが大量に届く → ノイズ分類が必須

## 出典

- MDN CSP: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- W3C CSP3: https://www.w3.org/TR/CSP3/
- Google CSP Evaluator: https://csp-evaluator.withgoogle.com/

## 関連MOC

- [[MOC Security]]

## 関連ノート

- [[A03 Injection]]
- [[A05 Security Misconfiguration]]
- [[OWASP Top 10]]
- [[Web脆弱性の実装防御]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
