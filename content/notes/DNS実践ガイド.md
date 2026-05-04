---
tags: [inbox, learning]
created: 2026-04-26
aliases:
  - DNS
  - Route 53
  - 名前解決
---

# DNS実践ガイド

> [!summary]
> 「**人が読める名前**」を「**マシンが使うIPアドレス**」に変換する仕組み。インターネットの根幹。レコード種別、TTL、再帰問合せ、トラブル時の dig コマンド、AWSのRoute 53。**「DNSが原因」のトラブルは多すぎる**ので必須知識。

## DNSの基本構造

階層構造のツリー：

```
.（ルート）
├ com
│  ├ example.com
│  │  ├ www.example.com
│  │  └ api.example.com
│  └ google.com
├ jp
│  └ co.jp
│     └ example.co.jp
└ ...
```

ドメイン名は右から左に読む（FQDN：`www.example.com.` の最後のドットがルート）。

## 名前解決の流れ（再帰問合せ）

```
1. クライアント:
   www.example.com を教えて → ローカル DNS リゾルバ（ISP/8.8.8.8/Cloudflare 1.1.1.1 等）

2. リゾルバ:
   . （ルート）→ com の権威サーバはどこ？

3. リゾルバ:
   com 権威 → example.com の権威サーバはどこ？

4. リゾルバ:
   example.com 権威 → www のIPは？

5. example.com 権威:
   192.0.2.1

6. リゾルバ → クライアント:
   192.0.2.1
```

これを「**反復問合せ**」と呼び、リゾルバがその結果を**キャッシュ**して、次回からは即答。

## 主要なレコード種別

| 種別 | 用途 | 例 |
|---|---|---|
| **A** | ドメイン → IPv4 | `www.example.com → 192.0.2.1` |
| **AAAA** | ドメイン → IPv6 | `www.example.com → 2001:db8::1` |
| **CNAME** | 別名 | `www → example.com.` |
| **NS** | 権威ネームサーバの指定 | `example.com NS ns1.dns-provider.com` |
| **MX** | メール送信先 | `example.com MX 10 mail.example.com` |
| **TXT** | 任意テキスト（SPF/DKIM/検証用） | `example.com TXT "v=spf1 include:_spf.example.com -all"` |
| **PTR** | IP → ドメイン（逆引き） | `1.2.0.192.in-addr.arpa PTR www.example.com.` |
| **SRV** | サービスディスカバリ | `_sip._tcp SRV 10 60 5060 sipserver.example.com` |
| **CAA** | 証明書発行可能なCAを指定 | `example.com CAA 0 issue "letsencrypt.org"` |
| **ALIAS / ANAME** | CNAMEのZone Apex版（プロバイダ独自） | （AWS Route 53のAliasレコード） |

## CNAME と A の違い・ハマりどころ

- **CNAME** は別名レコード。問い合わせると「これにいけ」と転送されて、次の問い合わせでIPを取る
- **CNAMEはZone Apex（example.com 自体）には使えない**（RFC違反になる）
- **AWS Route 53 の Alias** はZone Apexでも使える独自拡張。ALB/CloudFrontを `example.com` に直接当てられる

## TTL（Time To Live）

レコードの**キャッシュ有効期間**（秒）：

- 短い（60秒等）= 変更が早く反映される、DNS問い合わせ増えてコスト増
- 長い（86400秒 = 1日）= 安定運用、変更時に切替遅延

切り替え予定の前にTTLを下げる（**事前に300秒に下げて2日待つ → 切替**）のが定石。

## ネガティブキャッシュ

「存在しない」も SOA レコードのminimum値でキャッシュされる。間違って消したレコードを直しても、ネガティブキャッシュで見つからない時間が続くことがある。

## DNS実装ソフトウェア

| ソフト | 用途 |
|---|---|
| **BIND** | 老舗、オンプレ権威/再帰両方 |
| **PowerDNS** | DBバックエンド対応 |
| **Unbound** | 再帰専用、軽量 |
| **dnsmasq** | 小規模、家庭用ルーター内蔵が多い |

## クラウドDNSサービス

| サービス | 特徴 |
|---|---|
| **AWS Route 53** | 高可用性、Alias レコード、ヘルスチェック、ジオロケーション |
| **Cloudflare DNS** | 高速、無料枠厚い、`1.1.1.1` の運営元 |
| **Google Cloud DNS** | Google基盤 |
| **Azure DNS** | Azure基盤 |

## DNSセキュリティ

### DNSSEC

レコードに署名を付けて改ざん検知。最近は普及進行中。

### DNS over HTTPS (DoH) / DNS over TLS (DoT)

DNS問い合わせ自体を暗号化。盗聴・改ざん防止。

### DNSレベルのフィルタリング

- マルウェアドメインをブロック（Cloudflare Gateway、Cisco Umbrella 等）
- 子供向けフィルタ（OpenDNS Family Shield）

## トラブル時の dig コマンド

```bash
# 基本
dig example.com

# 特定のレコード種別
dig example.com A
dig example.com MX
dig example.com TXT
dig example.com NS

# 権威サーバに直接問い合わせ
dig example.com @ns1.dns-provider.com

# 短い出力
dig +short example.com

# 全部の経路を見る（再帰問合せ追跡）
dig +trace example.com

# DNSSEC
dig example.com +dnssec

# 逆引き
dig -x 192.0.2.1
```

`nslookup` でも同じことができるが、`dig` の方が情報量多く実用的。

## ありがちなDNSトラブル

- **「設定したのに反映されない」** → TTLが長い、もしくはNSレコード変更直後でグローバル伝播待ち（最大48h）
- **「キャッシュされてる古い値が見える」** → `sudo systemd-resolve --flush-caches`、ブラウザキャッシュもクリア
- **「CNAMEが効かない」** → Zone Apexで使ってる、または CNAMEと他のレコード混在
- **「メールが届かない」** → MX/SPF/DKIM/DMARC のいずれかミス
- **「証明書発行できない」** → CAAレコードで該当CAが許可されてない
- **「DNS over HTTPSをONにしたら社内DNSが効かない」** → DoH優先で社内ゾーンが見えない

## SPF / DKIM / DMARC（メール認証）

メール用TXTレコード3点セット。**実装しないとメールが迷惑判定される時代**：

- **SPF**：このドメインから送るサーバはこれ、と公開
- **DKIM**：メールに署名、改ざん検知
- **DMARC**：SPF/DKIMの結果を踏まえた処理ポリシー（reject/quarantine/none）

```
example.com.            TXT "v=spf1 include:_spf.google.com -all"
default._domainkey.example.com. TXT "v=DKIM1; k=rsa; p=MIGf..."
_dmarc.example.com.     TXT "v=DMARC1; p=reject; rua=mailto:postmaster@example.com"
```

## ルートの13本のサーバ

DNS の頂点には **13個の論理ルートサーバ**（`a.root-servers.net.` 〜 `m.root-servers.net.`）。実体はAnycastで世界数百拠点に分散。

ICANN が管理、ルートゾーンファイルがインターネットの「真実」。

## 関連MOC

- [[MOC Learning]]
- [[MOC AWS]]

## 関連ノート

- [[インフラエンジニア学習ロードマップ]]
- [[OSI参照モデルとTCPIP]]
- [[ゼロトラストとネットワーク基礎]]
- [[ネットワークトラブルシューティング]]
