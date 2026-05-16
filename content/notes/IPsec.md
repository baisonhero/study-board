---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - IPSec
  - Internet Protocol Security
---

# IPsec

> [!summary]
> **IPsec (Internet Protocol Security)** は IP 層 (L3) で動作する VPN プロトコルスイート。1990年代から企業ネットワークの拠点間VPN (site-to-site VPN) で広く使われ、現在も AWS Site-to-Site VPN / Azure VPN Gateway / Cisco ASA 等で標準採用される。Authentication Header (AH) と Encapsulating Security Payload (ESP) の2つのプロトコル、トランスポート/トンネルの2モードで構成される。

## アーキテクチャ

- **AH (Authentication Header)**: 認証のみ、暗号化なし（NAT越え困難なため現在ほぼ使われない）
- **ESP (Encapsulating Security Payload)**: 認証 + 暗号化。これが事実上のデフォルト
- **IKE (Internet Key Exchange)** v1/v2: 鍵交換と SA (Security Association) のネゴシエーション

## モード

- **Transport モード**: ペイロードのみ暗号化、IPヘッダは平文 → ホスト間VPN
- **Tunnel モード**: IPパケット全体を暗号化して新しい IP ヘッダで包む → 拠点間VPN（一般的）

## VPNとして使う構成例

```
[Office LAN] ---- [VPN GW A] === IPsec Tunnel === [VPN GW B] ---- [Cloud VPC]
192.168.0.0/24                                                    10.0.0.0/16
```

両端のゲートウェイがVPN張り、その内側のホストは透過的に通信できる。

## WireGuard との比較

| 観点 | **IPsec** | [[WireGuard]] |
|---|---|---|
| 標準化 | IETF RFC 多数 | 単一実装 |
| 設定の複雑さ | 高い（IKE/SA/Phase1/Phase2） | 低い |
| 暗号スイート | ネゴシエーション可 | ハードコード |
| パフォーマンス | 中速 | 高速 |
| NAT越え | 苦手（NAT-T で対応） | 苦手だが [[Tailscale]] 等で補完 |
| 企業向け実績 | 圧倒的 | 近年急増 |

## NAT越え

IPsec のオリジナルはNATと相性が悪い（IPヘッダの完全性検査がNAT書き換えで壊れる）。**NAT-T (NAT Traversal)** で UDP 4500 にカプセル化することで対応するが、ファイアウォール越しでは依然として複雑。

## 主なユースケース

- AWS / Azure / GCP の拠点間VPN
- IoT機器 ↔ クラウドの暗号化通信
- ハードウェアVPN製品（Cisco, FortiGate, Palo Alto）
- リモートアクセスVPN（IKEv2 + EAP）

## 出典

- RFC 4301 (IPsec architecture): https://datatracker.ietf.org/doc/html/rfc4301
- AWS Site-to-Site VPN: https://docs.aws.amazon.com/vpn/

## 関連MOC

- [[MOC Networking]]
- [[MOC DevSecOps]]

## 関連ノート

- [[WireGuard]]
- [[OpenVPN]]
- [[トンネルの分類と定義]]
- [[ファイアウォールとネットワークACL]]
- [[ゼロトラストとネットワーク基礎]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
