---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Virtual eXtensible LAN
---

# VXLAN

> [!summary]
> **VXLAN (Virtual eXtensible LAN)** は L2 イーサネットフレームを **UDP パケットにカプセル化して L3 ネットワーク上を運ぶ** トンネリングプロトコル (RFC 7348)。VLAN の上限 (4096 ID) を超えて約 1600 万 (24bit VNI) のセグメントを作れるため、データセンター・パブリッククラウドの仮想ネットワーク・コンテナネットワークの基盤として広く使われている。

## なぜ必要か

伝統的な VLAN (802.1Q) は **12bit のVLAN ID** で最大4094個までしかセグメントを作れない。マルチテナント・大規模仮想化環境では足りない。さらに、VLAN は L2 ネットワークに閉じる必要があり、データセンター跨ぎ・パブリッククラウド跨ぎは困難。VXLAN は L3 (IP) の上にL2を運ぶことで、これらの制約を解いた。

## 構造

```
Ethernet | IP (outer) | UDP (4789) | VXLAN Header (VNI 24bit) | Inner Ethernet | Payload
```

オーバーレイで L2 を運ぶため、仮想マシン・コンテナは「自分は同じL2にいる」ように振る舞える。物理ネットワークは L3 ルーティングだけ意識すればよい。

## VTEP (VXLAN Tunnel Endpoint)

VXLAN のカプセル化・脱カプセル化を担うエンドポイント。ESXi ホスト、Linux カーネル (`ip link add vxlan0`)、ハードウェアスイッチ（Cisco Nexus, Arista 等）が VTEP として動く。

## ユースケース

- **AWS / Azure / GCP のVPC内部**: 各クラウドのオーバーレイ実装は VXLAN ベース（または独自プロトコル）
- **Kubernetes CNI**: Flannel / Calico VXLAN モードがコンテナ間通信に VXLAN を使う
- **VMware NSX**: 仮想ネットワークのDC内オーバーレイ
- **DCの BGP EVPN**: VXLAN のコントロールプレーンとして BGP を使い、エンタープライズDC全体を統一

## マルチキャストとユニキャスト

オリジナル仕様ではマルチキャストでフラッディングしていたが、現代の大規模DCでは **BGP EVPN** でMAC学習を行い、ユニキャストだけで動かす運用が標準。

## トンネルの位置づけ

[[トンネルの分類と定義]] の観点では、VXLAN は **L2 トンネル over L3** (ネットワーク層の上でデータリンク層を運ぶ)。GRE (L3 over L3) や [[SSHトンネル]] (L7 over L7) と異なる階層。

## セキュリティ的注意点

- **暗号化なし**: VXLAN単独は暗号化しない。MACsec / IPsec などで補完する
- **VNIの誤設定**: テナント間でVNIが重複するとリーク
- **VTEPのフィルタリング**: 不正な VTEP が混入するとセグメント越境攻撃

## 出典

- RFC 7348: https://datatracker.ietf.org/doc/html/rfc7348
- BGP EVPN: https://datatracker.ietf.org/doc/html/rfc7432

## 関連MOC

- [[MOC Networking]]

## 関連ノート

- [[トンネルの分類と定義]]
- [[GRE]]
- [[Kubernetes基礎]]
- [[OSI参照モデルとTCPIP]]
- [[クラウドの基礎概念]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
