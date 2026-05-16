---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Layer 2 Tunneling Protocol
---

# L2TP

> [!summary]
> **L2TP (Layer 2 Tunneling Protocol)** は L2 フレーム (PPP) を IP ネットワーク上で運ぶ古典的なトンネリングプロトコル (RFC 2661, 後の L2TPv3 で RFC 3931)。単独では暗号化機能を持たないため、業務では事実上 **L2TP/IPsec** の組み合わせで使われる。古いVPNクライアント (Windows XP〜10 標準、iOS, Android) が標準対応していたため、企業VPNとして長年デファクトだった。

## L2TP/IPsec の構成

```
[Client] --PPP frames in L2TP--+
                               +-->[IPsec ESP encryption]--> [VPN Server]
                               |
                          (L2TP 1701/UDP)
```

L2TP がトンネル、IPsec が暗号化、PPPが認証 (CHAP/MS-CHAPv2) という3段階の役割分担。

## メリット・デメリット

| 観点 | L2TP/IPsec |
|---|---|
| OS標準クライアント | あり（Win/Mac/iOS/Android） |
| NAT越え | 弱い (UDP 500/4500 + 1701) |
| パフォーマンス | 中（二重カプセル化のオーバーヘッド） |
| 設定 | やや複雑 |
| 暗号スイート | IPsec依存（IKEv1古ければ弱い） |

## 現代における位置づけ

L2TP/IPsec は **OS標準クライアントだけで動く** という利点があったが：

- iOS / macOS は近年 L2TP を非推奨化
- Windows もIKEv2を優先
- 新規構築は IKEv2 ( [[IPsec]] ) / [[WireGuard]] / [[OpenVPN]] が一般的

**既存システムで L2TP/IPsec が動いているなら維持してよいが、新規ならまず選ばない** が現実的判断。

## L2TPv3

L2TPv3 (RFC 3931) は PPP に限らず Ethernet / Frame Relay / ATM などのL2を運ぶ汎用版。プロバイダーが L2 サービスを提供する用途で使われる。実質 [[VXLAN]] / EVPN に取って代わられた。

## 出典

- RFC 2661 (L2TP): https://datatracker.ietf.org/doc/html/rfc2661
- RFC 3931 (L2TPv3): https://datatracker.ietf.org/doc/html/rfc3931

## 関連MOC

- [[MOC Networking]]

## 関連ノート

- [[トンネルの分類と定義]]
- [[IPsec]]
- [[WireGuard]]
- [[OpenVPN]]
- [[ファイアウォールとネットワークACL]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
