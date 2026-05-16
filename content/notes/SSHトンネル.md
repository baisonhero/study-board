---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - SSH Tunnel
  - SSHトンネリング
  - SSH Port Forwarding
---

# SSHトンネル

> [!summary]
> **SSHトンネル**は SSH 接続の暗号化されたチャネル上に **任意のTCPポート（または UNIX ソケット、X11）** を運ぶ機能。SSH 自体はリモートシェル用だが、`-L` / `-R` / `-D` の3つのオプションで「ローカル」「リモート」「ダイナミック」のトンネルが作れ、ファイアウォールの穴開けやDB踏み台アクセス、安全なポート転送が無料で実現できる。VPNの軽量版として今もインフラ運用の現場で頻繁に使われている。

## 3種類のフォワーディング

### Local Forwarding（`-L`）

```bash
ssh -L 5432:db.internal:5432 bastion.example.com
```

意味: 「**自分のPC**の `localhost:5432` への通信を、bastion経由で **db.internal:5432** に届ける」。手元のpsqlコマンドが、bastionだけを経由してプライベートDBに繋がる。最も使う形。

### Remote Forwarding（`-R`）

```bash
ssh -R 8080:localhost:3000 dev.example.com
```

意味: 「**dev.example.com**側の `:8080` への通信を、ローカルの `:3000` に届ける」。社内NATの裏にある開発サーバーをインターネット側に晒したいときに使う（ngrok の手作り版）。

### Dynamic Forwarding（`-D`）— SOCKSプロキシ

```bash
ssh -D 1080 bastion.example.com
# ブラウザでSOCKSプロキシ localhost:1080 を指定
```

意味: bastion を経由する**汎用SOCKS5プロキシ**を立てる。社内のIPでしかアクセスできない全URLにアクセス可能になる。

## 典型ユースケース

- **DB踏み台アクセス**: RDS / Cloud SQL を public IP 無しで運用し、bastion 経由で SSHトンネル
- **Kubernetes API への到達**: `kubectl` を踏み台経由で叩く
- **業務システムのテスト環境への一時アクセス**: VPN を張らずに SSH 一発
- **CIから本番DBへの読み取り**: ジャンプサーバー経由でマイグレーション

## ConfigによるTunnel化

毎回コマンド指定するのは辛いので `~/.ssh/config` に：

```
Host db-tunnel
  HostName bastion.example.com
  User devuser
  LocalForward 5432 db.internal:5432
```

すると `ssh db-tunnel` だけでトンネルが立つ。

## セキュリティ上の注意

- **`AllowTcpForwarding no`** で禁止できる。共有bastionは禁止が無難
- ローカル `0.0.0.0` バインドは漏れの元（デフォルトは `127.0.0.1` バインド）
- ヒストリに認証情報が残らないよう、鍵ベース認証を徹底
- **永続トンネル**には autossh / systemd unit を使う

## VPN との位置付け

[[トンネルの分類と定義]] の観点では、SSHトンネルは **アプリケーション層（L7）トンネル**。L3全体を運ぶ VPN（[[WireGuard]] / [[OpenVPN]] / [[IPsec]]）とは違い、TCP単位の制御で済む軽量さが利点。代わりに `ping` のようなICMPは通らない、UDPは通らない（VPN要）など、制限もある。

## 出典

- OpenSSH manual (`man ssh`): https://man.openbsd.org/ssh
- SSH.com Tunneling guide: https://www.ssh.com/academy/ssh/tunneling

## 関連MOC

- [[MOC Networking]]
- [[MOC DevSecOps]]

## 関連ノート

- [[SSH実運用]]
- [[トンネルの分類と定義]]
- [[プロキシとリバースプロキシ]]
- [[ファイアウォールとネットワークACL]]
- [[Tailscale]]
- [[WireGuard]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
