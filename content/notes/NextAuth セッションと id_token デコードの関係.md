---
tags: [done, learning, auth, web, nextauth]
created: 2026-05-21
aliases:
  - session.user.email の中身
  - NextAuth id_token デコード
source: chat-derived
---

# NextAuth セッションと id_token デコードの関係

> [!summary]
> `session.user.email` は [[id_token]] を毎回デコードしているわけではなく、サインイン時に一度デコード・検証された結果を NextAuth 独自のセッション（[[JWT]] or DB）から読み出している。id_token デコードは「サインインの1回だけ」。

関連トピック: [[NextAuth]] / [[Auth.js]] / [[OIDC]] / [[OAuth 2.0]] / [[id_token]] / [[JWT]] / [[JWKS]]

## 1. 結論（短く）

| 質問 | 答え |
|---|---|
| `session.user.email` は id_token をデコードした結果？ | **間接的にはYes**（サインイン時の1回） |
| 毎リクエストで id_token を再デコードしている？ | **No**。NextAuth 独自セッションから読むだけ |
| プロバイダの id_token と NextAuth のセッション JWT は同じ？ | **別物**。署名鍵も発行者も別 |

## 2. サインイン時に裏で起きていること（OIDC プロバイダ）

[[Google]] / [[Auth0]] / [[Okta]] など [[OIDC]] 準拠プロバイダの場合：

1. ユーザーがプロバイダで認証
2. NextAuth がコールバックで `code` を受け取り、トークンエンドポイントに交換リクエスト
3. プロバイダから `access_token` / `id_token` / `refresh_token` が返る
4. NextAuth 内部の [[openid-client]] が **`id_token` の署名を [[JWKS]] で検証** + ペイロードをデコード
5. デコードされたクレーム（`email` / `name` / `picture` / `sub` / `email_verified` など）が `profile()` コールバックに渡る
6. `profile()` の戻り値が「user オブジェクト」として NextAuth の世界に取り込まれる

```typescript
// 典型的な provider 設定
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // ↓ ここに来る profile は id_token デコード後のクレーム
  profile(profile) {
    return {
      id: profile.sub,
      email: profile.email,
      name: profile.name,
      image: profile.picture,
    }
  },
})
```

## 3. セッション戦略の違い

NextAuth がデコード結果をどう保管するかは `session.strategy` で変わる。

### 3.1 `strategy: "jwt"`（デフォルト）

- user オブジェクトが **NextAuth 独自の JWT** にエンコードされる
- 署名鍵は `NEXTAUTH_SECRET`（プロバイダの公開鍵ではない）
- HTTP-only クッキー `next-auth.session-token` に格納
- **プロバイダの id_token とは完全に別物の JWT**

### 3.2 `strategy: "database"`

- user は DB の `users` テーブル、セッションは `sessions` テーブルに保存
- クッキーには不透明なセッション ID だけ
- アダプタ（[[Prisma]] / [[Drizzle]] / etc.）経由で永続化

## 4. リクエスト時の動き

`getServerSession()` や `useSession()` が呼ばれた時：

```
[Request]
   ↓
[NextAuth] クッキー読み取り
   ↓
strategy: "jwt"      → NEXTAUTH_SECRET で署名検証 + デコード
strategy: "database" → セッションID で DB lookup
   ↓
[session callback] 整形
   ↓
session.user.email を返す
```

**この段階でプロバイダの id_token は出てこない**。デコード対象は NextAuth が自分で発行した JWT、または単なる DB レコード。

## 5. OAuth 2.0 のみのプロバイダの場合

[[GitHub]] のように `id_token` を発行しない純粋な [[OAuth 2.0]] プロバイダでは：

- id_token デコードは存在しない
- 代わりに `access_token` を使って **userinfo エンドポイント**（GitHub なら `/user`）を叩く
- レスポンスの JSON が `profile()` に渡る
- 以降のセッション格納〜参照の流れは OIDC と同じ

つまり「サインイン時に一度プロバイダから user 情報を取って、NextAuth 独自セッションに保存」という骨格は共通。デコード対象が **JWT か JSON か** だけが違う。

## 6. ハマりポイント

- `session.user` のフィールドを増やしたい → `callbacks.jwt` と `callbacks.session` の両方で受け渡しが必要（JWT 戦略の場合）
- プロバイダの id_token を後段で使いたい → `callbacks.jwt` で `token.idToken = account.id_token` のように明示退避する必要あり。**デフォルトでは捨てられる**
- email が `null` になる場合 → プロバイダのスコープ設定漏れ（OAuth scope に `email` / `profile` 入ってない）、または `email_verified: false` で profile callback が弾いている
- [[Auth.js]] v5（次世代）でも基本構造は同じ。`authConfig` の書き方と一部 API 名が変わっただけ

## 関連MOC

- [[MOC Learning]]
- [[MOC Security]]

## 関連ノート

- [[OIDC]]
- [[OAuth 2.0]]
- [[JWT]]
- [[id_token]]
- [[OAuth 認証フローと Cognito クロスアプリ連携]] — Authorization Code Flow とトークン種別の整理
- [[Cognito OAuth 実装と JWT 検証リファレンス]] — Cognito 側での id_token / access_token 検証
