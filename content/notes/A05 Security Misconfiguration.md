---
tags: [inbox, learning, security]
created: 2026-05-05
aliases:
  - A05
  - Security Misconfiguration
  - 設定不備
  - ハードニング
---

# A05 Security Misconfiguration

> [!summary]
> [[OWASP Top 10]] 2021年版で **5位**。デフォルト設定そのまま、不要機能ON、エラー詳細露出、セキュリティヘッダ未設定など、「**設定**でセキュリティを崩す」カテゴリ。クラウド時代では IaC / CSPM 領域が拡大し、**S3バケット公開** や **管理コンソール露出** など事故の典型例が大量発生している。

## どういう脆弱性か

- **デフォルトのまま** — 管理者パスワード `admin/admin`、デフォルトポート開放
- **不要機能ON** — サンプルアプリ、デバッグエンドポイント（`/actuator/env`、`/debug`）が本番に残る
- **エラー詳細の露出** — スタックトレース、SQLエラー、フレームワークバージョンが返る
- **セキュリティヘッダ未設定** — CSP / HSTS / X-Frame-Options / X-Content-Type-Options
- **CORS設定が緩い** — `Access-Control-Allow-Origin: *` + `Allow-Credentials: true`
- **クラウドストレージ公開** — S3バケットが Public、Azure Blob 公開、Firebase ルール `allow read, write: if true`
- **管理コンソールの公開** — Kibana / Grafana / Jenkins / phpMyAdmin がインターネット直
- **古い／不要なソフトウェア** — 不要なOSパッケージ、削除し忘れた管理者アカウント
- **TLS設定の弱さ** — 古いcipher、自己署名証明書での運用

## 攻撃例

### S3バケット公開によるデータ流出

```
$ aws s3 ls s3://example-prod-backups --no-sign-request
2024-12-01 00:00 customers.csv
2024-12-01 00:00 invoices.json
...
```

ACLで `Public Read` になっているバケットが、検索エンジンや専用クローラに発見される。Capital One事件（[[A10]]）でも S3 + IAM 過剰権限が絡んだ。

### スタックトレース露出からのフレームワーク特定

```
500 Internal Server Error
java.lang.NullPointerException
  at com.example.Service.getUser(Service.java:42)
  ...
Spring Framework 5.2.3 / Apache Struts 2.5.20
```

→ 攻撃者は CVE をピンポイントで照合できる。

### `Access-Control-Allow-Origin: *` の罠

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

ブラウザは仕様上この組み合わせを拒否するが、**実装ミスで通ってしまう** ケースもあり、Cookieつきリクエストが任意Originから可能になる。

### Firebase Realtime Database の `if true`

```
{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}
```

開発時の「とりあえず動かす」設定を本番に持ち越して、全データが世界に晒される事故が多発。

## 防御策

### 1. ハードニングのベースライン化

CIS Benchmarks や NIST のガイドラインを参照し、OS／ミドルウェア／クラウドの推奨設定を **コード化**：

- AMI に基準設定を焼く（Packer + Ansible）
- IaC ([[IaCとTerraform基礎]]) でクラウドリソースを宣言的に管理
- セキュリティグループ／IAMをモジュール化

### 2. デフォルトを変える

- 管理者パスワードを必ず変更
- 不要なサンプル・チュートリアル・デフォルトアカウントを削除
- 不要ポートを閉じる

### 3. エラー時の情報露出を最小化

```javascript
// 危険: 詳細をそのまま返す
catch (e) { res.status(500).json({ error: e.stack }) }

// 安全: 内部ログには詳細、レスポンスは汎用メッセージ
catch (e) {
  logger.error(e)
  res.status(500).json({ error: 'Internal Server Error' })
}
```

### 4. セキュリティヘッダを設定

最低限：

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Next.js なら `next.config.js` の `headers()` で一括設定。`securityheaders.com` で点検。

### 5. クラウド設定の自動チェック

- **[[CSPM]]** (Cloud Security Posture Management): AWS Security Hub、GCP Security Command Center、Wiz、Prowler
- **[[IaC Scanning]]**: Checkov、tfsec、KICS — Terraform/CFn を CI で検査
- **AWS Config** で禁止設定（公開S3など）を継続監視

### 6. 管理画面はインターネットに出さない

- VPN / Bastion 経由
- AWS の AppStream / SSM Session Manager
- Cloudflare Access / Tailscale 等のZTNA

### 7. 定期的なパッチ適用と棚卸し

- OS / コンテナベースイメージのリビルド
- 不要パッケージ削除（distroless / Alpine ベース）
- 退職者アカウント、未使用 IAM ロールの削除

## 検出手段

- **CSPM / IaC Scanning** — クラウド設定の不備
- **[[DAST]]** — 公開エンドポイントのヘッダ検査・エラーレスポンス検査
- **Trivy / Grype** — コンテナイメージの設定／パッケージ検査
- **`securityheaders.com` / `Mozilla Observatory`** — Webセキュリティヘッダ採点
- **Shodan / Censys** — 露出した管理コンソールの探索（青チームの監視用にも）

## 参考事例

- **Capital One (2019)** — WAF設定不備 + IAM過剰 + S3 → 1.06億件流出（[[A10]]とも関連）
- **Microsoft Exchange Online (2023)** — Azure設定不備で署名鍵が露出、政府機関メール窃取
- **Accenture (2021)** — S3 が Public、認証情報含むファイルが流出
- **米国陸軍 INSCOM (2017)** — S3 Public で 47GB の機密ファイル流出

## Next.js / Supabase での落とし穴

- **`next.config.js` の `headers()` 未設定** — CSP/HSTS/X-Frame-Options が抜ける
- **Supabase RLS 未有効** — Anon key で全テーブルが読み書き可能
- **Vercel の Preview デプロイ** — 本番環境変数が漏れる設定になっていないか確認
- **`.env.local` の Git 混入** — `.gitignore` に必ず追加（[[Dependabot]] / `gitleaks` で監視）

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[OWASP Top 10]]
- [[Web脆弱性の実装防御]]
- [[IaCとTerraform基礎]]
- [[インフラセキュリティ運用]]
- [[シークレット管理]]

## 出典

- [OWASP Top 10:2021 A05 Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/)
- [OWASP Cheat Sheet: HTTP Headers](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks)
