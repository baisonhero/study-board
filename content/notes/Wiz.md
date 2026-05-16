---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Wiz.io
---

# Wiz

> [!summary]
> **Wiz** はイスラエル発のクラウドセキュリティスタートアップで、[[CNAPP]] 市場で急成長している商用プラットフォーム。**エージェントレス**（クラウドAPIだけで分析）、**Security Graph**（リソース・権限・脆弱性をグラフDBで関連付け）、**Attack Path Analysis**（攻撃経路の可視化）が看板機能。短期間で Fortune 500 の多数に採用され、2024年にはGoogleが過去最大級の買収提案（後に撤回）をしたことでも話題になった。

## 主な機能

- **エージェントレススキャン**: AWS / Azure / GCP のAPIから VM/コンテナ/サーバーレスを横断スキャン。**SideScanning™** でディスクスナップショットからOSS依存・[[CVE]]・シークレットを抽出
- **Security Graph**: すべての資産・IAM・脆弱性・公開設定を一つのグラフに格納
- **Attack Path Analysis**: 「インターネット公開 → 未パッチコンテナ → 過剰権限IAM → S3機密データ」のような攻撃経路を自動発見
- **CIEM**: IAM の使われていない権限を継続的に検出 → 最小権限化
- **DSPM**: クラウドに散らばる PII の位置を地図化
- **Container & Kubernetes**: ランタイム脅威検知、admission control

## なぜグラフが効くか

クラウドのリスクは **個別のアラートの集合** ではなく **連鎖** で起きる。「公開コンテナ × 未パッチCVE × 過剰IAM × 機密データ到達可能」を **同時に満たす** 資産だけが真のクリティカル。Wiz は資産関係をグラフDBに入れ、こうした条件をクエリで抽出する。アラート量を10分の1以下に絞れることが導入根拠になっている。

## 競合との比較

| ベンダー | 特徴 |
|---|---|
| **Wiz** | グラフ + エージェントレス、UXが洗練 |
| Palo Alto Prisma Cloud | 旧 Twistlock 含む。エンタープライズ広く |
| Orca Security | 同じくSideScanning。Wizと近い |
| Lacework | 異常検知データ駆動 |
| Microsoft Defender for Cloud | Azure ネイティブ、AWS/GCP も |
| Aqua | コンテナ・K8s中心 |
| AWS Security Hub | 純正の CSPM 軸（[[Security Hub 導入メモ]]） |

## 導入時の論点

- **コスト**: 商用、年契約。中規模以上向け
- **権限**: 各クラウドアカウントへの広範な Read 権限が必要
- **アラート優先順位**: 「クリティカル攻撃経路」だけを SOC / 開発に流すルール設計
- **既存ツールとの統合**: SIEM / Jira / Slack / Datadog 連携

## 出典

- Wiz: https://www.wiz.io/
- Wiz Security Graph 解説: https://www.wiz.io/blog/announcing-the-wiz-security-graph

## 関連MOC

- [[MOC Security]]
- [[MOC AWS]]

## 関連ノート

- [[CNAPP]]
- [[CSPM]]
- [[IaC Scanning]]
- [[AWSセキュリティ実装]]
- [[コンテナとKubernetesセキュリティ]]
- [[Security Hub 導入メモ]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
