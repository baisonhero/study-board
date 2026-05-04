---
tags: [inbox, learning]
created: 2026-04-26
aliases:
  - AWS vs GCP vs Azure
  - クラウド比較
---

# AWSとGCPとAzureの比較

> [!summary]
> 主要3クラウドの「**得意分野**」と「**サービス対応表**」。AWS全冠保持を土台に、GCPとAzureの主要サービスをマッピングして頭に入れる。マルチクラウド環境や転職・案件選びで実用的。

## 全体的な棲み分け

| 観点 | AWS | GCP | Azure |
|---|---|---|---|
| シェア | 1位 | 3位 | 2位 |
| 強み | **サービス幅、成熟度、コミュニティ** | **データ/ML、ネットワーク、UI/UX** | **エンタープライズ、Microsoft連携** |
| 弱み | UIの古さ、複雑な価格 | 地域カバー、エンタープライズ機能 | クセが強い、ドキュメント |
| 主要顧客 | スタートアップ〜大企業まで広い | テック系、データ系 | 大企業、Microsoft文化 |
| 文化 | "Working Backwards"、機能優先 | "Site Reliability"、シンプル | エンタープライズフレンドリー |

## 主要サービス対応表

### コンピュート

| 用途 | AWS | GCP | Azure |
|---|---|---|---|
| 仮想マシン | **EC2** | **Compute Engine** | **Virtual Machines** |
| マネージドコンテナ | **ECS / Fargate** | **Cloud Run** | **Container Instances / Container Apps** |
| マネージドK8s | **EKS** | **GKE** | **AKS** |
| FaaS | **Lambda** | **Cloud Functions / Cloud Run** | **Functions** |
| PaaS | **Elastic Beanstalk** | **App Engine** | **App Service** |

### ストレージ

| 用途 | AWS | GCP | Azure |
|---|---|---|---|
| オブジェクト | **S3** | **Cloud Storage** | **Blob Storage** |
| ブロック | **EBS** | **Persistent Disk** | **Managed Disks** |
| ファイル共有 | **EFS** | **Filestore** | **Files** |
| アーカイブ | **S3 Glacier** | **Coldline / Archive** | **Cool / Archive Tier** |

### データベース

| 用途 | AWS | GCP | Azure |
|---|---|---|---|
| マネージドRDB | **RDS / Aurora** | **Cloud SQL / AlloyDB** | **Azure Database** |
| グローバルRDB | **Aurora Global** | **Spanner** | **Cosmos DB (SQL API)** |
| NoSQL | **DynamoDB** | **Firestore / Bigtable** | **Cosmos DB (NoSQL API)** |
| キャッシュ | **ElastiCache (Redis/Memcached)** | **Memorystore** | **Cache for Redis** |
| データウェアハウス | **Redshift** | **BigQuery** | **Synapse Analytics** |

> [!info] BigQuery が GCP の代名詞的存在
> サーバーレスでペタバイト級を扱えるDWH。データ系プロジェクトでGCPが選ばれる主な理由。AWSの Athena + Redshiftより設計がシンプル。

### ネットワーキング

| 用途 | AWS | GCP | Azure |
|---|---|---|---|
| 仮想ネットワーク | **VPC** | **VPC**（グローバル） | **Virtual Network** |
| LB（L7） | **ALB** | **Cloud Load Balancing**（HTTP(S)） | **Application Gateway** |
| LB（L4） | **NLB** | **Cloud Load Balancing**（TCP/UDP） | **Load Balancer** |
| CDN | **CloudFront** | **Cloud CDN** | **Front Door / CDN** |
| DNS | **Route 53** | **Cloud DNS** | **DNS / Traffic Manager** |
| 専用線 | **Direct Connect** | **Cloud Interconnect** | **ExpressRoute** |
| VPN | **Site-to-Site VPN / Client VPN** | **Cloud VPN** | **VPN Gateway** |

> [!info] GCP のグローバルVPC
> AWS/Azure はリージョン単位のVPCだが、**GCP の VPC はグローバル**。サブネットがリージョンを跨げる。マルチリージョン構成でメリット大きい。

### セキュリティ・IAM

| 用途 | AWS | GCP | Azure |
|---|---|---|---|
| ID管理 | **IAM** | **IAM / Cloud Identity** | **Entra ID（旧Azure AD）** |
| シークレット | **Secrets Manager / SSM Parameter Store** | **Secret Manager** | **Key Vault** |
| 鍵管理 | **KMS** | **Cloud KMS** | **Key Vault** |
| WAF | **AWS WAF** | **Cloud Armor** | **Web Application Firewall** |
| 脅威検知 | **GuardDuty** | **Security Command Center** | **Defender for Cloud** |
| 設定監査 | **Config** | **Config Validator / Asset Inventory** | **Policy** |
| SIEM統合 | **Security Hub** | **Chronicle / SCC** | **Sentinel** |

### 監視・観測性

| 用途 | AWS | GCP | Azure |
|---|---|---|---|
| メトリクス | **CloudWatch** | **Cloud Monitoring** | **Monitor / Metrics** |
| ログ | **CloudWatch Logs** | **Cloud Logging** | **Log Analytics / Monitor** |
| トレース | **X-Ray** | **Cloud Trace** | **Application Insights** |
| プロファイリング | **CodeGuru Profiler** | **Cloud Profiler** | **Application Insights Profiler** |
| エラー追跡 | **CodeGuru Reviewer** | **Error Reporting** | **Application Insights** |

### CI/CD・開発

| 用途 | AWS | GCP | Azure |
|---|---|---|---|
| Git | **CodeCommit** | **Source Repositories** | **Repos** |
| ビルド | **CodeBuild** | **Cloud Build** | **Pipelines** |
| デプロイ | **CodeDeploy** | **Cloud Deploy** | **Pipelines** |
| パイプライン統合 | **CodePipeline** | **Cloud Build (組合せ)** | **DevOps Pipelines** |
| Artifactレジストリ | **ECR / CodeArtifact** | **Artifact Registry** | **Container Registry / Artifacts** |

> [!tip] 多くの組織は GitHub Actions / GitLab CI を使う
> クラウド純正のCI/CDはあまり使われず、GitHub Actions や GitLab CI、CircleCIから各クラウドへデプロイするパターンが一般的。

### AI / ML

| 用途 | AWS | GCP | Azure |
|---|---|---|---|
| ML プラットフォーム | **SageMaker** | **Vertex AI** | **Machine Learning** |
| AI API | **Rekognition / Comprehend / Polly 等** | **Vision API、Translation 等** | **Cognitive Services** |
| 生成AI（マネージド） | **Bedrock** | **Vertex AI** | **OpenAI Service** |

### メッセージング

| 用途 | AWS | GCP | Azure |
|---|---|---|---|
| キュー | **SQS** | **Pub/Sub（pull）** | **Service Bus** |
| Pub/Sub | **SNS** | **Pub/Sub** | **Event Grid / Service Bus** |
| ストリーム | **Kinesis** | **Pub/Sub Lite / Dataflow** | **Event Hubs** |

## 価格モデルの違い

| 観点 | AWS | GCP | Azure |
|---|---|---|---|
| 単位課金 | 秒/リクエスト/GB | 秒/リクエスト/GB | 秒/リクエスト/GB |
| 自動割引 | Savings Plans / Reserved | **Committed Use Discounts**、**Sustained Use Discount（自動）** | Reserved Instances |
| 無料枠 | 12ヶ月限定 + Always Free 部分的 | $300の3ヶ月クレジット + Always Free 厚め | $200のクレジット + 12ヶ月 |
| Spot/プリエンプティブ | Spot | **Preemptible / Spot** | Spot |
| 計算ツール | Pricing Calculator | Pricing Calculator | Pricing Calculator |

GCP の **Sustained Use Discount** は自動適用なので予約不要。シンプル。

## 各社の文化と理念の差

### AWS

- **小さくリリースして拡大**：機能リリースが早い、最初は粗削り
- **顧客主導**："Working Backwards" でプレスリリースから設計
- **疎結合・APIファースト**：単一サービスはシンプル、組み合わせで複雑

### GCP

- **エンジニア文化**：Site Reliability Engineering（SRE）の発祥
- **シンプル設計**：Spanner、BigQuery のような統合的な強力サービス
- **OSS 親和性**：Kubernetes、Istio、TensorFlow が GCP発祥

### Azure

- **エンタープライズフレンドリー**：Active Directory、Office 365 連携
- **ハイブリッド重視**：Azure Arc でオンプレも統合管理
- **ライセンス優遇**：Microsoftライセンスが既にある組織で割引

## 選び方の指針

### こういう時はAWS

- スタートアップ初期で機能の幅が欲しい
- 求人の選択肢が多い、業界スキルとして潰しが効く
- AWS全冠保持なら学習コスト低い

### こういう時はGCP

- データ分析がコア（BigQuery）
- ML / 生成AIで Google技術が必要（PaLM、Gemini系）
- グローバルVPCが欲しい
- Kubernetesが中心（GKEは最も成熟）

### こういう時はAzure

- 既にMicrosoft 365、Active Directoryを使ってる
- Windowsサーバー / .NET ベースの資産がある
- 既存ライセンスでコスト最適化できる
- OpenAI モデルを企業として使いたい

### こういう時はCloudflare

- エッジでの処理がコア
- DNS + CDN + WAF + ZTNA を統合運用したい
- 無料枠で副業や個人開発

## 学習リソース

- AWS：AWSの試験ガイド + 公式ドキュメント
- GCP：[Google Cloud Skills Boost](https://www.cloudskillsboost.google/)（旧 Qwiklabs）でハンズオン
- Azure：[Microsoft Learn](https://learn.microsoft.com/training/) で無料学習パス

各クラウドに**公式の対応表ドキュメント**もあり：
- [AWS to Azure services comparison](https://learn.microsoft.com/azure/architecture/aws-professional/services)
- [GCP for AWS Professionals](https://cloud.google.com/docs/get-started/aws-azure-gcp-service-comparison)

## 関連MOC

- [[MOC Learning]]
- [[MOC AWS]]

## 関連ノート

- [[インフラエンジニア学習ロードマップ]]
- [[クラウドの基礎概念]]
- [[AWSセキュリティ実装]]
- [[IaCとTerraform基礎]]
- [[クラウドコスト管理とFinOps]]
