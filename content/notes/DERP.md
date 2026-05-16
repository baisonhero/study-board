---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Designated Encrypted Relay for Packets
---

# DERP

> [!summary]
> **DERP (Designated Encrypted Relay for Packets)** は [[Tailscale]] が開発したリレープロトコル。クライアント同士がNAT越えで直接P2P接続できない場合 (Symmetric NAT等) に、**Tailscaleが運営する中央リレーサーバー経由** で暗号化トラフィックをやり取りする仕組み。WebRTCの TURN に相当する位置づけだが、HTTPSベース・ステートレス・既存CDN網に乗りやすいなど運用上の利点で独自設計になっている。

## なぜTURNではなくDERP

- **TURN**: WebRTC標準。UDP/3478等。ステートフル、帯域消費が想定しにくい
- **DERP**: HTTPS (443) ベース、ステートレス、CDN風の世界中分散配置

「家庭・モバイルキャリアの99%のネットワークで動く」という現実要件のため、DERP はわざと TCP/443 を選んでいる。Symmetric NAT / 厳格なホテルWi-Fi / モバイルキャリアの SNAT でも、HTTPS で外に出られるなら DERP 接続できる。

## アーキテクチャ

```
[Client A]                                    [Client B]
   ↓ HTTPS/443                                   ↓ HTTPS/443
   --------> [DERP Server (一番近いリージョン)] <--------
                         ↓
              暗号化されたパケットを A↔B 間で中継
```

DERPサーバーは [[WireGuard]] の暗号化トラフィックを **中身を見ずに** 中継する。ペイロードはE2E暗号化されているので、リレー運営者でもデータの中身は読めない。

## P2Pへのアップグレード

DERP接続でセッションが始まったあと、両クライアントは並行して **ホールパンチング** ([[STUN]] / [[NAT越えとSTUN]]) を試みる。成功すれば徐々にトラフィックを DERP → P2P (直接UDP) に切り替えていく。**「とりあえず即座に動く、後でP2Pに昇格する」** という冗長設計。

## 利用シーン

- **Symmetric NAT配下**: 直接P2P不可、DERPだけで通信
- **新規セッション開始時**: 数十ミリ秒のDERP経由で即接続、その間にP2Pネゴ
- **モバイル間切り替え**: Wi-Fi ↔ LTEで IPが変わる瞬間も DERP がブリッジ

## Tailscaleのインフラとしての規模

Tailscale は世界数十リージョンにDERPサーバーを展開し、クライアントは最も低レイテンシなサーバーを自動選択。これは Tailscale を SaaS にせざるを得ない大きな理由で、Headscale (Tailscaleコントロールプレーン OSS版) を使う場合でも DERP は Tailscale 提供のものを使うか、自前で建てる選択肢がある。

## 出典

- Tailscale DERP 解説: https://tailscale.com/kb/1232/derp-servers
- ソースコード: https://github.com/tailscale/tailscale/tree/main/derp

## 関連MOC

- [[MOC Networking]]

## 関連ノート

- [[Tailscale]]
- [[STUN]]
- [[NAT越えとSTUN]]
- [[WireGuard]]
- [[トンネルの分類と定義]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
