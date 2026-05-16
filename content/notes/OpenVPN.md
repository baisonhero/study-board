---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - openvpn
---

# OpenVPN

> [!summary]
> **OpenVPN** は OSS の VPN プロトコル・実装で、2001年から続く老舗。TLS/SSL を使ったハンドシェイクとデータプレーンを採用し、UDP / TCP どちらでも動作する。ユーザー空間で動く（カーネル統合の [[WireGuard]] / [[IPsec]] と異なる）ため性能は中程度だが、**柔軟性とNAT越えの強さ**が魅力。商用版 OpenVPN Access Server も提供されている。

## 特徴

- **TLS ベース**: X.509 証明書 / 事前共有鍵で認証、暗号スイートは TLS と同じ選択肢
- **TCP/443 サポート**: ファイアウォール越え用に "HTTPS のように見せかける" 運用が可能
- **クライアント実装が豊富**: OpenVPN GUI / Tunnelblick / Viscosity / OpenVPN Connect
- **柔軟な認証**: 証明書、ID/PW、MFA (RADIUS) を組み合わせ可能

## 設定ファイル例

```
client
dev tun
proto udp
remote vpn.example.com 1194
nobind
persist-key
persist-tun
ca ca.crt
cert client.crt
key client.key
cipher AES-256-GCM
auth SHA256
remote-cert-tls server
verb 3
```

サーバー側は `server.conf` で公開鍵基盤を立てる。Easy-RSA というOpenVPN同梱の証明書生成ユーティリティが定番。

## 他VPNとの比較

| 観点 | **OpenVPN** | [[WireGuard]] | [[IPsec]] |
|---|---|---|---|
| 設定の複雑さ | 中 | 低 | 高 |
| パフォーマンス | 中 | 高 | 中〜高 |
| TCP fallback | あり（重要） | なし | なし |
| NAT越え | 強い | 弱め | 弱い |
| カーネル空間 | ユーザー空間 | カーネル | カーネル |
| 暗号ネゴシエーション | あり | なし | あり |

## 強み

- **TCP/443 で動かせる**: ファイアウォール・公衆Wi-Fi下で「HTTPS通信に見える」運用が可能
- **証明書ベースの柔軟性**: 大規模組織のPKIに統合しやすい
- **歴史的実績**: 業務システムに広く採用されており、運用ナレッジが豊富

## 弱み

- ユーザー空間処理によるオーバーヘッド
- 設定ファイル肥大化（拠点・クライアントが増えると管理が辛い）
- 暗号スイート選択を間違えるとセキュリティが落ちる（古い文献に注意）

## 現代における位置づけ

新規構築なら [[WireGuard]] / [[Tailscale]] が選ばれることが増えた。しかし **「TCP/443 でしか出られない厳格な企業ネットワーク」「既存のPKIと組み合わせたい」** のような要件では OpenVPN が依然として最適解。

## 出典

- OpenVPN 公式: https://openvpn.net/
- Community Edition: https://github.com/OpenVPN/openvpn

## 関連MOC

- [[MOC Networking]]
- [[MOC DevSecOps]]

## 関連ノート

- [[WireGuard]]
- [[IPsec]]
- [[トンネルの分類と定義]]
- [[TLS]]
- [[TLSの仕組み]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
