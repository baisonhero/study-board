---
tags: [inbox, learning, security]
created: 2026-05-05
aliases:
  - A07
  - Identification and Authentication Failures
  - 認証不備
  - セッション管理の不備
---

# A07 Identification and Authentication Failures

> [!summary]
> [[OWASP Top 10]] 2021年版で **7位**（旧: A02 Broken Authentication）。「**誰か**」を確認する仕組み（認証）と、その状態を維持する仕組み（セッション）の不備。パスワード総当たり、クレデンシャルスタッフィング、セッション固定、JWT検証漏れなどが含まれる。**自前実装は地雷**で、OAuth/OIDC + 既存のフレームワーク機能を使うのが鉄則。

## どういう脆弱性か

### 認証の弱さ

- 弱いパスワードを許す（短い／よく使われる文字列）
- ブルートフォース対策なし（レート制限・アカウントロック）
- クレデンシャルスタッフィング対策なし（漏洩済みパスワードを再利用させる）
- MFA を提供していない／必須化していない
- パスワードリセットフローの欠陥（[[A04]]とも関連）
- アカウント列挙が可能（メアド有無で挙動が変わる）

### セッションの弱さ

- セッションIDが推測可能（`Math.random()`）
- ログイン後にセッションIDを再生成しない（**セッション固定攻撃**）
- ログアウトしてもセッションが無効化されない
- 長すぎるセッション有効期限
- Cookie 属性不備（`Secure`、`HttpOnly`、`SameSite`）
- JWT の検証ミス（署名なし許可、`alg: none`、別鍵での検証）

## 攻撃例

### クレデンシャルスタッフィング

```
過去の漏洩DB（Have I Been Pwned で数百億件公開）から
email + password の組を取得
↓
他サービスのログインAPIに大量投入
↓
パスワード使い回しユーザーがログインされてしまう
```

レート制限と漏洩パスワードチェックがないと完全に通る。

### セッション固定

```
1. 攻撃者がアプリにアクセスして自分のセッションID `ABC` を取得
2. 被害者に「これでログインしてください」とID `ABC` 付きURLを送る
3. 被害者がログイン → サーバが ABC をログイン済みとして紐付け
4. 攻撃者が ABC で被害者として操作
```

→ 防御: **ログイン成功時にセッションIDを再発行**。

### JWT `alg: none` の許容

```javascript
// 危険: 署名検証なしのデコード
const payload = jwt.decode(token)

// 危険: alg: none を許容
jwt.verify(token, secret, { algorithms: ['HS256', 'none'] })
```

攻撃者は `alg: none` のトークンを生成して送れる。

### タイミング攻撃でのアカウント列挙

```
POST /login {email, password}
→ 存在しないユーザー: 50ms で "User not found"
→ 存在するユーザー(password間違い): 200ms で "Invalid password"
```

差分でメアド存在判定 → 標的フィッシングへ。

## 防御策

### 1. 自前実装しない

OAuth 2.0 / OIDC を使い、認証は **Auth0 / Clerk / Supabase Auth / Firebase Auth / NextAuth.js** に任せる。「ログイン機能をゼロから書く」は基本的にやらない。

### 2. 強いパスワード方針（NIST SP 800-63B 準拠）

- **最小8文字以上、長さ重視**（複雑性ルールよりpassphrase推奨）
- パスワード履歴の強制ローテはしない（推奨されなくなった）
- **漏洩パスワードチェック**（Have I Been Pwned API、`k-anonymity` で照会）
- 1Password / Bitwarden 等のパスワードマネージャ前提

### 3. MFA を必須化（少なくとも管理者は）

- TOTP (Authenticator アプリ)
- WebAuthn / Passkey（推奨。フィッシング耐性あり）
- SMS MFA は弱い（SIMスワップで奪取可能）

### 4. レート制限とアカウント保護

- IPベース／アカウントベースのレート制限
- 失敗連続でCAPTCHA、または一時的なディレイ
- 異常検知（突然の海外ログイン等）でアラート＋強制再認証

### 5. セッションのベストプラクティス

```
Cookie: session=...; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=...
```

- **ログイン成功時にセッションIDを再生成**
- ログアウトでサーバ側もセッション破棄（DB から削除）
- アイドルタイムアウトと絶対タイムアウトの併用
- 重要操作は再認証 (sudo mode) を要求

### 6. JWT の正しい扱い

- 必ず `verify()` で **アルゴリズム明示**: `algorithms: ['RS256']`
- `alg: none` を **絶対許可しない**
- 署名鍵をローテーション可能に（kid ヘッダ + JWKS）
- 短い有効期限 + リフレッシュトークンの組み合わせ
- センシティブ情報を payload に入れない（base64で誰でも読める）

### 7. 同じレスポンス・同じレイテンシで返す

```javascript
// 安全: メアド有無に関わらず同じメッセージ・同じ処理時間
"メールアドレスかパスワードが違います"
```

## 検出手段

- **[[DAST]]** — ログインフォームのレート制限テスト、セッションCookie属性の検査
- **[[SAST]]** — JWTの危険APIの利用検知
- **手動ペンテスト** — ロジック起因のフローはツールが苦手
- **[[OWASP ASVS]] V2/V3** — Authentication / Session Management 要件
- **Have I Been Pwned API** — 漏洩パスワードチェック

## 参考事例

- **Twitter (2022)** — CVE-2022-1645 でメアドから紐付くアカウント特定が可能だった（列挙）
- **Zoom (2020)** — クレデンシャルスタッフィングで50万件のアカウントがダークウェブで売られた
- **Reddit (2018)** — 2FA に SMS を使っていて SIM スワップで管理者アカウント奪取
- **多数の "Sign in with Apple" バグ** — JWT検証不備で他人になりすませた事例

## Next.js / Supabase での落とし穴

- **NextAuth.js** — Session strategy `database` vs `jwt` の選択を理解する。JWTだとサーバ側の即時失効が難しい
- **Supabase Auth の `service_role`** — 絶対にクライアントへ露出させない（RLS をバイパスする）
- **Cookie の `SameSite` 設定** — 認証Cookieは `Lax` 以上、決済等は `Strict` も検討
- **Server Actions の認可** — `auth.uid()` チェックを毎回入れる（[[A01]]とも関連）

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[OWASP Top 10]]
- [[認証と認可]]
- [[Web脆弱性の実装防御]]
- [[OWASP API Security Top 10]]

## 出典

- [OWASP Top 10:2021 A07 Identification and Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/)
- [OWASP Cheat Sheet: Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Cheat Sheet: Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html)
