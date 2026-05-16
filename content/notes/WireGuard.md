---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - wireguard
  - WG
---

# WireGuard

> [!summary]
> **WireGuard** は2018年にLinuxカーネルにマージされた現代的なVPNプロトコル。[[IPsec]] や [[OpenVPN]] と比べて **コード量が桁違いに少なく（~4000行）、設定が単純、性能が圧倒的に速い**。固定された暗号スイート（Curve25519, ChaCha20-Poly1305, BLAKE2s, SipHash24, HKDF）を採用し、ネゴシエーションを排除した設計。[[Tailscale]] / NetBird / Mullvad など多くのVPNサービスの基盤になっている。

## 設計思想

- **シンプル**: 機能を絞る、暗号スイートをハードコード、設定行は最小
- **高速**: カーネル空間で動き、UDPベース、暗号化処理が軽い
- **「公開鍵 = ID」**: TLS のような証明書ストアを使わず、各ピアの公開鍵だけで認証

## 設定例

```ini
# /etc/wireguard/wg0.conf （サーバー側）
[Interface]
PrivateKey = <server_private_key>
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = <client_public_key>
AllowedIPs = 10.0.0.2/32
```

クライアント側は逆向きに `Endpoint = server.example.com:51820` を書く。**`AllowedIPs` がルーティングテーブルでもありACLでもある** のが WireGuard 流。

## 既存VPNとの比較

| 観点 | WireGuard | [[OpenVPN]] | [[IPsec]] |
|---|---|---|---|
| 設定行数 | ~10行 | ~50行 | 大量 |
| パフォーマンス | 最速 | 中 | 中〜速 |
| トランスポート | UDPのみ | TCP/UDP | UDP/ESP |
| NAT越え | 自前で必要 | TCP/443 fallback可 | 困難 |
| 暗号ネゴシエーション | 無し | あり | あり |
| カーネル統合 | あり | ユーザー空間 | カーネル |

## NAT越えとTailscaleの関係

WireGuard 単体は **ピアの IP:Port が動的に変わるネットワーク** で苦戦する（家庭NATの裏、モバイルキャリアCGNAT等）。[[Tailscale]] はこの上に **コントロールプレーン** を被せ、デバイス発見・ACL・NAT越えのコーディネーション（[[STUN]] / [[DERP]] リレー）を提供することで、WireGuardの弱点を埋めている。

## ハンドシェイク

Noise Protocol Framework の `Noise_IKpsk2` パターンを使った1-RTTハンドシェイク。再キーは2分に1回。ステートレスに見えるが内部的には軽量なステートを持つ。`AllowedIPs` がクライアントの送信元IPと一致しないパケットは静かに捨てる（DDoS耐性）。

## 運用Tips

- **ピア追加 = 設定ファイル更新 + `wg syncconf`**: ホットリロード可能
- **公開鍵の管理**: 公開鍵自体は秘密ではないがログには出さない方が無難
- **PreSharedKey (PSK)**: 量子耐性の追加レイヤー。将来の量子コンピュータ対策として持ち出せる

## 出典

- WireGuard 公式: https://www.wireguard.com/
- 論文: https://www.wireguard.com/papers/wireguard.pdf
- Linux kernel docs: https://www.kernel.org/doc/html/latest/networking/wireguard.html

## 関連MOC

- [[MOC DevSecOps]]
- [[MOC Networking]]

## 関連ノート

- [[Tailscale]]
- [[OpenVPN]]
- [[IPsec]]
- [[トンネルの分類と定義]]
- [[STUN]]
- [[DERP]]
- [[NAT越えとSTUN]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
