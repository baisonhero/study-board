---
tags: [inbox, learning]
created: 2026-04-26
aliases:
  - K8s
  - Kubernetes
  - kubectl
---

# Kubernetes基礎

> [!summary]
> コンテナを大規模に動かすための**オーケストレータ**。GoogleのBorg を起源にOSS化、CNCF配下で業界標準に。EKSの中身を理解するための基礎概念。Pod / Deployment / Service / Ingress の4つを押さえれば日常運用は8割カバー。

## なぜ Kubernetes か

コンテナを「**1つだけ**」動かすなら docker で十分。**たくさん** 動かすと一気に課題が増える：

- どのノードに配置するか
- 死んだら誰が再起動するか
- 負荷が増えたらどう拡張するか
- IPは変わるのにどう接続させるか
- 設定変更時にダウンタイムなしでロールアウトするには

Kubernetesはこれらを宣言的（**こうあってほしい状態を書く**）に解決する。手続きを書くのではなく「**Deployment が常に3つ動いてる状態**」と書けば、勝手にそうなるよう調整される。

## アーキテクチャ

```
┌─────────────── Control Plane（マネージド側、EKSなら隠蔽）──────────────┐
│  API Server（kubectlの相手）                                         │
│  etcd（クラスタ状態のDB）                                            │
│  Scheduler（Pod の配置先決定）                                       │
│  Controller Manager（あるべき状態に近づける）                          │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────── Worker Nodes（EC2、Fargate）──────────────────────────┐
│  kubelet（API Server と通信、Pod を起動）                             │
│  kube-proxy（Service の実装）                                        │
│  Container Runtime（containerd / CRI-O）                            │
│  Pod ─ Pod ─ Pod                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

EKSは Control Plane が AWS 側でマネージドされていて、自分は Worker Nodes（または Fargate）だけ管理する。

## 主要リソース（最小理解セット）

### Pod

- **最小デプロイ単位**。1つ以上のコンテナをまとめた論理ホスト
- 同じ Pod 内のコンテナは `localhost` で通信、ボリューム共有
- **エフェメラル**：死んだら別Podとして再生成、IPも変わる
- 直接 Pod を書くことは少ない（Deployment経由が普通）

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: app
    image: nginx:1.25
    ports:
    - containerPort: 80
```

### ReplicaSet

「**N個のPodを維持する**」コントローラ。直接書くことはほぼなく、Deployment経由で使う。

### Deployment（最重要、まずこれ）

ReplicaSet を制御してローリングアップデートを実現：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:v1.2.3
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

`kubectl apply -f deployment.yaml` で適用。`replicas: 5` に変えれば5に増える。`image:` を新バージョンに変えれば順次入れ替え。

### Service（Pod間通信の固定エンドポイント）

Pod のIPは変わるので、安定した接続先として Service を作る：

| タイプ | 用途 |
|---|---|
| **ClusterIP** | クラスタ内のみアクセス（デフォルト） |
| **NodePort** | 各ノードのポートで露出（開発・デバッグ） |
| **LoadBalancer** | クラウドのLBを自動作成（AWSならNLB/ALB） |
| **ExternalName** | DNS CNAME的な動き |

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-svc
spec:
  type: ClusterIP
  selector:
    app: my-app          # この label を持つPodへルーティング
  ports:
  - port: 80
    targetPort: 8080
```

クラスタ内DNS名 `my-app-svc.default.svc.cluster.local` で他Podから参照可能。

### Ingress

L7のHTTPルーティング。Ingress Controller（Nginx、Traefik、AWS Load Balancer Controller等）が裏で実体を動かす：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    kubernetes.io/ingress.class: alb
spec:
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-app-svc
            port:
              number: 80
```

EKSなら **AWS Load Balancer Controller** を入れて、Ingress を書くと ALB が自動作成される。

### ConfigMap / Secret

設定値・シークレットを Pod に注入：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: "info"
  API_URL: "https://api.example.com"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQ=    # base64エンコードのみ（暗号化されてない）
```

Pod から環境変数 or ボリュームマウントで読み込む。**Secretは暗号化されていない**点に注意（[[コンテナとKubernetesセキュリティ]] のExternal Secrets Operator 参照）。

### Namespace

論理的な分離単位。同じクラスタでチーム/環境を分ける。

```bash
kubectl create namespace my-app
kubectl get pods -n my-app
```

`default`、`kube-system`、`kube-public` が標準で存在。

### StatefulSet

DBのような**状態を持つ**ワークロード用。各Podに**安定した名前と永続ボリューム**を割り当てる：

- Pod名が `myset-0`、`myset-1` のように決定的
- スケール時の順序保証
- 各Podに独自の PersistentVolumeClaim

### DaemonSet

「**全ノードで1つ動く**」Pod。ログ収集（fluent-bit）、監視（node-exporter、Datadog Agent）、CNI 等に使う。

### Job / CronJob

- **Job**：完了型のバッチ処理
- **CronJob**：cron スケジュールでJobを起動

### PersistentVolume / PersistentVolumeClaim

ストレージ抽象化。AWS なら裏で EBSやEFSが作られる。

```yaml
# StorageClass（AWSのEBS gp3を使う）
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
```

## kubectl 基本コマンド

```bash
# 状態確認
kubectl get pods                    # Pod 一覧
kubectl get pods -n my-namespace
kubectl get pods -A                 # 全ネームスペース
kubectl get all                     # Pod/Service/Deployment等
kubectl get nodes
kubectl describe pod my-pod         # 詳細（イベントも見える）

# ログ・実行
kubectl logs my-pod
kubectl logs -f my-pod              # フォロー
kubectl logs -p my-pod              # 前回起動分（再起動した時）
kubectl exec -it my-pod -- bash     # シェル接続

# 適用・削除
kubectl apply -f manifest.yaml
kubectl delete -f manifest.yaml
kubectl delete pod my-pod

# スケール
kubectl scale deployment my-app --replicas=5

# ローリング再起動
kubectl rollout restart deployment my-app
kubectl rollout status deployment my-app
kubectl rollout undo deployment my-app

# デバッグ
kubectl debug my-pod -it --image=busybox
kubectl port-forward pod/my-pod 8080:80   # ローカルから接続
```

## Helm（パッケージマネージャ）

複数の YAML をまとめた **Chart** を `helm install` で一発デプロイ：

```bash
# Prometheus + Grafana の入った monitoring chart
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack
```

[Artifact Hub](https://artifacthub.io/) で公式 Chart が探せる。OSS製品の K8s デプロイ時に重宝する。

## Operator パターン

Kubernetes の API を**カスタムリソース（CRD）**で拡張して、ドメイン特化の自動化を実現：

```yaml
# 例：PostgreSQL Operator
apiVersion: postgres-operator.crunchydata.com/v1beta1
kind: PostgresCluster
metadata:
  name: my-pg
spec:
  postgresVersion: 16
  instances:
  - name: instance1
    replicas: 3
```

Operator がこれを見て、StatefulSet、Service、PVC などを自動生成し、バックアップやフェイルオーバーまで管理。

主要なOperator：
- **PostgreSQL**（Crunchy Data、Zalando）
- **Kafka**（Strimzi）
- **Cert-Manager**（証明書自動更新）
- **External Secrets Operator**（Vault連携）

## マネージド K8s の選択肢

| サービス | 提供元 | 特徴 |
|---|---|---|
| **EKS** | AWS | ALB Controller、Fargate、IRSA |
| **GKE** | GCP | 最も成熟、Autopilot モード |
| **AKS** | Azure | Microsoft連携 |
| **DigitalOcean K8s** | DO | シンプル、安い |
| **Linode K8s** | Akamai | シンプル |

ローカル開発：
- **kind**（Kubernetes IN Docker）— 軽量、CIで使いやすい
- **minikube** — 老舗
- **k3s / k3d** — 軽量、エッジ向け
- **Docker Desktop K8s** — 1クリック

## 学習の順序

1. **kubectl で既存クラスタを触る**：minikube か kind で Pod / Deployment / Service を作って操作
2. **Helmで何かインストール**：Prometheus stack 等
3. **小さいアプリをデプロイ**：自分のアプリで Deployment + Service + Ingress
4. **EKS or GKEで実物**：マネージド K8s で本格構築
5. **CD連携**：ArgoCD / Flux
6. **Operator自作**：CRDとReconcileループの理解（応用編）

## ハマりやすいポイント

- **resources.requests / limits を書かない** → ノードが過負荷
- **Liveness / Readiness Probe ミス** → 健全な Pod が殺される or 半死状態のPod にトラフィック流れる
- **Secret を base64 で暗号化と勘違い**
- **Namespace を切らずに混在**
- **Service の selector ラベルが Pod ラベルと一致せず接続不可**
- **Ingress Controller を入れてないのにIngress 書く**
- **PVCを消すとデータも消える**（StorageClassのreclaimPolicyで挙動変わる）

## トラブルシューティング初手

```bash
# Pod が立たない
kubectl describe pod <pod>           # Eventsを見る
kubectl logs <pod>
kubectl logs <pod> --previous        # 再起動した直前のログ

# サービスに到達できない
kubectl get endpoints <service>      # Endpointが空ならlabel不一致
kubectl exec -it <other-pod> -- curl http://service:port

# クラスタイベント
kubectl get events --sort-by='.lastTimestamp'
```

## 関連MOC

- [[MOC Learning]]
- [[MOC AWS]]

## 関連ノート

- [[インフラエンジニア学習ロードマップ]]
- [[ECSとEKSの選び方]]
- [[コンテナとKubernetesセキュリティ]]
- [[システム監視と可観測性]]
- [[IaCとTerraform基礎]]
