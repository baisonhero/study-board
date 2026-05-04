---
tags: [inbox, learning]
created: 2026-04-26
aliases:
  - top
  - htop
  - iostat
  - パフォーマンス計測
---

# Linuxパフォーマンス計測

> [!summary]
> サーバが「遅い」「不安定」な時にどこを見るかの定番コマンド集。CPU、メモリ、ディスクI/O、ネットワーク、プロセスごとの利用状況を見て**ボトルネックを特定**する。Brendan Gregg の USE Method が指針。

## USE Method（測定の指針）

リソースごとに3つを見る：

- **Utilization**：使用率（busy time の割合）
- **Saturation**：飽和度（待ち行列の長さ）
- **Errors**：エラー数

CPU/メモリ/ディスク/ネットワーク 各々で USE を見ると、**どこが詰まってるか**が体系的に分かる。

## CPU

### top / htop

```bash
top                # 古典、デフォルトで入ってる
htop               # カラー、ツリー表示、要インストール
```

`top` の見方：

- `load average`：直近 1分/5分/15分の負荷（コア数を超えると待ちが発生）
- `%Cpu(s)`：us（user）/ sy（system）/ id（idle）/ wa（I/O wait）/ st（steal、仮想化で奪われた）
- プロセスごとの `%CPU`、`%MEM`、`COMMAND`

> [!tip] `wa`（I/O wait）が高い時
> CPUが遊んでてもディスクI/Oで待ってる状態。ディスクの問題を疑う（後述の `iostat`）。

### vmstat

```bash
vmstat 1            # 1秒ごとに表示
```

- `r`：実行待ちプロセス数（コア数超えで詰まり）
- `b`：I/O待ちプロセス数
- `si`/`so`：swap in/out（多いとメモリ不足）
- `us`/`sy`/`id`/`wa`/`st`：CPU 使用率

### mpstat（コアごと）

```bash
mpstat -P ALL 1     # 全コアの使用率を1秒間隔
```

特定コアだけ100%なら、シングルスレッド処理が原因の可能性。

## メモリ

### free

```bash
free -h            # 人間可読（GiB単位）
free -m            # MiB
```

```
              total        used        free      shared  buff/cache   available
Mem:           7.6G        2.1G        1.2G        100M        4.3G        5.1G
Swap:          2.0G          0B        2.0G
```

- `available` がゼロに近づくと危ない
- `buff/cache`はキャッシュなので、必要時にOSが解放する（freeに見える分以上に余裕がある）

### `/proc/meminfo`

```bash
cat /proc/meminfo | head
```

詳細メモリ統計。`SwapCached`、`Slab`、`HugePages` 等。

### OOM Killer

メモリ枯渇時にカーネルがプロセスを kill：

```bash
dmesg | grep -i "killed process"
journalctl -k | grep -i oom
```

OOM 発生はサービス停止に直結。**メモリ上限**設定（cgroup、systemd の `MemoryMax`）と監視重要。

## ディスクI/O

### iostat

```bash
iostat -xz 1        # 詳細、1秒間隔
```

- `%util`：デバイス使用率（100%なら飽和）
- `await`：I/O完了までの平均ms
- `r/s`、`w/s`：読み書き回数
- `rkB/s`、`wkB/s`：読み書き量

`%util` が高くて `await` も大きいと、ディスクが詰まってる。

### iotop（プロセスごと）

```bash
sudo iotop          # どのプロセスがI/O使ってるか
sudo iotop -o       # I/O発生してるプロセスのみ
```

### df（容量）

```bash
df -h               # 容量
df -i               # inode
```

容量だけでなく **inode 枯渇** に注意。小さいファイル大量で inode 不足になる。

### du（特定ディレクトリのサイズ）

```bash
du -sh /var/log              # 合計
du -sh /var/log/* | sort -h  # 大きい順
```

## ネットワーク

### ss / netstat

```bash
ss -s                       # サマリ統計
ss -tan | wc -l             # ESTABLISHED 接続数
ss -tan state established
```

### iftop（リアルタイム帯域）

```bash
sudo iftop -i eth0          # インターフェース別
```

`nload` も同様の用途で使える。

### sar（過去の傾向）

```bash
sar                         # 当日のCPU使用率傾向
sar -r                      # メモリ
sar -d                      # ディスク
sar -n DEV                  # ネットワーク
sar -A                      # 全て
```

`sar` は履歴を取ってくれてる（`sysstat` パッケージ）。**「あの時何が起きたか」を後で振り返れる**ので超便利。

## プロセス全般

### ps

```bash
ps auxf                     # ツリー
ps aux --sort=-%cpu | head  # CPU 高い順
ps aux --sort=-%mem | head  # メモリ高い順
```

### pidstat（プロセスごと統計）

```bash
pidstat 1                   # CPU
pidstat -d 1                # I/O
pidstat -r 1                # メモリ
```

### lsof（オープンファイル）

```bash
lsof -p <PID>               # プロセスが開いてるファイル
lsof -i :80                 # 80番ポートを使ってるプロセス
lsof | wc -l                # 全体のオープン数
```

ファイルディスクリプタ枯渇のトラブルで使う。

## システム全体の俯瞰

### dstat（複合表示）

```bash
dstat                       # CPU・メモリ・ディスク・ネット 一覧
dstat -taf                  # タイムスタンプ付き、最大値表示
```

`vmstat` `iostat` `ifstat` を一緒に見られるので便利。

### glances（綜合TUI）

```bash
glances                     # CPU/MEM/DISK/NET/PROC 一画面
```

リモートサーバの状態確認に。

## ベンチマーク

### CPU

```bash
sysbench cpu --threads=4 run
```

### ディスク

```bash
fio --name=read --rw=read --size=1G --filename=/tmp/test
hdparm -tT /dev/sda         # 読み込み速度
```

### ネットワーク

```bash
iperf3 -s                   # サーバ
iperf3 -c <server>          # クライアント
```

## カーネルチューニング（参考）

`/etc/sysctl.conf` で永続設定：

```
net.core.somaxconn = 4096                # listen backlog 増
net.ipv4.tcp_tw_reuse = 1                # TIME_WAIT再利用
fs.file-max = 1000000                    # ファイルディスクリプタ上限
vm.swappiness = 10                       # スワップ抑制
```

ulimit（プロセスごとの上限）：

```bash
ulimit -n                   # 現在のオープンファイル上限
ulimit -n 65536             # 一時的に変更

# 永続化は /etc/security/limits.conf
```

## eBPF 系（モダン）

カーネルにフックを仕掛けて低オーバーヘッドで観測：

- **bcc-tools**：`opensnoop`、`execsnoop`、`tcpconnect` 等
- **bpftrace**：DSLでスクリプト
- **Cilium / Falco / Pixie**：eBPF応用プロダクト

```bash
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_open { @[comm] = count(); }'
```

学習コスト高いが、パフォーマンス調査の決定打になり得る。

## トラブル時の最初の30秒（Brendan Gregg）

```bash
uptime                      # load average
dmesg -T | tail             # 最新のカーネルログ
vmstat 1                    # CPU/MEM/SWAP
mpstat -P ALL 1             # コアごとCPU
pidstat 1                   # プロセスごとCPU
iostat -xz 1                # ディスクI/O
free -m                     # メモリ
sar -n DEV 1                # ネットワーク
sar -n TCP,ETCP 1           # TCP統計
top                         # 全体俯瞰
```

これで全体像が掴める。

## 関連MOC

- [[MOC Learning]]
- [[MOC Observability]]

## 関連ノート

- [[インフラエンジニア学習ロードマップ]]
- [[Linuxサーバー運用基礎]]
- [[システム監視と可観測性]]
- [[ネットワークトラブルシューティング]]
