---
tags: [inbox, learning, security]
created: 2026-05-05
aliases:
  - A10
  - SSRF
  - Server-Side Request Forgery
  - サーバサイドリクエストフォージェリ
---

# A10 Server-Side Request Forgery (SSRF)

> [!summary]
> [[OWASP Top 10]] 2021年版で **新規ランクイン**（コミュニティ投票によるエントリ）。サーバが攻撃者の指示で **本来到達すべきでない内部リソース** にHTTPリクエストを送ってしまう脆弱性。クラウド時代に致命度が跳ね上がった——**AWS インスタンスメタデータ (IMDS)** からの一時クレデンシャル盗取により **Capital One (2019)** で1.06億件の流出が発生した、SSRFを語る上で外せない事件。

## どういう脆弱性か

サーバ側でURLを受け取って HTTP リクエストを発行する機能（webhook、画像取得、URLプレビュー、PDF生成、SVG変換、ヘルスチェック等）が、**入力URLを十分に検証せず** に内部リソースへ到達してしまう。

代表的な攻撃先：

| ターゲット | URL例 | 影響 |
|---|---|---|
| **AWS IMDS v1** | `http://169.254.169.254/latest/meta-data/iam/security-credentials/` | 一時クレデンシャル盗取 |
| **GCP Metadata** | `http://metadata.google.internal/computeMetadata/v1/` | 同上 |
| **localhost管理画面** | `http://localhost:8080/admin` | 内部API直叩き |
| **内部レンジ** | `http://10.0.0.5/` | 社内サービス到達 |
| **ファイルプロトコル** | `file:///etc/passwd` | ローカルファイル読出 |
| **gopher://** | `gopher://...` | Redis等の任意プロトコル経由RCE |

## 攻撃例

### Capital One (2019) — IMDSv1からのクレデンシャル盗取

1. WAFサーバにSSRF脆弱性
2. 攻撃者が `169.254.169.254/latest/meta-data/iam/security-credentials/...` を取得させる
3. WAFサーバの **IAMロールの一時クレデンシャル** が漏れる
4. そのロールが過剰権限で S3 にアクセスできた
5. 1.06億件の個人情報を S3 から取得

→ 教訓: **SSRF + IMDSv1 + 過剰IAM = 致命的**。AWS は IMDSv2（トークン必須）を導入した。

### URL プレビュー機能の悪用

```
ユーザーがチャットに `http://169.254.169.254/...` を投稿
→ サーバが OG タグ取得のために fetch
→ レスポンスをプレビュー画像として保存
→ そこにメタデータが含まれている
```

Slack、Discord、Notion 系のリンクプレビューが歴史的に標的になった。

### 画像変換サービス

```
POST /upload-by-url
{ "url": "http://internal-admin/users.json" }
→ サーバが内部APIから取得した JSON を「画像変換失敗」エラーで返す
→ レスポンスに JSON 内容が混入
```

### Webhook / SMTP / DNS exfiltration

直接データが返らなくても、**Out-of-band** でDNS／HTTPコールバックを攻撃者サーバへ送らせて情報抽出（Burp Collaborator系）。

### SVG／PDF レンダリング

サーバ側で SVG → PNG 変換する際、SVG 内の `<image href="http://...">` で内部リクエストが発火するエンジン（Inkscape、ImageMagick、Headless Chrome）がある。

## 防御策

### 1. URL のホスト／IPをアロウリストで検証

DNS解決まで含めて検証する：

```javascript
import { lookup } from 'dns/promises'
import { isIP } from 'net'

async function isSafeUrl(url) {
  const u = new URL(url)
  if (!['http:', 'https:'].includes(u.protocol)) return false
  if (!ALLOWED_HOSTS.includes(u.hostname)) return false

  // DNS解決して内部レンジでないか
  const { address } = await lookup(u.hostname)
  if (isPrivateIP(address)) return false
  return true
}
```

### 2. 内部レンジを徹底的にブロック

```
10.0.0.0/8       (RFC1918 Private)
172.16.0.0/12    (RFC1918 Private)
192.168.0.0/16   (RFC1918 Private)
127.0.0.0/8      (Loopback)
169.254.0.0/16   (Link-local / IMDS)
0.0.0.0/8
::1/128          (IPv6 loopback)
fc00::/7         (IPv6 ULA)
fe80::/10        (IPv6 link-local)
```

IPv4／IPv6 両方を考慮。**`0.0.0.0` や 8進数表記** などで回避されないか確認。

### 3. AWS は IMDSv2 を強制

```
HttpTokens: required        ← トークン必須
HttpPutResponseHopLimit: 1  ← コンテナからの到達遮断
```

EC2 / ECS / EKS のすべてのインスタンスで `IMDSv2 required` を設定。Terraformで規約化。

### 4. ネットワークレベルの分離

- 外部URLを取りに行くサーバを **専用サブネット** に隔離
- そのサブネットから内部VPCへのアクセスをセキュリティグループ／NACLで遮断
- Egress プロキシ経由を強制（プロキシで宛先制御）

### 5. リダイレクト追跡を制限

```javascript
fetch(url, {
  redirect: 'manual',  // または最大ホップ数を制御
})
```

リダイレクト先のIPもアロウリスト検証する（時間差DNSで初回は通って2回目で内部に飛ぶ攻撃 = TOCTOU回避）。

### 6. プロトコルを限定

`file://`、`gopher://`、`dict://`、`ftp://` 等を許可しない。HTTP/HTTPS だけに絞る。`curl` 互換ライブラリは多プロトコル対応のものが多いので明示的に絞る。

### 7. レスポンスを直接返さない

エラー時にレスポンス本文を露出させない。Content-Type を変換結果（PNGなど）に固定し、生レスポンスが攻撃者に渡らない設計。

### 8. 認証ヘッダ／Cookieを乗せない

外部URL fetch 時に内部の認証情報を自動付与しないクライアントを使う。

## 検出手段

- **[[SAST]]** — `fetch(userInput)` のような危険パターン検知
- **[[DAST]]** — Burp Collaborator / interactsh で外部コールバックを観測
- **コードレビュー** — URL受け取り箇所の入力検証チェック
- **クラウド設定監査** — IMDSv2 強制、SG設定（[[A05]]とも関連）

## 参考事例

- **Capital One (2019)** — SSRF + IMDSv1 + 過剰IAM、業界の象徴的事例
- **MS Exchange (2021)** — SSRF含む脆弱性チェーン (ProxyShell)
- **GitLab (2021)** — image proxy で SSRF
- **Shopify** — HackerOne で SSRF 報告事例多数

## Next.js / Supabase での落とし穴

- **`next/image` の `remotePatterns`** — 緩い設定だと外部URLを fetch する経路に
- **Server Actions / Route Handlers の URL fetch** — ユーザー入力をそのまま `fetch()` しない
- **OG画像生成（`@vercel/og`）** — リクエスト先URLの検証
- **Webhook受信／URL検証**（Slack、Stripe等の連携） — 受信側のURLチェック
- **Supabase Edge Functions** — 外部API呼び出しでアロウリスト適用

詳細は [[Web脆弱性の実装防御]] のSSRFセクション参照。

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC AWS]]
- [[MOC Learning]]

## 関連ノート

- [[OWASP Top 10]]
- [[Web脆弱性の実装防御]]
- [[OWASP API Security Top 10]]
- [[AWSセキュリティ実装]]
- [[ゼロトラストとネットワーク基礎]]
- [[ファイアウォールとネットワークACL]]

## 出典

- [OWASP Top 10:2021 A10 Server-Side Request Forgery](https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/)
- [OWASP Cheat Sheet: SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [AWS: Use IMDSv2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html)
- [Capital One Breach Analysis - Krebs on Security](https://krebsonsecurity.com/2019/07/capital-one-data-theft-impacts-106m-people/)
