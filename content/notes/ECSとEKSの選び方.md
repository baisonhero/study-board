---
tags: [inbox, learning]
created: 2026-04-26
aliases:
  - ECS vs EKS
  - AWS コンテナ選択
  - Fargate
---

# ECSとEKSの選び方

> [!summary]
> AWSでコンテナを動かす時の最大の選択。**ECS = AWS独自のシンプル、EKS = Kubernetes標準で多機能・複雑**。決め手は「**Kubernetesのエコシステムが必要か**」「**運用負荷をどこまで取れるか**」「**ロックインを許容できるか**」の3軸。

## 選択肢の全体像

AWS 上でコンテナを動かす方法は1つではない：

| サービス | 概要 |
|---|---|
| **ECS on EC2** | AWS純正オーケストレータ、ノードを自分で管理 |
| **ECS on Fargate** | ECS のサーバーレス版、ノード管理不要 |
| **EKS on EC2** | マネージドK8s、ワーカーは自分管理 |
| **EKS on Fargate** | マネージドK8s、Pod もサーバーレス |
| **App Runner** | URL一発デプロイ、Heroku/Vercel風 |
| **Lambda（コンテナイメージ）** | FaaS、最大15分、最大10GB |
| **Elastic Beanstalk** | レガシー、新規利用は非推奨 |

「ECS or EKS」だけが選択肢ではないが、**プロダクション寄りなら主にこの2つ**。

## ECS とは

AWS純正のコンテナオーケストレータ。Kubernetesとは別物の、もっとシンプルな仕組み：

- **Task Definition**：コンテナの構成（K8sのPod相当）
- **Service**：Taskを維持・スケールする（K8sのDeployment相当）
- **Cluster**：論理的なグループ
- **Task / Service** が ECSの主な概念で、これだけで動く

VPC、ALB、IAM、CloudWatchとそのまま統合される。**「AWS全体の一機能」として作られてる**ので、AWS知識がそのまま使える。

## EKS とは

AWSが提供する**マネージドKubernetes**。Control Plane（API Server、etcd等）をAWSが管理してくれて、自分は Worker Nodes（または Fargate）だけ気にすればいい。

- 中身は素のKubernetes（CNCF認定のupstream互換）
- Helm、Operator、CRD など**Kubernetesエコシステムが全部使える**
- AWSへの統合は**自分で組む**部分が多い（Add-on、IRSA、ALB Controller、CSI Driver等）

## 比較表

| 観点 | ECS | EKS |
|---|---|---|
| **学習コスト** | 低（数日〜1週間） | 高（数週間〜数ヶ月、K8s全般を学ぶ必要） |
| **AWSへの統合** | ◎ ネイティブ | ○ Add-on/Controller経由 |
| **マルチクラウド対応** | × AWS専用 | ◎ K8s標準 |
| **エコシステム** | 限定的（AWSサービス中心） | 巨大（Helm、Operator、Service Mesh等） |
| **運用負荷** | 低 | 中〜高（K8s自体のメンテ必要） |
| **コスト（Control Plane）** | 無料 | $0.10/時間 ≈ 月$73 |
| **デプロイ複雑度** | シンプル | 複雑（YAML多数、Helm、CD ツール） |
| **求人/採用** | AWS知識でカバー可 | K8s知識が必要 |
| **ベンダーロックイン** | 強い（移行困難） | 弱い（K8sマニフェストは持ち運べる） |
| **スケール上限** | 大規模に十分 | 大規模に十分 |
| **ステートフルワークロード** | 弱い（StatefulSet 相当なし） | 強い（StatefulSet、Operator） |
| **バッチ・Job 系** | EventBridge + Task で可、限定的 | Job/CronJobネイティブ、Argo Workflows等 |
| **Service Mesh** | App Mesh（限定的） | Istio、Linkerd、AWS App Meshなど豊富 |
| **GitOps（CD）** | CodePipeline、限定的 | ArgoCD / Flux などK8s標準ツール |
| **Day 2 Ops** | 楽 | 知識と監視の手間が大きい |

## ECSを選ぶべきケース

### こんな時はECS

1. **チームに K8s経験者がいない、またはチームが小さい**
   → 学習コストとオペレーション負荷が割に合わない
2. **AWS のみで完結する予定**
   → マルチクラウド計画なし
3. **コンテナを軽く動かしたい**（Webアプリ、API、ワーカー）
   → 複雑なステートフル系がない
4. **AWS Native な統合が深く欲しい**
   → ALB、IAM Role、CloudWatch、Service Discovery等を素直に使いたい
5. **コスト重視**
   → Control Planeが無料、運用人件費も低い
6. **Fargateで完全サーバーレスにしたい**
   → ECS Fargateの方が EKS Fargate より安定しているという声も
7. **個人開発・スタートアップ初期**
   → MVPで時間をK8s学習に取られたくない

### ECSの強み

- **すぐ動く**：Task Definition書いてService作るだけ
- **IAM Role for Tasks**（Task単位でIAM）が自然
- **Secrets Manager / SSM Parameter Store** から直接参照可能
- **CloudWatch Logs**が標準
- **少ないナレッジで運用可能**

## EKSを選ぶべきケース

### こんな時はEKS

1. **既にK8sエコシステムを使ってる/使いたい**
   → Helm、ArgoCD、Istio、Cert-manager、External Secrets Operator 等
2. **マルチクラウド or オンプレ + AWS のハイブリッド**
   → 同じマニフェストで複数環境にデプロイ可能
3. **大規模・複雑なワークロード**
   → 数百〜数千の Pod、複雑なネットワーキング、StatefulSet
4. **K8s 前提の OSS / 商用製品を使いたい**
   → Argo Workflows、KubeFlow、Crossplane、Kubeflow、OpenSearch Operator等
5. **チームに K8sエンジニアがいる、またはK8sがコア技術**
   → 学習コストを払う価値がある
6. **Service Mesh が必要**
   → mTLS、トラフィック分割、サーキットブレイカ等を統合運用
7. **DevOps / Platform Engineering を本格的にやりたい**
   → CRD で社内独自の抽象化、Operatorで自動化

### EKSの強み

- **K8sエコシステム全部**：圧倒的な選択肢
- **GitOps文化が回しやすい**：ArgoCD/Fluxで「Gitが Truth」
- **ポータビリティ**：本番EKS、開発はkindで同じマニフェスト
- **拡張性**：CRD/Operatorで独自抽象化
- **業界での通用性**：エンジニアの市場価値・採用しやすさ
- **大規模対応の実績**：世界中のメガサービスで実証済み

## ECS vs EKS のメリット・デメリット まとめ

### ECS のメリット

- 学習コスト低い、すぐ動く
- AWSとの統合がネイティブで楽
- Control Planeコスト無料
- 運用負荷が低い（パッチ管理少ない、Add-on管理不要）
- 比較的安い

### ECS のデメリット

- ベンダーロックイン強い（他クラウドへの移行ほぼ不可能）
- エコシステムが限定的（K8s OSSの恩恵なし）
- 高度な機能で痒い所に手が届かない（StatefulSet相当、CRD等なし）
- 採用市場で「ECS」スキルだけだと選択肢狭い
- AWS新機能対応がK8sより遅いことがある

### EKS のメリット

- Kubernetesスキルがそのまま使える / 育つ
- マルチクラウドへの移行が現実的
- エコシステムの圧倒的な広さ
- Operator / CRD で複雑な要件に対応可能
- 業界標準で採用しやすい / されやすい
- ArgoCD / Flux などの GitOps 文化が組みやすい

### EKS のデメリット

- 学習コストが大きい（チームでK8sを使いこなせるまで時間）
- Control Planeに$73/月（小規模だと割高）
- 運用負荷が高い：K8sバージョン更新、Add-on管理、IRSA設定、Helm chart管理
- 「動かすだけ」に必要なYAMLが多い
- AWS統合は Add-on や Controller を入れる手間あり
- 障害時の調査範囲が広い（K8sもAWSも見る必要）

## 実務でよくあるパターン

### 「軽いものはECS、重いものはEKS」併用

組織で両方を使い分けるパターン。シンプルなWebアプリやワーカーは ECS Fargate、データパイプラインやML基盤は EKS、のような棲み分け。

### スタートアップが ECS → EKS に移行

初期は ECS で素早くMVP、規模拡大やエコシステム要件が出てきて EKS へ。マイグレーション工数は大きい（数ヶ月）。

### 大企業が ECS から離れない

「**移行コストに見合う価値がない**」という判断。ECS で十分動いているなら EKS にする必要はない、というのも合理的。

### EKSにしたが運用負荷で泣く

K8sを使いこなす前提でEKSを選んだが、専任エンジニアが居ないと管理が回らず、結局 ECS Fargate に逃げ戻すケース。**「人がついていけるか」**は最重要。

## Fargate を含めた決定木

```
コンテナ動かしたい
 │
 ├─ K8sエコシステムが必要？
 │   ├─ Yes → EKS
 │   │   ├─ ノード管理したい？
 │   │   │   ├─ Yes → EKS on EC2
 │   │   │   └─ No  → EKS on Fargate
 │   │   │
 │   │   └─ （マルチクラウド前提なら EKS 一択）
 │   │
 │   └─ No  → ECS / その他
 │       ├─ AWSに完全依存OK？
 │       │   └─ Yes → ECS
 │       │       ├─ ノード管理したい？
 │       │       │   ├─ Yes → ECS on EC2
 │       │       │   └─ No  → ECS on Fargate
 │       │       │
 │       │       └─ さらに簡単に？
 │       │           └─ Yes → App Runner
 │       │
 │       └─ サーバーレス・短時間
 │           └─ Lambda（コンテナイメージ）
```

## Fargate vs EC2 ノードの選び方

### Fargate のメリット

- ノード管理不要（パッチ・スケール）
- セキュリティ的に隔離強い（VM分離）
- 課金が秒単位で透明

### Fargate のデメリット

- 単価が高い（EC2より20〜30%）
- 利用可能インスタンスタイプ・リソースが限定的
- DaemonSet 不可（EKS on Fargate）
- Spot利用不可（割引が効かない）
- カスタムカーネルやGPU不可

### EC2 ノードのメリット

- Spot/RIで大幅割引
- カスタマイズ可能（GPU、特殊カーネル、Bottlerocket等）
- DaemonSetやhostNetwork可
- 大量Podで割安

→ **本番の主要ワークロードはEC2 + Spot/RI、補助的なバッチや突発スケール先は Fargate**、の組合せがコスト最適。

## コスト比較の例（東京リージョン、2026年想定）

| 構成 | 月額目安 |
|---|---|
| ECS Fargate（0.5vCPU/1GB × 3） | 約 $30〜50 |
| ECS on EC2（t3.medium × 1） | 約 $30〜35 |
| EKS Fargate（同上Pod数）+ Control Plane | 約 $100〜130 |
| EKS on EC2（t3.medium × 1）+ Control Plane | 約 $103〜108 |

EKSはControl Planeで$73/月の固定費がある。**小規模だとECS優位、大規模だと差は相対的に小さい**。

## 決定のための Q&A 3問

1. **Q：チームに Kubernetes に慣れた人は何人いる？**
   - 0 → ECS強推奨
   - 1〜2人 → どちらでも、選択前に学習コストを見積もる
   - 3人以上 → EKSが現実的

2. **Q：今後3年でAWS以外に出る可能性は？**
   - ほぼない → ECS でロックイン許容
   - ある → EKS（K8s標準）

3. **Q：使いたいOSSプロダクトはK8s前提？**
   - 主要OSS（Kafka Strimzi、Argo、Crossplane等）は K8s 前提
   - 「これ使いたい」がK8s前提なら EKS

3問のうち2問以上で EKSが優位 → EKS選択。そうでなければ ECS。

## 既存EKS運用での注意点

ユーザーは既にEKSプロダクトを運用中とのこと。よくある運用課題：

- **K8sバージョン更新**（年1〜2回必須、サポート期限あり）
- **Add-onバージョン管理**（VPC CNI、CoreDNS、kube-proxy）
- **IRSA**（IAM Roles for Service Accounts）の設定とローテーション
- **AWS Load Balancer Controller**の更新
- **EBS / EFS CSI Driver**の管理
- **Cluster Autoscaler / Karpenter** のチューニング
- **Pod Security Standards** の段階的適用
- **コスト最適化**：Spot利用、Karpenterによる適切なnode選択

[[コンテナとKubernetesセキュリティ]] と組み合わせて運用設計する。

## 学習リソース

- AWS公式：「Amazon ECS or EKS - Architecture Decision Guide」
- 「Kubernetes Up and Running」by Brendan Burns 他（K8s基礎）
- 「Production Kubernetes」by Josh Rosso 他（運用視点）
- AWS Workshops：[ECS Workshop](https://ecsworkshop.com/)、[EKS Workshop](https://www.eksworkshop.com/)

## 関連MOC

- [[MOC Learning]]
- [[MOC AWS]]

## 関連ノート

- [[インフラエンジニア学習ロードマップ]]
- [[Kubernetes基礎]]
- [[コンテナとKubernetesセキュリティ]]
- [[クラウドの基礎概念]]
- [[クラウドコスト管理とFinOps]]
- [[IaCとTerraform基礎]]
