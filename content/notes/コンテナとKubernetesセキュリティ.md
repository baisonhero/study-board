---
tags: [inbox, learning, security]
created: 2026-04-26
aliases:
  - Container Security
  - K8s Security
  - Kubernetesセキュリティ
---

# コンテナとKubernetesセキュリティ

> [!summary]
> Vercel/Supabaseの間は不要だが、自前でホスティングし始めた途端に必要になる。イメージスキャン、Pod Security Standards、ネットワークポリシー、ランタイム検知、シークレット管理。Cloud Native Security の中心テーマ。

## 4Cモデル（Cloud Native Security の階層）

```
Code → Container → Cluster → Cloud
```

外側（Cloud）の設定ミスはアプリ全体に波及、内側（Code）の脆弱性は影響範囲が局所的。**外側ほど重要**。

## イメージレベル

### イメージスキャン

CI/CDで毎ビルド：

- **Trivy**（OSS、軽量、SBOM出力可、業界標準）
- **Grype**（OSS、SBOM特化）
- **Snyk Container**
- **AWS Inspector**、**ECR Image Scanning**（拡張）

### イメージ作りのベストプラクティス

- **Distroless** や **alpine** をベースに（攻撃面の最小化）
- **Multi-stage build** でビルド成果物だけを最終イメージに
- **non-root ユーザー** で実行（`USER 10001` 等）
- **read-only filesystem**（`readOnlyRootFilesystem: true`）
- **タグの固定化**（`:latest` 禁止、ハッシュpinが理想）

### イメージ署名

[[ソフトウェアサプライチェーン強化]] の Sigstore で署名 → 実行クラスタで検証。Cosign + Kyverno / Connaisseur 等でAdmission時に強制。

## コンテナ実行レベル（Container）

### セキュリティコンテキスト

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop: ["ALL"]
  seccompProfile:
    type: RuntimeDefault
```

これだけで攻撃成功時の被害を大幅に削減できる。

### Pod Security Standards（PSS）

Kubernetes 1.25 で beta、現在は標準。3レベル：

| レベル | 概要 |
|---|---|
| **Privileged** | 制限なし（システムワークロード用） |
| **Baseline** | 既知の問題は禁止 |
| **Restricted** | 強化されたセキュリティ要件 |

namespace に label でレベル設定：

```yaml
labels:
  pod-security.kubernetes.io/enforce: restricted
```

旧 PodSecurityPolicy（PSP）は1.25で削除済み。

## Cluster レベル

### RBAC

- 人間ユーザーには Role/RoleBinding（namespace単位）か ClusterRole/ClusterRoleBinding
- ServiceAccount は Pod ごとに必要最小権限
- `cluster-admin` は緊急時のみ
- **kubectl監査ログ**（API server audit log）を全アクション記録

### ネットワークポリシー

デフォルトで全 namespace 内通信が許可されている（要 CNI が NetworkPolicy対応：Calico、Cilium 等）。

```yaml
# default deny ingress + 必要なものだけ allow
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
spec:
  podSelector: {}
  policyTypes:
  - Ingress
```

「全部deny」を起点に必要な通信だけ allow するのが安全側。

### Admission Control

- **Kyverno** — YAML ポリシー、強制・監査・Mutation
- **OPA Gatekeeper** — Rego 言語、より柔軟
- 例：「`latest` タグ禁止」「root実行禁止」「resource limit 必須」を入庫時にブロック

### Secret管理

- Kubernetes標準の Secret は **base64エンコードしてあるだけで暗号化されてない**
- 解決策：
  - **etcd暗号化（at-rest）** を有効化
  - **External Secrets Operator** で AWS Secrets Manager / Vault 連携
  - **Sealed Secrets** で「コミットしてもOK」な暗号化Secret

## ランタイム検知（CWPP）

実行中の異常を検知：

- **Falco**（CNCF graduated）— eBPF ベースのランタイム監視。「コンテナ内でshellが起動した」「shadow pswd 読まれた」等
- **Tracee**（Aqua）— eBPFベース、強力
- **Sysdig** — 商用、Falco の発祥

[[CNAPP]] の CWPP コンポーネントがここを担う。

## Kubernetes 監査ログ

API serverのリクエストすべて記録できる：

- `--audit-policy-file` でレベル指定
- 重要操作（exec、portforward、secret access）は **Metadata** ではなく **Request/RequestResponse**
- ログを cluster外（CloudWatch、S3 等）にすぐ転送

## サプライチェーン

- ベースイメージは公式・信頼できるレジストリから（[[ソフトウェアサプライチェーン強化]]）
- イメージ署名 + Admission 検証
- SBOMをイメージごとに付与（[[SBOM]]）

## 個人/小規模での現実的な戦略

Kubernetesを自分で運用するハードルは高いので、優先順位：

1. まずは **マネージドK8s**（EKS、GKE、AKS）かつ **マネージドコントロールプレーン**
2. CIで **Trivy** によるイメージスキャン必須化
3. **Restricted Pod Security Standard** を全 namespace に適用
4. **NetworkPolicy** を default deny で
5. **External Secrets Operator** でクラウドVaultと連携
6. K8s監査ログを CloudWatch / 別アカウントに転送
7. 規模が出たら Falco、Kyverno を導入

## OWASP関連

**OWASP Kubernetes Top 10**（2022年版）あり。クラスタ運用視点での10カテゴリ。

## 学習リソース

- Kubernetes 公式 Security ドキュメント
- CIS Kubernetes Benchmark
- 「Hacking Kubernetes」by Andrew Martin, Michael Hausenblas
- KubeCon のセキュリティトラック

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[セキュリティ学習ロードマップ]]
- [[インフラエンジニア学習ロードマップ]]
- [[Kubernetes基礎]]
- [[ECSとEKSの選び方]]
- [[ソフトウェアサプライチェーン強化]]
- [[SBOM]]
- [[アプリケーションセキュリティ ツール分類]]
- [[AWSセキュリティ実装]]
