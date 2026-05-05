---
tags: [inbox, learning, security]
created: 2026-05-05
aliases:
  - A02
  - Cryptographic Failures
  - 暗号化の失敗
  - Sensitive Data Exposure
---

# A02 Cryptographic Failures

> [!summary]
> [[OWASP Top 10]] 2021年版で **2位**。2017年版の "Sensitive Data Exposure" がリネームされた。「機密データが漏れた」という症状ではなく **「暗号化の失敗（原因）」** に焦点を当てた命名になった。TLS未使用、弱いアルゴリズム、平文保存、鍵管理の不備などを含む。

## どういう脆弱性か

機密データ（PII、認証情報、決済情報、医療情報、企業秘密）の取り扱いで暗号が適切に使われていない／そもそも使われていない状態。代表的なパターン：

- **転送時**: HTTP通信、TLS設定が古い／弱い、証明書検証無効
- **保存時**: 平文DB保存、可逆暗号でパスワード保存、ハードディスク非暗号化
- **ハッシュの選択**: MD5、SHA1、SHA256（ソルトなし、ストレッチなし）でパスワード保存
- **鍵管理**: ハードコード、リポジトリにコミット、ローテーションなし
- **乱数**: `Math.random()` などCSPRNG ではない関数でトークン生成
- **アルゴリズム**: ECB モード、CBC モードでHMAC無し（パディングオラクル）

## 攻撃例

### 平文パスワードの漏洩

```sql
-- 危険: パスワードをそのままINSERT
INSERT INTO users (email, password) VALUES ('a@b.com', 'pass1234');

-- DB漏洩 → 全ユーザーのパスワードが他サービスでも使われる（パスワード使い回し攻撃）
```

### MD5/SHA1 ハッシュの破られやすさ

```
MD5("password") = 5f4dcc3b5aa765d61d8327deb882cf99
```

レインボーテーブルで瞬時に逆引き可能。GPUで秒間数十億回の計算ができる現代では、ソルトなしの高速ハッシュは無防備に近い。

### `Math.random()` でのトークン生成

```javascript
// 危険: 予測可能
const resetToken = Math.random().toString(36).slice(2)

// 安全: CSPRNG
import { randomBytes } from 'crypto'
const resetToken = randomBytes(32).toString('hex')
```

## 防御策

### 1. パスワードは KDF（Key Derivation Function）でハッシュ

| アルゴリズム | 推奨度 | メモ |
|---|---|---|
| **Argon2id** | ★★★ | 現行の推奨。PHC（Password Hashing Competition）勝者 |
| **bcrypt** | ★★ | 実績豊富、cost ≥ 12 |
| **scrypt** | ★★ | メモリハード |
| PBKDF2 | △ | FIPS準拠が必要なときに |
| SHA256/MD5 | ✗ | パスワード保存に使ってはいけない |

```javascript
import { hash, verify } from 'argon2'
const hashed = await hash(password, { type: argon2id })
const ok = await verify(hashed, inputPassword)
```

### 2. TLS は 1.2 以上、できれば 1.3

- HSTS ヘッダで HTTP を常に HTTPS にリダイレクト
- 証明書は Let's Encrypt 等で自動更新
- 中間CAを正しく配信
- 古いcipher（RC4、3DES）は無効化
- `SSLLabs` で A 評価を目標に

### 3. 機密データは保存時に暗号化（at-rest）

- DB透過暗号化（AWS RDS の Storage Encryption など）
- アプリ層の暗号化（決済情報、医療情報など特に機微なデータ）
- AWS KMS / GCP KMS で鍵管理

### 4. 鍵をコードに書かない

- `.env` で開発用、本番は AWS Secrets Manager / Parameter Store
- リポジトリへのコミット防止に `git-secrets` / `gitleaks` を CI 導入
- ローテーション計画を持つ

### 5. CSPRNG を使う

| 言語 | 安全な乱数 |
|---|---|
| Node.js | `crypto.randomBytes()` / `crypto.randomUUID()` |
| Python | `secrets.token_hex()` / `secrets.token_urlsafe()` |
| Go | `crypto/rand` |
| Java | `SecureRandom` |

### 6. 暗号は「使う」、設計しない

独自暗号は十中八九壊れる。標準ライブラリの高レベルAPI（`libsodium`、`cryptography.fernet` 等）を使う。AES-GCM や ChaCha20-Poly1305 のような **AEAD** モードを選ぶ。

## 検出手段

- **[[SAST]]** — 弱い暗号API利用、ハードコード鍵を検知
- **コードレビュー** — ハッシュアルゴリズムの選択、鍵管理
- **SSL Labs / testssl.sh** — TLS設定の点検
- **gitleaks / trufflehog** — シークレット混入検知

## 参考事例

- **Adobe (2013)** — 1.5億件の認証情報漏洩。3DES のECBモードで暗号化されていた（パスワードヒントが平文だったため復号できてしまった）
- **LinkedIn (2012)** — SHA1ノーソルトで6.5百万件のハッシュ漏洩 → ほぼ全件解読
- **Equifax (2017)** — 暗号化未実施の機微データを含む1.47億件流出（実際は[[A06]]も絡む）

## Next.js / Supabase での落とし穴

- **`NEXT_PUBLIC_*` プレフィックス** — クライアントバンドルに混入。秘密鍵を絶対に入れない
- **Supabase の `service_role` キー** — RLSをバイパスする。サーバ側のみで使い、絶対にクライアントへ露出させない
- **Vercel Edge Config / 環境変数** — Preview デプロイにも注入されるか確認

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[OWASP Top 10]]
- [[暗号の基礎]]
- [[シークレット管理]]
- [[認証と認可]]
- [[SAST]]

## 出典

- [OWASP Top 10:2021 A02 Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)
- [OWASP Cheat Sheet: Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Cheat Sheet: Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
