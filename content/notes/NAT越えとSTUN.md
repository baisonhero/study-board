---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - NAT Traversal
  - NATトラバーサル
---

# NAT越えとSTUN

> [!summary]
> **NAT越え (NAT Traversal)** は、家庭・キャリアの NAT 配下にいるデバイス同士が直接 P2P 通信を行うための技術群の総称。中核となるのが [[STUN]] (自分の外側アドレスを発見する) で、それで足りないケースに TURN (リレー) や [[DERP]] (Tailscale独自リレー) を組み合わせる。WebRTC / VoIP / オンラインゲーム / [[Tailscale]] / [[WireGuard]] の P2P 接続の土台。

## NAT の問題

家庭ルーター・スマホキャリアの NAT 配下にいる端末は、**外側から呼べる固定アドレスを持たない**。たとえば PC A (自宅) と PC B (別の自宅) が直接話そうとしても、お互いに「相手に到達できるアドレス」を知らない。

## ホールパンチングの基本

1. 双方の端末がシグナリングサーバー (中央のHTTPS) に自分の **NAT外側 (Reflexive) アドレス** を登録（[[STUN]] で取得）
2. 双方が**同時に**、相手のアドレスに UDPパケットを送り合う
3. NAT は「内から外に向けて送った」直後、戻りパケットを許可するルールを作る
4. 結果として両方向のパケットが通るようになる → P2P接続成立

これを **UDPホールパンチング** と呼ぶ。

## NAT種別と成功率

[[STUN]] の項目にあるように、NATの実装次第で成功率が変わる：

- **Full-cone / Restricted-cone / Port-restricted-cone**: ホールパンチング成功率は高い
- **Symmetric NAT**: 通常成功しない → リレー必須

世界のキャリア / 家庭ルーターは大半が Cone NAT で、Symmetric は一部企業環境・キャリアCGNATに見られる。

## ICE フレームワーク

WebRTCで標準化された **ICE (Interactive Connectivity Establishment, RFC 8445)** が候補アドレスを集めて優先順位付けする：

1. Host (NICが知る直接アドレス)
2. Server-reflexive (STUNで取得した外側アドレス)
3. Relayed (TURNサーバー経由)

各端末が候補リストを交換し、ペアで疎通テストして最良経路を選ぶ。

## 各サービスでの実装

- **WebRTC**: STUN + TURN + ICE 標準
- **[[Tailscale]]**: STUN + [[DERP]] + WireGuard。リレーが必要なら DERP に即フォールバック、その後P2Pに昇格
- **WireGuard 単体**: 端末の Endpoint 更新は手動 or 自前のシグナリング
- **VoIP (SIP)**: SIP ALG / TURN / STUN の組み合わせ

## 失敗するケースと対策

- **対称NAT (キャリアCGNAT)**: ホールパンチング不可 → リレー必須
- **企業のFW で UDP全閉**: TURN over TCP/TLS でTCP経路を利用
- **ホテル / 公衆Wi-Fi**: ポート制限がある → HTTPS/443 経由のリレー (DERP) が頼みの綱

## 出典

- RFC 8445 (ICE): https://datatracker.ietf.org/doc/html/rfc8445
- Tailscale NAT 解説: https://tailscale.com/blog/how-nat-traversal-works
- WebRTC NAT: https://webrtc.org/getting-started/peer-connections

## 関連MOC

- [[MOC Networking]]

## 関連ノート

- [[STUN]]
- [[DERP]]
- [[Tailscale]]
- [[WireGuard]]
- [[トンネルの分類と定義]]
- [[ファイアウォールとネットワークACL]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
