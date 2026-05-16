---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Passkeys
  - パスキー
---

# Passkey

> [!summary]
> **Passkey (パスキー)** は FIDO Alliance と W3C が共同で推進する**パスワードレス認証**の総称。WebAuthn 仕様に基づき、公開鍵暗号で認証する。Apple / Google / Microsoft がOS・ブラウザ・クラウド同期 (iCloud Keychain / Google Password Manager / Windows Hello) を統一して提供し、2022年から本格普及した。フィッシング耐性が本質的に高く、[[A07 Identification and Authentication Failures]] の主要な対策として注目される。

## 何が違うか

従来のパスワード認証は **共有秘密** (サーバーとユーザーが同じ文字列を知っている) のため、漏洩・フィッシング・リスト攻撃に弱い。Passkey は **公開鍵暗号** に切り替える：

- 秘密鍵は端末 (Secure Enclave / TPM / Android Keystore) に閉じる
- サーバーは公開鍵だけ持つ → 漏洩しても無意味
- 認証はサーバーから来た **challenge** に秘密鍵で署名 → サーバーが公開鍵で検証
- ドメインバインディング: 別ドメインに鍵は使われない → **フィッシング不可**

## ユーザー体験

1. 初回登録: 「パスキーを作成」ボタン → 端末がFace ID / Touch ID / PIN で確認 → 鍵ペア生成・公開鍵をサーバーに登録
2. 再ログイン: 「パスキーで続行」 → 生体認証だけでログイン完了。パスワード入力なし
3. クラウド同期: iCloud / Google にエンドツーエンド暗号化で同期、端末紛失でも別の自分の端末から復帰可
4. クロスデバイス: PCログイン時に「QR読み取り→スマホで承認」も可能 (Hybrid Transport)

## 技術スタック

- **WebAuthn (W3C)**: ブラウザJS API
- **CTAP2 (FIDO)**: ブラウザ ↔ 認証器 (端末や物理セキュリティキー) のプロトコル
- **公開鍵暗号**: ES256 (ECDSA over P-256) / EdDSA / RS256
- **Attestation**: 認証器の真正性証明 (オプション、企業向け)

## サーバー実装

```js
// Express + @simplewebauthn/server 例
const options = generateRegistrationOptions({
  rpName: "MyApp",
  rpID: "myapp.com",
  userID: user.id,
  userName: user.email,
  authenticatorSelection: { residentKey: "preferred" },
});
res.json(options);
```

各言語に WebAuthn ライブラリが揃っている（Node, Go, Rust, Python, Java, Ruby）。

## TOTP / SMS との比較

| 認証手段 | フィッシング耐性 | UX | 端末紛失復旧 |
|---|---|---|---|
| パスワード | × | △ | ◯ |
| SMS OTP | × (SIMスワップ) | △ | △ |
| TOTP (Authenticator) | × (ユーザー入力するため) | × | × (バックアップなし) |
| **Passkey** | ◯ | ◯ | ◯ (クラウド同期) |

## 導入時の論点

- **既存のパスワードからの併走**: 段階的にPasskeyへ移行する設計
- **アカウント復旧フロー**: 全端末紛失時のリカバリ
- **クライアント要件**: iOS 16+, macOS 13+, Android 9+ + Google Play Services, Windows Hello, Chrome/Safari/Edge/Firefox最新版
- **企業ユースケース**: パスキー + デバイスバインディング、SSO IdP連携 (Okta, Auth0, Entra ID)

## 出典

- FIDO Alliance: https://fidoalliance.org/passkeys/
- WebAuthn: https://www.w3.org/TR/webauthn-3/
- passkeys.dev: https://passkeys.dev/

## 関連MOC

- [[MOC Security]]
- [[MOC Product]]

## 関連ノート

- [[認証と認可]]
- [[A07 Identification and Authentication Failures]]
- [[認証と認可の違い]]
- [[Cognito外部認証 OIDC連携]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
