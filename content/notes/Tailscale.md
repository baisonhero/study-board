---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - tailscale
---

# Tailscale

> [!summary]
> **Tailscale** は [[WireGuard]] をベースにしたメッシュ型VPNサービス。従来のハブ&スポーク型VPN（拠点に集約→検査→転送）と違い、デバイス同士が直接P2Pでつながる。SSO（Google/GitHub/Okta）でユーザー認証し、ACLでデバイス・ポート単位の許可を書くだけで [[ゼロトラストとネットワーク基礎]] 的なネットワークが組める。個人開発から企業の在宅勤務環境まで広く採用されている。

## 仕組み

- データプレーンは [[WireGuard]]（UDP、暗号化、軽量）
- コントロールプレーン（鍵交換・ACL配布・NAT越え調整）は Tailscale のクラウド（独自実装の "Coordination Server"）
- NAT越えできない端末同士は **DERP リレー**（[[DERP]]）でTCP/443経由のフォールバック
- **MagicDNS** で `device-name` だけで他デバイスに到達可能

## 競合・代替

- **WireGuard 単体**: 自前で公開鍵を配布・ピア更新を管理する必要があり、規模が大きいと運用が重い
- **Headscale**: Tailscale のコントロールプレーンをOSS化したセルフホスト版。コーディネーションを自分で持ちたい組織向け
- **NetBird / Twingate / ZeroTier**: 同じカテゴリの競合
- **Cloudflare Tunnel + Access**: ZTNAとしては似ているが、こちらはアウトバウンドTCPトンネルベースで方向性が異なる

## 主要機能

- **ACL（HuJSON記法）**: `tag:dev → tag:db port 5432` のような宣言的アクセス制御
- **Subnet router**: 1台のデバイスを経由してLAN全体に到達可能（既存環境にエージェントを入れたくないIoT/プリンタに有効）
- **Exit node**: 出口VPNとして使う（特定リージョンから出たい時、公衆Wi-Fiで全通信を暗号化したい時）
- **Tailscale SSH**: SSH鍵の代わりにTailscale認証でSSH可能。鍵管理が要らない
- **Funnel**: 自宅マシンの特定ポートをインターネット公開（開発デモやWebhook受信用）
- **Serve**: tailnet内に限定でHTTP/HTTPS公開

## ゼロトラストとしての位置づけ

Tailscale は **デバイス認証 + ユーザー認証 + ポリシー** をネットワーク層で実現する [[ゼロトラストとネットワーク基礎]] の実装例。BeyondCorp ライクなモデルを「インストールしてSSOで入るだけ」で実現できるのが革新的だった。

## 開発者・スモールチーム向けの強み

- 個人プラン無料（最大3ユーザー / 100デバイス）
- macOS / Windows / Linux / iOS / Android / Docker 全対応
- `tailscale up` 一発で参加完了
- IPv4 100.x.x.x のCGNATレンジを内部用に割り当て

## 制約・注意点

- コントロールプレーンが Tailscale Inc. の管理下にある（セルフホストしたいなら Headscale へ）
- 暗号化終端はピア間なので、企業の中央検査（DPI）とは相性が悪い
- SaaS型なので外部依存になる（コントロールプレーン障害時は新規接続が困難。既存接続は維持）

## 出典

- Tailscale 公式: https://tailscale.com/
- How Tailscale works: https://tailscale.com/blog/how-tailscale-works
- Headscale OSS: https://github.com/juanfont/headscale

## 関連MOC

- [[MOC DevSecOps]]
- [[MOC Networking]]

## 関連ノート

- [[WireGuard]]
- [[DERP]]
- [[ゼロトラストとネットワーク基礎]]
- [[トンネルの分類と定義]]
- [[NAT越えとSTUN]]
- [[STUN]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
