---
tags: [inbox, learning, security]
created: 2026-04-26
aliases:
  - Firewall
  - Security Group
  - NACL
  - iptables
---

# ファイアウォールとネットワークACL

> [!summary]
> 「**通していい通信だけ通す**」フィルタ。ステートフルとステートレス、AWS のSecurity Group / NACL の違い、Linux iptables/nftables、L7 WAF。**default deny が原則**。

## 基本的な分類

### ステートフル（Stateful）

「行きの通信」を覚えていて、対応する「戻りの通信」を自動許可：

- 接続ごとの状態テーブルを持つ
- 設定が楽（戻り通信を書かなくていい）
- 例：iptables conntrack、AWS Security Group、ホームルーター

### ステートレス（Stateless）

各パケットを独立に判定：

- 行きと戻りを別々に許可ルール書く必要
- メモリ消費少ない、超高速
- 例：AWS NACL、シンプルな firewall

## AWS のネットワークセキュリティ

### Security Group（SG）

- **インスタンス（ENI）レベル** に適用
- **ステートフル**
- **許可ルールのみ**（denyは書けない、書かなければ拒否）
- インバウンド/アウトバウンド別
- ソースに「他のSG」を指定できる（"web-sgのインスタンスからの通信を許可"）

### Network ACL（NACL）

- **サブネットレベル** に適用
- **ステートレス**
- **許可と拒否両方** 書ける
- インバウンド/アウトバウンド別
- ルールを番号順に評価（最初にマッチしたもの適用）

### SG と NACL の組み合わせ

トラフィックは **両方をパス**する必要：
1. NACL（サブネット境界、ステートレス）
2. SG（ENI境界、ステートフル）

通常運用ではNACLはデフォルトのままで、SGで細かく制御する設計が多い。NACLは「**特定IPを完全ブロック**」のような特殊用途で使う。

> [!tip] NACLを能動的に使うパターン
> 「攻撃元IPを瞬時に遮断」「組織が決めた blocklistを当てる」「Egress側で出ていけない宛先を強制制御」のような場面。デフォルトの SG運用では足りない時に。

## Linux のファイアウォール

### iptables（旧）

```bash
# 現状確認
sudo iptables -L -n -v

# SSH(22)を許可
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 確立済みの戻り通信を許可
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# それ以外をDROP
sudo iptables -P INPUT DROP

# 永続化（ディストリ依存）
sudo iptables-save > /etc/iptables/rules.v4
```

### nftables（新）

iptablesの後継。よりシンプルな構文：

```bash
sudo nft list ruleset
sudo nft add rule ip filter input tcp dport 22 accept
```

最近の Ubuntu / Debian は内部的にnftablesになっている。

### firewalld（RHEL/CentOSの抽象化レイヤ）

```bash
sudo firewall-cmd --list-all
sudo firewall-cmd --add-service=https --permanent
sudo firewall-cmd --reload
```

### ufw（Ubuntuのシンプル系）

```bash
sudo ufw status
sudo ufw allow 22
sudo ufw allow https
sudo ufw enable
```

## L7 ファイアウォール（WAF）

L4まではIPとポートで判断。L7でリクエスト内容を解釈して防御：

- **AWS WAF** — ALB / CloudFront / API Gateway 統合
- **Cloudflare WAF** — エッジで判定、無料枠から
- **ModSecurity** — OSS、Nginx/Apache モジュール
- **OWASP CRS**（Core Rule Set）— ModSecurity / AWS WAF / 各種で使えるルールセット

主な防御対象：

- SQLインジェクション（[[Web脆弱性の実装防御]]）
- XSS
- 既知の脆弱性パターン
- レート制限、Bot対策
- ジオブロック

> [!warning] WAFは万能ではない
> WAFはパターンマッチが基本。新しいゼロデイは検知できない、誤検知も多い。**アプリ側の安全な実装が大前提**で、WAFは追加の保険。

## デフォルト deny の原則

設計の鉄則：

1. **すべて拒否** からスタート
2. **必要な通信だけ allow ルールを追加**
3. ルールはレビュー、定期棚卸し
4. ログを残して未使用ルールを発見

「とりあえず全許可」運用は事故の温床。

## ホワイトリスト vs ブラックリスト

| | ホワイトリスト（許可リスト） | ブラックリスト（拒否リスト） |
|---|---|---|
| 概念 | 許可するものを列挙 | 禁止するものを列挙 |
| 安全性 | 高い（漏れがあっても拒否側） | 低い（漏れたら通る） |
| 運用 | 厳密、変更時の追加手続き | 緩い、新しい脅威に追従が必要 |
| 推奨 | **可能な限りこちら** | 補助的に |

## 多層防御（Defense in Depth）

1つのFWに頼らず、層を重ねる：

```
[Internet]
  │
  ▼
[CDN/WAF（L7）] ── 既知パターン遮断
  │
  ▼
[NACL（L4）] ── サブネット境界
  │
  ▼
[Security Group（L4）] ── インスタンス境界
  │
  ▼
[ホストFW（iptables）] ── OS層
  │
  ▼
[アプリ層認証/認可]
```

各層で独立して防御。1層突破されても次で止まる設計。

## クラウドの追加サービス

- **AWS Network Firewall** — マネージド L3-L7、Suricata エンジン
- **AWS Shield** — DDoS吸収（Standardは無料、Advancedは有償）
- **GCP Cloud Armor** — WAF + DDoS
- **Azure Firewall** — マネージド ステートフルFW

## トラブルシューティング

```bash
# AWS SG確認
aws ec2 describe-security-groups --group-ids sg-xxxxx
aws ec2 describe-network-acls --network-acl-ids acl-xxxxx

# Linux で どのルールが当たるか
sudo iptables -L -n -v --line-numbers

# 接続できないときの切り分け
# 1. ホストへの ping（ICMP許可されてれば）
ping target

# 2. ポート単位の到達性
nc -zv target 443
nmap -p 443 target

# 3. 自分側からどこまで行けてるか
traceroute -p 443 -T target
```

ありがちな問題：

- **「セキュリティグループ通したのに繋がらない」** → NACL忘れ、ルートテーブル忘れ、ホストFW忘れ
- **「PingはOKだけどHTTPNG」** → ICMPは許可してるがTCPの該当ポートが閉じてる
- **「リージョン跨ぎ通信NG」** → VPC Peering / Transit Gateway 設定漏れ
- **「接続が突然切れる」** → idle timeout（NLBは350秒、ALBは60秒等）、コネクション再作成

## 関連MOC

- [[MOC Security]]
- [[MOC Learning]]
- [[MOC AWS]]

## 関連ノート

- [[インフラエンジニア学習ロードマップ]]
- [[OSI参照モデルとTCPIP]]
- [[ルーティングとスイッチング]]
- [[AWSセキュリティ実装]]
- [[ゼロトラストとネットワーク基礎]]
