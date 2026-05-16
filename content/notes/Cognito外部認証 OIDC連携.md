---
tags: [done, learning, security, aws]
created: 2026-05-12
aliases:
  - Cognito to Cognito OIDC
  - Cognito外部認証
  - Cognito OIDC連携
---

# Cognito外部認証 — Cognito を OIDC IdP として連携する

> [!summary]
> アプリがアクセスする「フロント側 Cognito User Pool」に対して、別アカウント・別プロジェクトの「バックエンド側 Cognito User Pool」を **OIDC IdP として連携** する構成。社内認証基盤の Cognito を SSO の中核に置き、各アプリ独自の Cognito から OIDC ログインに飛ばす運用に使う。**コールバックURLの設定が独特**（後ろのCognitoに、前のCognitoのドメインを書く）でハマりやすいので要注意。

## ユースケース

- 既に組織内に「認証基盤として動いてる中央 Cognito User Pool」がある
- 新規アプリは独自に Cognito User Pool を持つが、ユーザー自体は中央側のものを再利用したい
- SAML や Auth0 ではなく **Cognito 同士で OIDC 連携** したい（同じ AWS マネージドサービスで統一）

## 構成図

```
[ユーザー] 
   │ ① アプリにアクセス
   ▼
[Webアプリ (Next.js等)]
   │ ② サインインボタン → Hosted UI へ遷移
   ▼
┌─────────────────────────────────────┐
│ User Pool A (アプリ側 / フロント)      │
│  - アプリの App Client が紐づく        │
│  - IdP として "User Pool B" を OIDC登録 │
└─────────────────────────────────────┘
   │ ③ "Continue with 社内SSO" 選択
   │   → User Pool B の Hosted UI へリダイレクト
   ▼
┌─────────────────────────────────────┐
│ User Pool B (バックエンド / 認証基盤)  │
│  - 実際にユーザーのID/PWを持つ          │
│  - App Client にコールバックURLとして    │
│    **User Pool A のドメイン** を登録 ★  │
└─────────────────────────────────────┘
   │ ④ ユーザーが ID/PW 入力 → 認証成功
   │ ⑤ User Pool A の /oauth2/idpresponse にコールバック
   ▼
[User Pool A] が ID Token を発行 → アプリへ返す
```

## ★ コールバックURLの罠（最重要）

OIDC連携で **どちらの Cognito ドメインを使うか間違える** ハマりポイント。

直感的には「認証する側 (User Pool B)」が「アプリ側 (User Pool A)」を信頼するのだから、User Pool A の登録時に B のドメインを書きそうになる。**逆**。

### 正解の設定

**User Pool B（バックエンド／認証基盤）の App Client 設定**：

- 「コールバックURL（許可されたコールバックURL）」に、**User Pool A のドメイン** を登録：
  ```
  https://{user-pool-a-domain}.auth.{region}.amazoncognito.com/oauth2/idpresponse
  ```

### なぜか

OIDC のフロー上：
1. ユーザーが User Pool A の Hosted UI で「外部IdP（B）でログイン」を選ぶ
2. User Pool A が、自分（A）を Relying Party として、User Pool B に認可コードを取りに行く
3. User Pool B は認証成功後、認可コードを **A のドメインの `/oauth2/idpresponse` エンドポイント** に投げ返す
4. A はそのコードで B から ID Token を取得し、A 内部のユーザーに紐付けて、最終的にアプリの App Client にトークンを発行する

つまり **User Pool A が「B から見た OAuth クライアント」** なので、B の App Client 設定で許可するコールバック URL は **A 側のドメイン**になる。

## 設定手順（要点）

### Step 1: User Pool B（認証基盤）側

1. App Client を1つ用意
2. その App Client に以下を設定：
   - Allowed OAuth Flows: Authorization code grant
   - Allowed OAuth Scopes: `openid`, `profile`, `email`（最低）
   - **Callback URL: `https://{pool-a-domain}.auth.{region}.amazoncognito.com/oauth2/idpresponse`** ★
3. App Client ID と App Client Secret を控える
4. Cognito Domain を有効化（`pool-b-domain.auth.region.amazoncognito.com` 形式）

### Step 2: User Pool A（アプリ側）側

1. Identity Provider → Add identity provider → **OpenID Connect (OIDC)** を選択
2. 設定値：
   - Provider name: 自由（例 `BackendSSO`）
   - Client ID: Step 1 で控えた Pool B の App Client ID
   - Client Secret: 同上
   - Authorize scope: `openid profile email`
   - **Issuer URL**: `https://cognito-idp.{region}.amazonaws.com/{pool-b-user-pool-id}`
   - Attribute mapping: `email` → `email` 等、必要なクレームをマッピング
3. App Client（アプリが使うやつ）の設定で、`Identity Providers` に作った `BackendSSO` を追加
4. App Client にアプリ側のコールバックURL（例 `https://app.example.com/callback`）を登録

### Step 3: アプリ側（Webアプリ）

通常通り User Pool A の Hosted UI を呼ぶ。`identity_provider=BackendSSO` を URL パラメータに付けると Pool B のログインに直接飛ばせる（Hosted UI に「Continue with 社内SSO」ボタンを置く運用）。

## 設定例（URL）

| 項目 | 値 |
|---|---|
| Pool A Domain | `app-pool.auth.ap-northeast-1.amazoncognito.com` |
| Pool B Domain | `org-sso.auth.ap-northeast-1.amazoncognito.com` |
| Pool B の Callback URL（A 側を指す） | `https://app-pool.auth.ap-northeast-1.amazoncognito.com/oauth2/idpresponse` |
| アプリのコールバック（A の App Client 設定） | `https://app.example.com/callback` |

## ハマりパターン

1. **コールバックURLを Pool B 自身のドメインで登録 → 認証後404**：上記の通り、A側ドメインで登録する
2. **Issuer URL の userPoolId を間違える**：Pool B の Pool ID を入れる
3. **Pool B 側で Attribute Mapping を忘れる**：A 側で取れるユーザー情報が空になる
4. **Pool A のScope を狭めすぎる**：`openid` 最低必要、`email` ないとマッピングが空になる
5. **Pool B 側の Cognito Domain を未設定**：そもそも Hosted UI 出ない

## 出典・参考

- Qiita: [Cognito→Cognito OIDC連携の構成方法](https://qiita.com/wanwan_fox/items/86a75ec004331ae82ee2)
- AWS Docs: [Cognito Federation - Adding social, SAML, OIDC, or developer identity providers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation.html)
- AWS Docs: [User pool federation endpoints `/oauth2/idpresponse`](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html)

## 関連MOC

- [[MOC AWS]]
- [[MOC Security]]
- [[MOC Learning]]

## 関連ノート

- [[セキュリティ識別子の体系]]
- [[セキュリティ標準とフレームワーク]]
