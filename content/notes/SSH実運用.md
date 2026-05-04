---
tags: [inbox, learning, security]
created: 2026-04-26
aliases:
  - SSH
  - SCP
  - 鍵認証
---

# SSH実運用

> [!summary]
> Linux運用の入口。鍵管理、ConfigFile、踏み台経由、port-forwarding、known_hosts。**パスワード認証は完全廃止し、鍵 + パスフレーズが基本**。インフラ業務で毎日使うので習熟必須。

## SSH とは

**Secure Shell**。リモートマシンへの暗号化シェルアクセス。

- ポート22（変更可）
- TCP上で動作
- L7 アプリケーションプロトコル
- クライアント = `ssh`、サーバ = `sshd`

## 基本接続

```bash
# ユーザー名とホスト
ssh alice@server.example.com

# ポート指定
ssh -p 2222 alice@server.example.com

# 鍵指定
ssh -i ~/.ssh/specific_key alice@server.example.com

# 詳細（デバッグ）
ssh -v alice@server.example.com
ssh -vvv alice@server.example.com   # 超詳細
```

## 鍵認証

### 鍵の生成

```bash
# Ed25519（推奨、最新の標準）
ssh-keygen -t ed25519 -C "alice@example.com"

# RSA（互換性のため）
ssh-keygen -t rsa -b 4096 -C "alice@example.com"

# 出力先指定
ssh-keygen -t ed25519 -f ~/.ssh/work_key
```

- 秘密鍵：`~/.ssh/id_ed25519`（権限 600）
- 公開鍵：`~/.ssh/id_ed25519.pub`（権限 644）

> [!tip] パスフレーズは付ける
> パスフレーズなしの鍵は「鍵そのものが漏洩 = アクセス権の漏洩」。**ssh-agentで一度パスフレーズ入力すれば再入力不要**になるので、付けるデメリットは少ない。

### 公開鍵の登録

サーバ側 `~/.ssh/authorized_keys` に公開鍵を追記：

```bash
# 楽な方法
ssh-copy-id alice@server.example.com

# 手動の方法
cat ~/.ssh/id_ed25519.pub | ssh alice@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
```

### ssh-agent

パスフレーズを記憶してくれるエージェント：

```bash
# 起動（多くのOSで自動）
eval "$(ssh-agent -s)"

# 鍵を追加（パスフレーズ入力）
ssh-add ~/.ssh/id_ed25519

# 登録された鍵一覧
ssh-add -l

# 全鍵削除
ssh-add -D

# macOS でログイン時に自動追加
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

## ~/.ssh/config

ホストごとに設定をまとめられる。**運用が劇的に楽になる**：

```
Host work-prod
    HostName 10.0.1.10
    User deploy
    Port 2222
    IdentityFile ~/.ssh/work_key
    ForwardAgent yes

Host work-staging
    HostName 10.0.2.10
    User deploy
    IdentityFile ~/.ssh/work_key

Host *.work.internal
    User alice
    IdentityFile ~/.ssh/work_key
    ProxyJump bastion.work.example.com

Host github.com
    User git
    IdentityFile ~/.ssh/github_key
```

これで `ssh work-prod` だけで繋がる。タブ補完も効く。

## 踏み台経由（ProxyJump）

直接アクセスできない内部サーバへの接続：

```bash
# コマンドラインで
ssh -J bastion.example.com internal-server

# config で
Host internal-*
    User alice
    ProxyJump bastion.example.com

# 多段ジャンプ
Host deepest
    ProxyJump bastion1,bastion2
```

`ProxyJump`（旧 `ProxyCommand` の簡易版）が現代的。

## ポートフォワーディング

[[トンネルの分類と定義]] で触れたSSHトンネルの実用。

### Local Forward（`-L`）

「**手元のポートを、サーバから見える宛先に転送**」

```bash
# 手元の3306 → DBサーバの3306（SSH先サーバ経由）
ssh -L 3306:db.internal:3306 alice@bastion.example.com

# 別の例：手元の8080 → SSH先自身の8080
ssh -L 8080:localhost:8080 alice@app.example.com
```

ローカルの`localhost:3306`に繋ぐと、bastion経由で `db.internal:3306` に届く。

### Remote Forward（`-R`）

「**サーバ側のポートを、手元から見える宛先に転送**」

```bash
# サーバの 8080 → 手元の 3000
ssh -R 8080:localhost:3000 alice@server
```

逆方向。デモやコールバック受信で使う。

### Dynamic Forward（`-D`）— SOCKSプロキシ

```bash
ssh -D 1080 alice@bastion
```

`localhost:1080` がSOCKS5プロキシになり、ブラウザを経由させると全通信がbastion経由になる（=社内網アクセス）。

## SCP / Rsync（ファイル転送）

### scp

```bash
# ローカル → リモート
scp file.txt alice@server:~/

# リモート → ローカル
scp alice@server:~/file.txt .

# ディレクトリ
scp -r dir/ alice@server:~/

# ポート指定
scp -P 2222 file alice@server:~/
```

### rsync（差分転送、高速）

```bash
# 同期（追加のみ）
rsync -avz local/ alice@server:remote/

# 削除も同期
rsync -avz --delete local/ alice@server:remote/

# 特定ファイル除外
rsync -avz --exclude='.git' --exclude='node_modules' local/ alice@server:remote/

# SSH鍵指定
rsync -avz -e "ssh -i ~/.ssh/key" local/ alice@server:remote/

# Dry run（実際には転送しない）
rsync -avz --dry-run local/ alice@server:remote/
```

`rsync` は scp より圧倒的に高速で柔軟。**現代では rsync 推奨**。

## known_hosts と「ホスト鍵」

初回接続時に表示される `Are you sure you want to continue connecting?` はサーバの**ホスト鍵**を `~/.ssh/known_hosts` に記録する確認。

問題になる時：

```bash
# サーバ再構築でホスト鍵が変わった
WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!
```

対処：

```bash
# 該当行を削除
ssh-keygen -R server.example.com

# 全クリア（再接続で再登録）
> ~/.ssh/known_hosts
```

> [!warning] MITM の警告
> ホスト鍵変更の警告は本来 MITM 攻撃の兆候。**意図せず変わったなら絶対に消さない**。サーバ再構築・OS更新等で変わったことを確認できた時だけ消す。

## sshd 側の設定

`/etc/ssh/sshd_config` の重要項目：

```
# パスワード認証無効化（鍵のみ）
PasswordAuthentication no
ChallengeResponseAuthentication no

# rootログイン無効化
PermitRootLogin no

# ポート変更（攻撃減らせるが本質的解決ではない）
Port 2222

# 公開鍵認証
PubkeyAuthentication yes

# 特定ユーザーのみ
AllowUsers alice bob
AllowGroups sshusers

# 鍵タイプ制限
PubkeyAcceptedKeyTypes ssh-ed25519,rsa-sha2-512
```

変更後：

```bash
sudo systemctl reload sshd       # 設定再読み込み
sudo sshd -t                     # 設定構文チェック
```

> [!warning] sshdを再起動する前に
> **別の SSHセッションを開いたまま**にしてから設定変更・再起動。締め出されたら詰む。設定変更は `sshd -T` で適用後の設定確認。

## fail2ban（ブルートフォース対策）

複数回ログイン失敗したIPを自動 ban：

```bash
sudo apt install fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

## SSH証明書（より進んだ運用）

長期鍵を全員に配るのではなく、**短命な署名付き証明書**を発行：

- 中央CAが発行
- 失効が容易（rotation）
- 大規模組織で実用化（Facebook、Netflix の事例）
- AWSの **EC2 Instance Connect** や **Session Manager** はこの考え方の発展

## SSM Session Manager（AWS）

AWS固有だがSSHを置き換える流れ：

```bash
# IAMで認証、ポート22不要、ログ完全記録
aws ssm start-session --target i-1234567890abcdef0
```

メリット：
- ポート22 open不要（インバウンド全閉でOK）
- IAM 認証（鍵管理不要）
- セッション全記録

## 良くあるトラブル

- **「Permission denied (publickey)」** → 鍵が届いてない、authorized_keys権限間違い、鍵タイプサポート外
- **「Connection refused」** → SSHサーバ側で sshd が動いてない、ポート違い、FW
- **「Connection timed out」** → ネットワーク到達不可、SG設定
- **接続後すぐ切れる** → サーバ側 ulimit、ホームディレクトリ権限、shell無効
- **鍵を渡してるのにパスワード聞かれる** → `ls -la ~/.ssh` で権限確認、`chmod 700 ~/.ssh && chmod 600 ~/.ssh/*`

```bash
# 権限の正解
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_*           # 秘密鍵
chmod 644 ~/.ssh/id_*.pub       # 公開鍵
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/known_hosts
chmod 600 ~/.ssh/config
```

## 関連MOC

- [[MOC Learning]]
- [[MOC Security]]
- [[MOC DevSecOps]]

## 関連ノート

- [[インフラエンジニア学習ロードマップ]]
- [[Linuxサーバー運用基礎]]
- [[トンネルの分類と定義]]
- [[認証と認可]]
- [[ゼロトラストとネットワーク基礎]]
