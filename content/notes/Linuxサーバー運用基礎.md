---
tags: [inbox, learning]
created: 2026-04-26
aliases:
  - Linux
  - systemd
  - サーバー運用
---

# Linuxサーバー運用基礎

> [!summary]
> インフラエンジニアの土台。ファイルシステム、プロセス、systemd、ログ、cron、ユーザー管理。**クラウドのVMもオンプレも結局Linuxを触る**。AWS試験ではあまり問われないが実務で毎日使う知識。

## ディレクトリ構造

| ディレクトリ | 役割 |
|---|---|
| `/etc` | 設定ファイル全般 |
| `/var/log` | ログファイル |
| `/var/lib` | データベース・状態ファイル |
| `/usr/local/bin` | ローカルインストールされた実行ファイル |
| `/opt` | サードパーティアプリ |
| `/tmp` | 一時ファイル（再起動で消える設定が多い） |
| `/home/<user>` | ユーザーのホームディレクトリ |
| `/root` | root のホーム |
| `/proc` | カーネル/プロセス情報（仮想ファイルシステム） |
| `/sys` | デバイス・カーネル設定（仮想） |

## ユーザーとパーミッション

### ユーザー管理

```bash
# ユーザー作成
sudo useradd -m -s /bin/bash alice

# パスワード設定
sudo passwd alice

# sudo許可（wheelグループに追加 RHEL系、sudoグループ Debian系）
sudo usermod -aG sudo alice         # Debian/Ubuntu
sudo usermod -aG wheel alice         # RHEL/CentOS

# ユーザー削除
sudo userdel -r alice                # ホームディレクトリも削除
```

### パーミッション（rwx）

```
$ ls -la
drwxr-xr-x  3 alice alice 4096 Apr 26 10:00 mydir
-rw-r--r--  1 alice alice  220 Apr 26 10:00 file.txt
```

- 1文字目：種別（`-`=ファイル、`d`=ディレクトリ、`l`=シンボリックリンク）
- 2-4：所有者（owner）の rwx
- 5-7：所属グループ（group）の rwx
- 8-10：その他（other）の rwx

```bash
# 数字表記
chmod 755 file       # rwxr-xr-x
chmod 644 file       # rw-r--r--
chmod 600 file       # rw------- （SSHキーの定番）

# シンボリック
chmod u+x file       # owner に実行権限追加
chmod g-w file       # group から書込み権限削除

# 所有者変更
sudo chown alice:alice file
sudo chown -R alice:alice dir/
```

### umask

ファイル作成時のデフォルトパーミッション：

```bash
umask                # 現在の umask（022 が一般的）
# ファイルは 666 - umask = 644
# ディレクトリは 777 - umask = 755
```

## プロセス管理

### 確認系

```bash
# 全プロセス
ps aux                  # BSD系
ps -ef                  # SysV系

# ツリー表示
pstree -p

# 動的監視
top                     # クラシック
htop                    # 拡張版（要インストール）

# プロセス検索
ps aux | grep nginx
pgrep -f nginx
```

### 制御

```bash
# プロセス終了
kill <PID>              # SIGTERM（穏やかに）
kill -9 <PID>           # SIGKILL（強制）
kill -HUP <PID>         # SIGHUP（設定再読込みでよく使う）

# プロセス名で
pkill nginx
killall nginx
```

### バックグラウンド・前面化

```bash
command &               # バックグラウンド起動
jobs                    # ジョブ一覧
fg %1                   # ジョブ1を前面に
bg %1                   # ジョブ1をバックグラウンド再開
nohup command &         # ログアウト後も継続
disown                  # 親プロセス切り離し
```

## systemd（モダンLinux標準）

### サービス操作

```bash
# 開始/停止/再起動/リロード
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx           # 設定再読み込み（再起動なし）

# 状態確認
sudo systemctl status nginx

# 自動起動の設定
sudo systemctl enable nginx
sudo systemctl disable nginx

# ブート時の起動順
sudo systemctl list-dependencies nginx
sudo systemd-analyze blame             # 起動時間ボトルネック
```

### unit ファイル

`/etc/systemd/system/myapp.service` 例：

```ini
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/node /opt/myapp/index.js
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# 変更後の反映
sudo systemctl daemon-reload
sudo systemctl restart myapp
```

## ログ確認

### journalctl（systemd ログ）

```bash
# 全ログ
journalctl

# 特定サービス
journalctl -u nginx

# リアルタイム追跡（tail -f的）
journalctl -u nginx -f

# 期間指定
journalctl --since "2026-04-26 09:00" --until "2026-04-26 10:00"
journalctl --since "1 hour ago"

# 優先度フィルタ
journalctl -p err

# 最後のN行
journalctl -n 100
```

### 古典的ログファイル

`/var/log/` 配下：

- `syslog` / `messages` — システム全般
- `auth.log` / `secure` — 認証関連（SSH、sudo）
- `kern.log` — カーネル
- `nginx/access.log`、`nginx/error.log` — Webサーバ別

```bash
# 末尾追跡
tail -f /var/log/nginx/access.log

# 末尾100行
tail -n 100 /var/log/syslog

# パターン検索
grep "ERROR" /var/log/myapp.log
grep -A 5 -B 2 "PATTERN" file        # マッチ前後の行も
```

### ログローテーション

`logrotate` がデフォルト：

```
/etc/logrotate.d/nginx などに設定
```

```
/var/log/nginx/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
}
```

## Cron（定期実行）

```bash
# 編集
crontab -e

# 一覧
crontab -l

# 別ユーザー
sudo crontab -u alice -l
```

書式（5フィールド）：

```
分(0-59) 時(0-23) 日(1-31) 月(1-12) 曜日(0-7) コマンド

# 毎日午前3時にバックアップ
0 3 * * * /opt/backup/run.sh

# 平日の9-17時、5分ごと
*/5 9-17 * * 1-5 /usr/bin/check.sh

# 毎月1日
0 0 1 * * /opt/monthly.sh
```

代替：systemd timer（より柔軟、ログがjournalctlで見える）：

```ini
# /etc/systemd/system/backup.timer
[Unit]
Description=Run backup daily

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

## ディスク管理

```bash
# 容量確認
df -h                       # ファイルシステム単位
du -sh /var/log             # ディレクトリ単位
du -sh /var/log/* | sort -h # 大きい順

# inode 確認
df -i

# マウント確認
mount | column -t
findmnt

# 永続マウント
sudo vim /etc/fstab
```

## パッケージ管理

| ディストリ | コマンド |
|---|---|
| Ubuntu/Debian | `apt`、`apt-get`、`dpkg` |
| RHEL/CentOS/Rocky | `yum`（古い）、`dnf`（新しい）、`rpm` |
| Fedora | `dnf` |
| Arch | `pacman` |
| Alpine | `apk` |

```bash
# Ubuntu/Debian 例
sudo apt update                    # パッケージリスト更新
sudo apt upgrade                   # 全パッケージ更新
sudo apt install nginx             # インストール
sudo apt remove nginx              # 削除
sudo apt autoremove                # 不要依存の削除
apt search nginx                   # 検索
apt show nginx                     # 詳細

# RHEL/CentOS 例
sudo dnf install nginx
sudo dnf update
sudo dnf remove nginx
```

## ネットワーク確認

[[ネットワークトラブルシューティング]] と重複するが基本：

```bash
ip addr                       # IPアドレス
ip route                      # ルーティング
ss -tlnp                      # Listenポート
ping example.com
curl -v https://example.com
```

## SELinux / AppArmor（参考）

### SELinux（RHEL系）

カーネルレベルのアクセス制御。「ファイアウォールは通すけどSELinuxで止まる」がありがち：

```bash
sestatus
getenforce
sudo setenforce 0       # Permissive（一時的）
ls -Z file              # SELinuxラベル確認
```

### AppArmor（Ubuntu系）

プロセスごとのプロファイル：

```bash
sudo aa-status
sudo aa-complain /etc/apparmor.d/usr.sbin.nginx
```

## 緊急時の役立つコマンド

```bash
# CPU 高い順
ps aux --sort=-%cpu | head

# メモリ 高い順
ps aux --sort=-%mem | head

# OOM Killer の履歴
dmesg | grep -i "killed process"

# 直近の起動時間
last -x | head

# rebootの履歴
last reboot

# ファイルディスクリプタ枯渇
ls /proc/<PID>/fd | wc -l
ulimit -n           # 現在のソフトリミット
```

## ハマりやすいポイント

- **`sudo` でPATHが変わる**：`sudo command` で `command not found` の時は `which command` でフルパス指定
- **`vi` から抜けられない**：`Esc → :q!`（破棄）か `:wq`（保存）
- **systemd vs SysV init**：古いガイドの `service xxx start` はsystemdラッパー、`systemctl start xxx` が現代的
- **ログのタイムゾーン**：UTCで残ってることが多い、`timedatectl` で確認
- **`/etc/hosts` の優先**：DNS設定する前に確認

## 関連MOC

- [[MOC Learning]]
- [[MOC DevSecOps]]

## 関連ノート

- [[インフラエンジニア学習ロードマップ]]
- [[SSH実運用]]
- [[ネットワークトラブルシューティング]]
- [[システム監視と可観測性]]
