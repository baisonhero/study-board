---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - HTTP CONNECT Tunnel
  - CONNECT method
---

# HTTP CONNECTトンネル

> [!summary]
> **HTTP CONNECT** は HTTP/1.1 の特殊メソッドで、**HTTPプロキシ越しにTCP接続を確立する**ために使われる。ブラウザが HTTPSサイトに HTTP プロキシ経由で接続する標準手順がこれ。プロキシは CONNECT を受けて「クライアント ↔ プロキシ ↔ オリジン」の生のTCPトンネルを張り、その後はTLSバイト列を素通しする（中身は読めない）。シンプルだが企業ファイアウォール越えやコンテナレジストリへのアクセスなど、いまも至るところで使われる。

## プロトコル例

```
CONNECT api.example.com:443 HTTP/1.1
Host: api.example.com:443
Proxy-Authorization: Basic dXNlcjpwYXNz

(プロキシが応答)
HTTP/1.1 200 Connection Established

(以降、クライアント ↔ オリジン のTCPバイトを素通し)
```

CONNECTが200を返した時点で、プロキシは **TLSハンドシェイクの中身を読まない**。「中身が暗号化されたまま通り抜ける」のがHTTPSの根本前提。

## なぜ存在するか

- 企業ネットワークがインターネット直結を許さず、HTTPプロキシ経由を強制する
- HTTPSサイトを使うとき、HTTPプロキシは「目的ホスト名 + ポート」だけ知ればよい
- HTTPS の中身までは検査しない（透過プロキシ。SSL Inspection は別カテゴリ）

## ユースケース

- ブラウザの **PAC / システムプロキシ設定**
- `npm config set https-proxy http://proxy.corp:8080`、Docker daemon の HTTPS_PROXY 設定
- **コンテナレジストリ** (Docker Hub / GHCR / GCR) への企業内アクセス
- **CIランナー** が社内プロキシ経由で外部に出る場合
- **forward proxy as a service** (Cloudflare Gateway, Zscaler, Netskope SWG) の基本動作

## SSL Inspection との関係

企業のSWG (Secure Web Gateway) は、CONNECT 通常パターンを **「中間者として再暗号化」** することがある。クライアントに企業発行のルート証明書をインストールさせ、プロキシ自身が TLS終端 → 検査 → 再暗号化、というMITMをホワイトに行う構成。HTTPS の中身を見られる代わりに、E2E 暗号性は失われる。

## 攻撃シナリオ

- **オープンプロキシ悪用**: CONNECT が認証なしで開いているプロキシは攻撃者の踏み台になる ([[A10 SSRF]] と関連)
- **DNS Rebinding**: プロキシがDNS解決を信頼しすぎると内部ネットワーク到達に悪用される
- **トンネル乱用**: 一部攻撃者が CONNECT 経由で C2 通信を行う

## トンネル分類

[[トンネルの分類と定義]] の観点では、CONNECT は **「アプリ層プロトコル (HTTP) を使ってトランスポート層 (TCP) を運ぶ」** ハイブリッド。`HTTP/1.1` のセマンティクスを使うが、CONNECT受諾後は素のTCP同等。

## 出典

- RFC 9110 §9.3.6 (CONNECT method): https://datatracker.ietf.org/doc/html/rfc9110#section-9.3.6
- MDN HTTP CONNECT: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/CONNECT

## 関連MOC

- [[MOC Networking]]

## 関連ノート

- [[トンネルの分類と定義]]
- [[プロキシとリバースプロキシ]]
- [[TLS]]
- [[WebSocketトンネル]]
- [[SSHトンネル]]
- [[A10 SSRF]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
