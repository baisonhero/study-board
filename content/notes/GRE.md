---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Generic Routing Encapsulation
---

# GRE

> [!summary]
> **GRE (Generic Routing Encapsulation)** は Cisco が1990年代に開発し RFC 2784 で標準化された **IPトンネリングプロトコル**。任意のネットワーク層プロトコル（IPv4/IPv6/IPX）をIPv4/IPv6パケットにカプセル化する。暗号化機能を持たないシンプルな構造で、それ自体ではセキュアではないが、[[IPsec]] と組み合わせる "GRE over IPsec" 構成や、SD-WAN / DDoS スクラビング / IPアドレス回避などの土台として現役。

## どう動くか

```
[Original IP packet (private)] → [GRE Header + Original IP] → [Outer IP Header (public)]
```

GREヘッダは8バイト程度の最小構造で、Protocol Type フィールドで「カプセル化したのは何のプロトコルか」を表現する。

## 主なユースケース

- **拠点間トンネル**: ルーティングプロトコル (OSPF/EIGRP) を含めて運ぶ。IPsecは IP しか運べないため、GREでラップしてからIPsecで暗号化する **GRE over IPsec** が定番
- **マルチキャスト over インターネット**: マルチキャストはインターネット上で直接走らない → GREトンネルで運ぶ
- **DDoS スクラビング**: Cloudflare Magic Transit などが、防御側に GRE トンネルで戻すアーキテクチャを採用
- **SD-WAN**: 拠点間で動的にトンネル張る基礎技術

## セキュリティ上の注意

- **暗号化なし**: GRE単独はカプセル化のみ。盗聴・改ざんから守りたいなら [[IPsec]] と組み合わせる
- **認証なし**: なりすましトンネルが理論的には可能。フィルタリングで送信元IPを制限
- **MTU断片化**: 追加ヘッダ分のMTU調整が必須。`mss-clamp` 等の対応が必要

## トンネリングの位置づけ

[[トンネルの分類と定義]] 観点では、GREは **L3 トンネル**（ネットワーク層をネットワーク層で運ぶ）。L2 を運ぶ [[VXLAN]] / EVPN、L4以上を運ぶ [[SSHトンネル]] / [[HTTP CONNECTトンネル]] / [[WebSocketトンネル]] と階層が異なる。

## クラウドでの扱い

- **AWS**: マネージドGREサービスは無いが、Transit Gateway / Direct Connect の代替として VPN Gatewayがある
- **Cloudflare**: Magic Transit / Magic WAN がGREベース
- **オンプレ機器**: Cisco / Juniper / FortiGate 等のWANルーターで標準搭載

## 出典

- RFC 2784: https://datatracker.ietf.org/doc/html/rfc2784
- Cloudflare Magic Transit: https://www.cloudflare.com/magic-transit/

## 関連MOC

- [[MOC Networking]]

## 関連ノート

- [[トンネルの分類と定義]]
- [[IPsec]]
- [[VXLAN]]
- [[L2TP]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
