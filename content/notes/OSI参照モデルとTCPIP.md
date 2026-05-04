---
tags: [inbox, learning]
created: 2026-04-26
aliases:
  - OSI
  - TCP/IP
  - レイヤモデル
---

# OSI参照モデルとTCP/IP

> [!summary]
> ネットワーク技術を整理する**共通語彙**。OSI 7層モデルが教育用、TCP/IP 4層モデルが実装の現実。「このプロトコルはL○○」と即答できると、トラブル切り分けやセキュリティ設計が一気に楽になる。

## OSI参照モデル（7層）

| 層 | 名前 | 役割 | プロトコル例 | 機器 |
|---|---|---|---|---|
| **L7** | Application | アプリのデータ表現 | HTTP/HTTPS、SSH、DNS、SMTP、FTP | プロキシ、WAF |
| **L6** | Presentation | エンコーディング、暗号化 | TLS、JPEG、ASCII | （L7に統合扱い） |
| **L5** | Session | セッション管理 | NetBIOS、RPC | （L7に統合扱い） |
| **L4** | Transport | エンドツーエンド通信、信頼性 | **TCP**、**UDP**、QUIC | LB（L4） |
| **L3** | Network | ルーティング、論理アドレス | **IP**、ICMP、IPsec | ルーター |
| **L2** | Data Link | 隣接ノード間、物理アドレス | Ethernet、ARP、PPP、Wi-Fi | スイッチ、Bridge |
| **L1** | Physical | 物理信号 | ケーブル、無線電波 | ハブ、リピーター |

> [!tip] 覚え方
> 下から「物デ・ネ・ト・セ・プ・ア（物→データリンク→ネットワーク→トランスポート→セッション→プレゼン→アプリ）」、または英語頭字で「**P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way」。

## TCP/IP モデル（4層）

実装の現実に即した分類。OSIの上3層をまとめて Application、L1+L2をまとめて Link 扱い。

| TCP/IP層 | OSI対応 | 主なプロトコル |
|---|---|---|
| Application | L5〜L7 | HTTP、DNS、SSH、TLS（やや微妙） |
| Transport | L4 | TCP、UDP、QUIC |
| Internet | L3 | IP、ICMP |
| Link | L1〜L2 | Ethernet、Wi-Fi |

## カプセル化

データが下層に降りるごとに**ヘッダが追加**される：

```
[アプリデータ]
[TCPヘッダ | アプリデータ]                ← セグメント（L4）
[IPヘッダ | TCPヘッダ | アプリデータ]      ← パケット（L3）
[ETHヘッダ | IPヘッダ | TCPヘッダ | データ | ETHトレーラ]  ← フレーム（L2）
```

呼び方：L2=フレーム、L3=パケット、L4=セグメント（TCP）/ データグラム（UDP）。試験でもよく出る。

## L4: TCP vs UDP

| | TCP | UDP |
|---|---|---|
| 信頼性 | あり（再送、順序保証） | なし |
| コネクション | 3-wayハンドシェイク | コネクションレス |
| ヘッダ | 20バイト〜 | 8バイト |
| 速度 | 遅い | 速い |
| 用途 | HTTP、SSH、SMTP、FTP | DNS、VoIP、DHCP、QUIC |

### TCPの3-wayハンドシェイク

```
Client                    Server
  |  --- SYN ---->          |
  |  <-- SYN/ACK ---       |
  |  --- ACK ---->          |
  |  接続確立                |
```

トラブル時に「SYNは届いてるけどSYN/ACK返ってこない」とかをパケットキャプチャで見る。

### TCP状態遷移

主要な状態：`LISTEN` `SYN_SENT` `SYN_RECV` `ESTABLISHED` `FIN_WAIT_1/2` `CLOSE_WAIT` `TIME_WAIT` `CLOSED`。`netstat -an` や `ss -tan` で確認できる。

`TIME_WAIT` が大量にあるとポート枯渇する話は実運用でハマるポイント。

## L7: 主要プロトコル

| プロトコル | ポート | 用途 |
|---|---|---|
| HTTP | 80 | Web（暗号化なし） |
| HTTPS | 443 | Web（TLS暗号化） |
| HTTP/3 | 443/UDP | QUIC上のHTTP |
| SSH | 22 | リモートログイン |
| FTP | 21 | ファイル転送（古い、SFTP推奨） |
| SMTP | 25/465/587 | メール送信 |
| IMAP | 143/993 | メール受信 |
| DNS | 53 | 名前解決 |
| NTP | 123/UDP | 時刻同期 |
| RDP | 3389 | Windows リモートデスクトップ |
| Postgres | 5432 | PostgreSQL |
| MySQL | 3306 | MySQL |
| Redis | 6379 | Redis |

## ポート番号の区分

- **Well-Known Ports**：0〜1023（システム特権、root権限が必要）
- **Registered Ports**：1024〜49151（IANA登録）
- **Dynamic / Private**：49152〜65535（クライアントの一時ポート）

## トラブル切り分けの定番フロー

1. **L1**：ケーブル・無線つながってる？電源は？
2. **L2**：MACアドレス見える？ARP応答ある？
3. **L3**：`ping <IP>` 通る？`traceroute` でどこで止まる？
4. **L4**：`telnet <IP> <port>` でTCP接続できる？SYN/ACK返ってくる？
5. **L7**：`curl -v` でHTTPリクエスト・レスポンス見える？

「下から潰す」が原則。L7だけ見て解決しない時は下層に降りる。

## クラウドサービスとの対応

| 層 | AWSサービス例 |
|---|---|
| L7 | CloudFront、API Gateway、ALB（L7部分）、AppMesh |
| L4 | NLB、Network Firewall（L4) |
| L3 | VPC、Route Table、VPC Peering、Transit Gateway |
| L2 | （マネージド、直接見えない） |
| L1 | （マネージド、直接見えない） |

## 関連MOC

- [[MOC Learning]]

## 関連ノート

- [[インフラエンジニア学習ロードマップ]]
- [[IPアドレスとサブネット]]
- [[ルーティングとスイッチング]]
- [[トンネルの分類と定義]]
- [[ネットワークトラブルシューティング]]
