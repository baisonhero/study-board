---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Cloud-Native Application Protection Platform
---

# CNAPP

> [!summary]
> **CNAPP (Cloud-Native Application Protection Platform)** は Gartner が提唱したクラウドセキュリティの統合カテゴリ。バラバラに存在していた [[CSPM]]（設定監査） / [[IaC Scanning]] / CWPP（ワークロード保護） / CIEM（権限分析） / コンテナ・Kubernetesセキュリティを **1プラットフォームで** 提供する。代表ベンダーは [[Wiz]] / Palo Alto Prisma Cloud / Microsoft Defender for Cloud / Lacework / Orca Security など。

## 統合される機能

- **CSPM**: AWS/Azure/GCP の構成ドリフト・コンプライアンス監査（[[CSPM]] 参照）
- **CWPP (Cloud Workload Protection)**: VM/コンテナ/サーバーレスのランタイム保護
- **CIEM (Cloud Infrastructure Entitlement Management)**: IAM 権限の最小化分析
- **IaC Scanning**: Terraform / CloudFormation のデプロイ前検査（[[IaC Scanning]] 参照）
- **Container & Kubernetes Security**: イメージ脆弱性・admission control
- **Data Security Posture Management (DSPM)**: クラウドに散らばるPII・機密データの位置と権限の可視化
- **Attack Path Analysis**: 「インターネット → 公開コンテナ → RDS の admin 権限」のような攻撃チェーンを自動発見

## なぜ統合されているか

クラウド攻撃の現実は **「IAMの過剰権限 + 公開ストレージ + 古いコンテナ脆弱性」が連鎖して起きる**。個別ツールが各レイヤーを別々に警告しても、**最終的な侵害経路**は見えない。CNAPP は全レイヤーのデータを1つのグラフ DB に入れ、「インターネット到達可能で、かつ、特権IAMロールを持ち、かつ、未パッチのCVEがある」という3条件を満たす資産を**1クエリで**特定する。

## 主要ベンダー比較

| ベンダー | 特徴 |
|---|---|
| **[[Wiz]]** | エージェントレス（クラウドAPIだけで分析）が看板。グラフUIが強い |
| Prisma Cloud (Palo Alto) | 旧 Twistlock を取り込んだ統合。エージェントあり |
| Orca Security | SideScanning™ でディスクスナップショットからスキャン |
| Defender for Cloud | Azure ネイティブだが AWS/GCP もカバー |
| Lacework | データ駆動の異常検知が売り |
| Aqua | コンテナ・K8s中心 |

## エージェントレス vs エージェント

- **エージェントレス**: ベンダーがクラウドAPI（AWS Read権限）でデータを取得。導入が早い、運用が軽い、しかしランタイム検知は浅い
- **エージェント**: ホストにDaemonSet等を入れる。ランタイムの異常プロセスやファイル変更まで検知できるが、導入と維持が重い

最近は **エージェントレスで広く + クリティカル資産のみエージェント** のハイブリッドが主流。

## ZTA との関係

[[ゼロトラストとネットワーク基礎]] の "Assume Breach" モデルでは、侵入された前提で **最小権限・ラテラルムーブ防止** が必要。CNAPP の CIEM 機能はこの「最小権限の維持」を継続的に検証する役割を担う。

## 出典

- Gartner CNAPP Market Guide: https://www.gartner.com/en/documents/cnapp
- Wiz: https://www.wiz.io/
- AWS Security blog: https://aws.amazon.com/blogs/security/

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC AWS]]

## 関連ノート

- [[CSPM]]
- [[IaC Scanning]]
- [[Wiz]]
- [[AWSセキュリティ実装]]
- [[コンテナとKubernetesセキュリティ]]
- [[インフラセキュリティ運用]]
- [[ゼロトラストとネットワーク基礎]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
