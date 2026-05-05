---
tags: [inbox, learning, security]
created: 2026-05-05
aliases:
  - A01
  - Broken Access Control
  - 認可不備
  - IDOR
---

# A01 Broken Access Control

> [!summary]
> [[OWASP Top 10]] 2021年版で **1位**。認可制御の不備により、本来アクセスできないリソース・機能に到達できてしまう脆弱性カテゴリ。IDOR、垂直/水平権限昇格、強制ブラウジングなどを含む。94%のアプリで何らかの形で確認されたとされ、自動検知が苦手なため[[DAST]]や手動ペンテストが要となる。

## どういう脆弱性か

「認証（誰か）」は通っているが「認可（何ができるか）」のチェックが漏れている状態。代表的なパターン：

- **IDOR (Insecure Direct Object Reference)** — URLやペイロードのIDを書き換えるだけで他人のリソースにアクセスできる
- **水平権限昇格** — 同じロールの別ユーザーのデータが見える
- **垂直権限昇格** — 一般ユーザーが管理者機能にアクセスできる
- **強制ブラウジング** — `/admin` のような未公開URLを直接叩くとアクセスできる
- **メタデータ改ざん** — JWTやCookieのロール情報を書き換えて昇格
- **CORS設定ミス** — 信頼できないOriginからAPIが叩ける

## 攻撃例

### IDOR の典型

```
# 自分の注文を見る
GET /api/orders/12345
Authorization: Bearer <自分のトークン>

# IDを変えるだけで他人の注文が取れる
GET /api/orders/12346
Authorization: Bearer <自分のトークン>
→ 200 OK（隣のユーザーの注文データ）
```

### 強制ブラウジング

```
GET /admin/users           ← UIに出ないが直接叩くと閲覧できる
GET /api/internal/export   ← 認可チェックなし
```

### JWT の改ざん

```javascript
// クライアントから送られるJWT payload
{ "sub": "user-123", "role": "user" }

// 攻撃者が勝手に書き換えて再送
{ "sub": "user-123", "role": "admin" }

// サーバ側で署名検証してなければ通ってしまう
```

## 防御策

### 1. Deny by default

「明示的に許可されていない操作はすべて拒否」を基本に。許可リスト方式（allowlist）で実装する。

### 2. すべての操作で「このリソースは要求者のものか」を確認

```javascript
// 危険
const order = await db.order.findById(req.params.id)
return res.json(order)

// 安全
const order = await db.order.findById(req.params.id)
if (order.userId !== req.user.id) return res.status(404).end()
return res.json(order)
```

存在しないリソースと権限がないリソースは **404で統一** すると情報漏洩を抑えられる（403を返すと「あるが見えない」が判明する）。

### 3. DBレベルで強制（Supabase RLS）

アプリ層のチェックを忘れてもDBが弾く構造にすると堅牢になる：

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);
```

### 4. JWT は必ずサーバ側で署名検証

`jwt.verify()` を使い、`jwt.decode()` だけで信頼しない。アルゴリズムは `none` を許可しない。

### 5. ロールチェックは中央集権化

ミドルウェアやデコレータで一箇所にまとめ、各エンドポイントに散らばらせない。

```javascript
app.get('/admin/users', requireRole('admin'), handler)
```

### 6. CORS は最小限のOriginだけ許可

`Access-Control-Allow-Origin: *` と `Allow-Credentials: true` の組み合わせは禁止。

## 検出手段

- **[[DAST]]** — 自動的にIDをローテーションして他人のデータ取得を試行
- **手動ペンテスト** — ロジックエラーは自動ツールでは検知困難
- **コードレビュー** — 認可チェックの抜け漏れ
- **[[OWASP ASVS]]** — V4 Access Control Verification Requirements

## 参考事例

- **Facebook "View As" バグ (2018)** — 任意ユーザーになりすましてアクセスできた
- **GitLab IDOR 多数** — HackerOne のレポートで公開
- **米国 First American Financial (2019)** — URLの番号を書き換えるだけで8.85億件の文書が閲覧可能だった

## Next.js / Supabase での落とし穴

- **Server Actions** — クライアントから直接呼べる前提で `auth.uid()` を必ず確認
- **API Routes** — 認可ミドルウェア未適用のままデプロイしがち
- **Supabase Anon Key** — RLS未設定だと全データアクセス可能

詳細は [[Web脆弱性の実装防御]] と [[認証と認可]] を参照。

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[OWASP Top 10]]
- [[OWASP API Security Top 10]]
- [[認証と認可]]
- [[Web脆弱性の実装防御]]
- [[DAST]]
- [[アプリケーションセキュリティ ツール分類]]

## 出典

- [OWASP Top 10:2021 A01 Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [OWASP Cheat Sheet: Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
