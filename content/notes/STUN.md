---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Session Traversal Utilities for NAT
---

# STUN

> [!summary]
> **STUN (Session Traversal Utilities for NAT)** は NAT 越しの **自分のグローバルIP:ポート** を発見するための軽量プロトコル (RFC 5389 → 8489)。クライアントが公開STUNサーバーに「私の見え方は?」と尋ねると、サーバーが「外からはこのIP:Portで見えてるよ」と返す。WebRTC / [[Tailscale]] / VoIP / SIP / オンラインゲームなどのP2P通信で **「相手にどのアドレスを教えればよいか」** を解決する基礎技術。

## なぜ必要か

家庭NATやキャリアCGNATの裏にあるデバイス同士が **直接P2P** で繋がるには、お互いに「外から見える IP:Port」を交換する必要がある。これを **「NAT トラバーサル」** と呼び、その第一歩がSTUNでの自己発見。

## 動作

```
[Client] --STUN Binding Request--> [STUN Server :3478]
                                         ↓ (相手の見え方を観測)
[Client] <--STUN Binding Response-- [STUN Server]
                                    Mapped Address: 203.0.113.5:51234
```

クライアントは観測されたグローバル IP:Port を「自分のアドレス」としてシグナリングチャネル経由で相手に伝える。

## NAT種別とSTUNの限界

NATの挙動には種類があり (RFC 4787 で分類)、**Symmetric NAT** だけはSTUNが効かない（接続相手ごとに違うポートを割り当てる）。この場合は [[DERP]] や TURN リレーが必要。

| NAT種別 | STUNで通る? |
|---|---|
| Full-cone | ◯ |
| Restricted-cone | ◯ |
| Port-restricted cone | △ |
| Symmetric | ✕ (TURN必須) |

## ICE / TURN との位置づけ

WebRTCの実装では **ICE (Interactive Connectivity Establishment)** という枠組みで候補アドレスを集める：

1. **Host候補**: 自分のNIC が直接知っているアドレス
2. **Server-Reflexive 候補**: STUNで観測したアドレス
3. **Relay候補**: TURN サーバー経由のアドレス（最後の手段）

STUNはこの中の Server-Reflexive 取得を担当する。

## Tailscale における役割

[[Tailscale]] では、各デバイスが起動時にSTUNで自分のIP:Portを取得し、コントロールプレーンに登録する。他デバイスとP2P接続を確立する際、互いの公開アドレスを参照してホールパンチングを試みる。失敗時は [[DERP]] リレーにフォールバック。

## 出典

- RFC 8489 (STUN): https://datatracker.ietf.org/doc/html/rfc8489
- RFC 5766 / 8656 (TURN): https://datatracker.ietf.org/doc/html/rfc8656
- Tailscale NAT解説: https://tailscale.com/blog/how-nat-traversal-works

## 関連MOC

- [[MOC Networking]]

## 関連ノート

- [[NAT越えとSTUN]]
- [[DERP]]
- [[Tailscale]]
- [[WireGuard]]
- [[ファイアウォールとネットワークACL]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
