---
tags: [done, moc]
created: 2026-04-19
auto-generated: 2026-05-05
aliases:
  - MOC AWS
---

# MOC AWS

> [!summary]
> AWS 全冠で得た知識を陳腐化させないための地図。サービス別の使い分け、ネットワーク・コンテナ・コスト・セキュリティ運用、最新アップデートの追跡を一覧化する。

## なぜこのMOCがあるか

AWS は資格を取った時点と現在で、サービス構成・ベストプラクティス・コスト最適手法が変わり続ける。資格知識を「過去の点」で終わらせず、現役の実装能力に保つために、ここに学んだことを集約する。クラウドベンダ選定や個別サービスの設計判断は他クラウド比較も含めて整理する。

## クラウド全般 / 比較

- [[クラウドの基礎概念]] — IaaS/PaaS/SaaS、責任共有モデル、リージョン・AZ
- [[AWSとGCPとAzureの比較]] — 強み・弱み・選定軸
- [[クラウドコスト管理とFinOps]] — タグ設計、Savings Plans、コスト可視化

## ネットワーク

- [[IPアドレスとサブネット]] — VPC設計の前提
- [[OSI参照モデルとTCPIP]]
- [[DNS実践ガイド]] — Route 53、ACM、ホスト名運用
- [[ファイアウォールとネットワークACL]] — Security Group / NACL の設計
- [[負荷分散とロードバランサー]] — ALB / NLB / GWLB の選定
- [[ルーティングとスイッチング]]
- [[トンネルの分類と定義]] — VPN / Direct Connect / Transit Gateway
- [[プロキシとリバースプロキシ]]
- [[ネットワークトラブルシューティング]]
- [[ゼロトラストとネットワーク基礎]] — IAM Identity Center、VPC Lattice 等

## コンピュート / コンテナ

- [[ECSとEKSの選び方]] — Fargate / EC2、運用負荷とコスト
- [[Kubernetes基礎]] — EKS の前提知識
- [[コンテナとKubernetesセキュリティ]] — IRSA、Pod Security、imageスキャン
- [[IaCとTerraform基礎]] — CloudFormation との比較含む

## セキュリティ

- [[AWSセキュリティ実装]] — IAM、KMS、Security Hub、GuardDuty、CloudTrail
- [[シークレット管理]] — Secrets Manager / Parameter Store
- [[認証と認可]] — Cognito、IAM Identity Center、SSO設計
- [[暗号の基礎]] — KMS の正しい使い方
- [[S3 暗号化方式と CMK 移行戦略]] — SSE-S3/SSE-KMS/CMK の使い分けと既存データ移行手順
- [[インフラセキュリティ運用]]
- [[セキュリティロギング設計]] — CloudWatch Logs、Athena、Security Lake

## 可観測性 / 運用

- [[システム監視と可観測性]] — CloudWatch、X-Ray、OTel連携
- [[Linuxパフォーマンス計測]]
- [[Linuxサーバー運用基礎]]
- [[SSH実運用]] — Session Manager、踏み台レス運用

## 開発支援 / SRE

- [[インフラエンジニア学習ロードマップ]]
- [[インシデントレスポンス]] — Runbook、Game Day

## 関連MOC

- [[MOC Learning]]
- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Observability]]
- [[MOC Home]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-05）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
