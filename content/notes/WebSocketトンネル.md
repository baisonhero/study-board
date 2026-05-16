---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - WebSocket Tunnel
  - wstunnel
---

# WebSocketトンネル

> [!summary]
> **WebSocketトンネル** は WebSocket (RFC 6455) のフレームを使って **任意のTCP/UDPトラフィックを運ぶ**手法。HTTPからアップグレードして双方向通信になるWebSocketの性質を利用し、**HTTPS (443) しか通らない厳格なFW環境** でも穴を開けずにトンネルを通せる。`wstunnel` や `chisel` といったOSSが代表実装。CGNAT越え・社内→外への迂回・SaaS的なリバーストンネルで使われる。

## 動作原理

```
[Client]                    [WebSocket Server]
   ↓ HTTPS:443                  ↓
   GET /tunnel HTTP/1.1
   Upgrade: websocket
   <-- 101 Switching Protocols
   <==== 双方向のフレーム交換 ====>
       内部に TCP/UDP ペイロード
   ↓
   Local socket :8080 <-> Server :22 / :3306 / 任意
```

クライアントは "とにかく HTTPS で外に出られる" 環境にいれば、WebSocket をハンドシェイクしてからは任意のサービスにフォワードできる。

## 代表ツール

| ツール | 言語 | 特徴 |
|---|---|---|
| **wstunnel** | Rust | 高速、TCP/UDP両方対応、SOCKS5サポート |
| **chisel** | Go | ssh風UX、軽量、リバース対応 |
| **websocat** | Rust | netcatのWebSocket版、検証用に便利 |
| **frp** | Go | 専用プロトコル+WebSocketもサポート |

## 主なユースケース

- **企業FW越え**: HTTPS しか出られない環境でSSH/RDP/DBに到達したい（運用許可済みの場合のみ）
- **NATの裏のサービス公開**: 自宅マシン↔クラウドWebSocketサーバー↔インターネット、で公開用ngrok代替
- **クラウド経由のリバースシェル管理**: 業務SaaSとして社内サーバー監視
- **モバイル接続の安定化**: モバイルキャリアのUDPブロックを避け、TCP+TLS+WSで全てを運ぶ

## セキュリティ上の注意

- **正当な業務利用と「許可なし迂回」の境界**: 企業FWを意図的に回避する目的での使用は内規違反になることが多い
- **トンネル先のACL**: WebSocketサーバー側で「どのターゲットへの転送を許すか」をAllowlist化
- **mTLS / 認証**: WebSocketサーバーには必ず認証を入れる。さもないと公開プロキシ化する

## トンネル分類での位置

[[トンネルの分類と定義]] の観点では、HTTPベースの[[HTTP CONNECTトンネル]]と並ぶ「**アプリ層プロトコル (HTTP/WS) を使ってトランスポート層 (TCP/UDP) を運ぶ**」カテゴリ。HTTP/2 や HTTP/3 (QUIC) ベースの新世代トンネル (MASQUE) も同じ系譜。

## 出典

- wstunnel: https://github.com/erebe/wstunnel
- chisel: https://github.com/jpillora/chisel
- RFC 6455 (WebSocket): https://datatracker.ietf.org/doc/html/rfc6455

## 関連MOC

- [[MOC Networking]]

## 関連ノート

- [[トンネルの分類と定義]]
- [[HTTP CONNECTトンネル]]
- [[プロキシとリバースプロキシ]]
- [[SSHトンネル]]
- [[NAT越えとSTUN]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
