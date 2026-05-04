---
tags: [inbox, learning]
created: 2026-04-26
aliases:
  - FinOps
  - クラウドコスト
  - コスト最適化
---

# クラウドコスト管理とFinOps

> [!summary]
> クラウドは「**従量課金 = 油断するとコスト爆発**」する。タグ戦略・予算アラート・観測ツール・予約購入。FinOps はクラウド時代の財務×運用×経営の協働文化。AWS全冠でも実運用での節約術は別スキル。

## クラウドコストの構造

主な課金軸：

- **コンピュート時間**（EC2 等の起動時間）
- **ストレージ容量**（S3、EBS等のGB-月）
- **データ転送**（特に egress、リージョン間、AZ間も少々）
- **API呼び出し回数**（DynamoDB、API Gateway等）
- **マネージドサービスの使用量**（Lambda 実行時間、CloudWatch ログ取込量）
- **ライセンス**（Windows Server、SQL Server 等）

「**インスタンスを停止しても EBS は課金される**」「**Elastic IP は未使用時に課金される**」のような細かい罠が多い。

## コスト爆発の典型パターン

### 1. ログ・メトリクス取り込み量

CloudWatch Logsは**取り込み量で課金**（GB単位）。デバッグログを INFO で全部出すと月数万円〜数十万円に：

- INFO レベルを WARN に上げる
- ログをサンプリング
- 重要でないものは S3 直接送信（CloudWatchに通さない）

### 2. NAT Gateway

意外と高い（時間+処理量）。Private SubnetのLambda が S3 を NAT 経由で叩いてた、的なやつ：

- **VPC Endpoint** を使う（S3、DynamoDBは無料、他は時間+データ転送）
- AZごとに必要、マルチAZだと×AZ数
- 開発環境では NAT を 1AZ集約も検討

### 3. データ転送（特にクロスリージョン・egress）

- 同一AZ内：通常無料
- 同一リージョン内別AZ：1GB あたり数円
- リージョン間：10円〜
- インターネットへの egress：CDN通さないと高い

VPC Peering / Transit Gateway も時間+転送量。

### 4. 放置リソース

- **使われていないEBS Volume**（インスタンス削除時に detach されただけ）
- **古いSnapshot**（自動削除設定なし）
- **未使用Elastic IP**（時間課金）
- **テスト用のRDS**（小さくても月数千円〜）
- **古い AMI / EBS Snapshot**

「使ってないから0円」と思いきや、課金は続いてる。**定期棚卸し**が重要。

### 5. 想定外のスケール

- バグループでLambda が無限呼び出し
- DynamoDB のオンデマンドで突発スパイク
- DDoSで CloudFront / API Gateway リクエスト爆増（CloudFront の DDoS 課金は AWS Shield で軽減可）

→ **必ずアラート**。

## タグ戦略（最重要）

リソースに**メタデータタグ**を付与してコスト分析の軸にする：

| タグキー | 値の例 |
|---|---|
| `Environment` | `dev` / `staging` / `prod` |
| `Owner` | `team-platform` / `team-frontend` |
| `Project` | `customer-portal` / `internal-admin` |
| `CostCenter` | `engineering` / `data` |
| `ManagedBy` | `terraform` / `manual` |

### 自動タグ付け

- Terraform `default_tags` で全リソース統一
- AWS Organizations の **Tag Policy** で必須タグを強制
- AWS Config Rule で「タグ無しリソース」を検知

### コスト配分タグ

タグをアクティブ化して、**Cost Explorer / Cost and Usage Report**でフィルタ・グルーピング可能に：

```bash
# Cost Allocation Tags をactive化（Billingコンソール）
```

## 予算とアラート

### AWS Budgets

```
- 月次予算（金額・使用量）
- 80%、100%、120% でアラート
- SNS / Email / Slack（Webhook経由）
- アクション（IAMユーザー無効化、EC2停止）も自動化可能
```

設計の例：
- **総額アラート**：月10万円超で通知
- **サービス別**：EC2 が3万円超で通知
- **タグ別**：`Environment=dev` が1万円超で通知（dev環境放置検知）

### Anomaly Detection

機械学習で「**いつもと違う使い方**」を自動検知。AWS Cost Anomaly Detection が無料枠で利用可能。

## 価格モデルと割引

### EC2 / VM の場合

| モデル | 割引率 | 制約 |
|---|---|---|
| **On-Demand** | 0%（基準） | なし |
| **Spot Instance** | 最大90%off | 中断あり、中断耐性必要 |
| **Reserved Instance** | 最大72%off | 1年/3年確約、リージョン/インスタンスタイプ固定 |
| **Savings Plans** | 最大72%off | 1年/3年確約、より柔軟（Compute SP はサービス跨げる） |

**Compute Savings Plans** はFargate / Lambdaにも効くので、サーバレスシフトしてても割引が乗る。

### サーバーレスのコスト感

- Lambda：1M回呼び出し $0.20 + 実行時間
- DynamoDB On-Demand：100万Read $0.285、100万Write $1.4225
- API Gateway：100万リクエスト $3.5（HTTP API は $1.0）

「呼び出し数が分かれば積算可能」なのがサーバーレスの利点。**爆発したら止める**仕組みは必須。

### S3 ストレージクラス

| クラス | 用途 | 料金（GB-月）目安 |
|---|---|---|
| Standard | 頻繁アクセス | $0.023 |
| Intelligent-Tiering | アクセス頻度自動切替 | $0.023〜 |
| Standard-IA | 月1未満アクセス | $0.0125 |
| One Zone-IA | 1AZ、安価 | $0.01 |
| Glacier Instant | 月1未満、即時取得 | $0.004 |
| Glacier Flexible | 数分〜数時間後取得 | $0.0036 |
| Glacier Deep Archive | 数時間後取得 | $0.00099 |

**ライフサイクルポリシー**で自動移行：30日後にIA、90日後にGlacier、365日後に削除、等。

## 観測ツール

### AWS純正

- **Cost Explorer** — 月次/日次/時間別の可視化、フィルタ、予測
- **Cost and Usage Report (CUR)** — S3に詳細CSV、Athena/Redshiftで集計
- **Compute Optimizer** — EC2/EBS/Lambdaのリソース過不足の推奨
- **Trusted Advisor** — 未使用 EIP、Idle EC2、低稼働 RDS等を提案

### サードパーティ

- **Vantage**（FinOps向け、複数クラウド対応）
- **Cloudability** / **CloudHealth** — 大企業向け
- **Spot.io**（旧 Spotinst）— Spot/RI最適化自動化
- **Infracost** — Terraform PRでコスト差分表示

### OSS

- **CloudCustodian** — ポリシー定義でコスト関連の自動化（タグなしリソース停止等）
- **AWS Nuke** — 全リソース削除（dev環境クリーンアップ）

## FinOps とは

Finance × DevOps × Engineering の協働文化：

### 3フェーズ

1. **Inform**（可視化）：誰が何をいくら使ってるかを見える化
2. **Optimize**（最適化）：無駄を削減、構成見直し
3. **Operate**（継続運用）：仕組みとして組織に定着

### 役割分担

- **エンジニア**：コスト効率の良いアーキテクチャ、不要リソース削除
- **財務**：予算とポリシー、KPI設計
- **経営**：投資判断、ベンダー交渉

### KPI の例

- **コスト/ユーザー**（unit economics）
- **コスト/トランザクション**
- **コスト効率改善率**
- **タグ付き率**（カバレッジ）

## 個人開発の現実的な節約

1. **無料枠の徹底活用** — AWS、GCP、Cloudflareの無料枠でかなりカバー
2. **dev環境は終業時に止める** — Lambda 関数で深夜にEC2停止
3. **Spot活用** — バッチ・CI ランナーは Spot で90% off
4. **タグ強制** — `Owner=alice` 必須に
5. **予算アラート** — 月$50超で通知
6. **NATをVPC Endpointに** — S3/DynamoDB のような頻出サービスは Endpoint
7. **CloudWatch Logsの保存期間** — デフォルト「never expire」を 7〜30日に
8. **Snapshots / AMIの世代管理** — Lifecycle Manager で自動削除
9. **Vercel/Supabase の Free tier 上限** — 個人事業ならまず無料枠で

## 関連MOC

- [[MOC Learning]]
- [[MOC DevSecOps]]
- [[MOC Business]]

## 関連ノート

- [[インフラエンジニア学習ロードマップ]]
- [[クラウドの基礎概念]]
- [[AWSとGCPとAzureの比較]]
- [[IaCとTerraform基礎]]
- [[システム監視と可観測性]]
