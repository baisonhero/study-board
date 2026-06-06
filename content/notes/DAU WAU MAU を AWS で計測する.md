---
title: DAU / WAU / MAU を AWS で計測する — 手段比較と PII 考慮
tags: [done, learning, aws, observability, security]
created: 2026-06-06
aliases:
  - DAU WAU MAU 計測
  - AWS Active Users 計測
  - CloudWatch RUM DAU
  - アクティブユーザー計測 AWS
source: 会話まとめ
---

# DAU / WAU / MAU を AWS で計測する — 手段比較と PII 考慮

> [!summary]
> Daily / Weekly / Monthly Active Users を AWS 内のサービスだけで計測する方法を 5 つ整理し、それぞれの **PII リスク**と **重複排除（ユニーク判定）の精度**を並べる。本命は **[[CloudWatch RUM]] の匿名モード**（人を特定せずブラウザ／端末単位で正確に unique 数を取れる）。代替に DB クエリ・Logs Insights・Athena over ALB ログ・Custom Metric。本ノートは各手段の仕組み・実装・PII リスク・推奨設定（特に RUM のコード例）を含む。「人が誰か分からなくていい、重複だけ排除したい」が達成できる構成を示すのが目的。

関連トピック: [[CloudWatch RUM]] / [[CloudWatch Logs Insights]] / [[Athena]] / [[ALB]] / [[ECS と Lambda の観測性設計]] / [[プロダクト開発における個人情報保護]]

## 1. 前提と目的

- AWS 内のサービスだけで DAU / WAU / MAU を計測したい
- 「**人が誰か（実名・メアド）は知らなくていい。ただ重複は排除したい**」が要件
- 観測性のボード（[[ECS と Lambda の観測性設計]] の Application Signals 等）はサービス指標が中心で、**ユーザー指標は別途用意**する必要がある

## 2. 用語の整理

- **DAU**（Daily Active Users）: 24 時間以内に「アクティブ」だったユニークユーザー数
- **WAU**（Weekly）: 過去 7 日間
- **MAU**（Monthly）: 過去 30 日間
- 「**アクティブ**」の定義は事業しだい。ログイン／API 利用／ページ閲覧／特定機能利用など、先に決めておく
- 「**ユニーク**」の判定軸も決めておく。ログイン user_id ／ cookie ベース UUID ／ IP+UA hash など

## 3. 選択肢の全体像

| 手段 | 適性 | コスト | 重複排除精度 | PII リスク |
|---|---|---|---|---|
| a. アプリ DB クエリ | ログイン user が中心 | ほぼゼロ | 高い（DB 真値） | アプリ DB 内なら既存統制下 |
| b. CloudWatch Logs Insights | 既存ログ資産で済ませたい | $0.005/GB scan | 中（HLL 近似） | ログに user 情報がある前提 |
| c. **[[CloudWatch RUM]]**（推奨） | フロントエンドあり・匿名で十分 | $1.00 / 100K events | 高い（cookie UUID） | 設定次第で最小化可 |
| d. Athena over ALB アクセスログ | アクセスログ流用 | scan 量課金 | 中（user 抽出しだい） | ログ内容次第 |
| e. CloudWatch Custom Metric | 自前集計を流す | $0.30/metric/月 〜 | 高い（集計値） | ほぼゼロ（数値のみ送信） |

## 4. 選択肢 a — アプリ DB クエリ（最速・最安）

ログイン／イベントテーブルがある前提で 1 本のクエリで取る。

```sql
-- DAU
SELECT COUNT(DISTINCT user_id)
  FROM events
 WHERE created_at >= NOW() - INTERVAL 1 DAY;

-- 過去 30 日間で日別の DAU
SELECT DATE(created_at) AS d, COUNT(DISTINCT user_id) AS dau
  FROM events
 WHERE created_at >= NOW() - INTERVAL 30 DAY
 GROUP BY DATE(created_at)
 ORDER BY d;
```

**長所**: コストほぼゼロ／既存資産で完結／精度高い

**短所**: ログイン user のみ（未ログインは取れない）／クエリ運用が必要

**PII**: DB に既にある `user_id` をそのまま使うだけ。**アプリ DB 内に閉じる**ので新たな PII 露出はない。集計結果（数値）だけをダッシュボード化すれば露出はゼロ。

## 5. 選択肢 b — CloudWatch Logs Insights

アプリログ（または OTel スパンログ）に `user.id` を出している前提で:

```
fields user_id, @timestamp
| stats count_distinct(user_id) as dau by bin(1d)
```

**長所**: 既存ログだけで集計／別計装不要

**短所**: distinct count は **HyperLogLog の近似**（誤差 ~2%）／クエリ実行ごとに scan 課金

**PII**: ログに `user_id`（≒ 内部 ID）だけが出ていれば最小限。**ログにメアド・名前を出している場合は、まずログ側の PII を絞る**のが先。詳しくは [[セキュリティロギング設計]]。

## 6. 選択肢 c — CloudWatch RUM（推奨）

ブラウザ計測（Real User Monitoring）。**DAU / WAU / MAU が標準ダッシュボード機能**として提供されている。

### 6.1 仕組み — 匿名 UUID で重複排除

RUM はブラウザの cookie / localStorage に **ランダム UUID** を発行・保管する。次回アクセス時に同じ UUID が読まれるので「同じユーザー」と判定。**この UUID はアプリの認証 user_id とは無関係で、AWS が発行する乱数**。誰かは分からない。

- 同じブラウザで何回アクセスしても → **1 ユニーク**（重複排除 ✓）
- ブラウザを変えると → 別ユニーク
- cookie を消すと → 別ユニーク（小さな undercount は発生）

→ 「**ブラウザ／端末単位**の unique 数」が取れる（人単位ではない、という解像度を理解した上で使う）。

### 6.2 PII リスクポイント

RUM 自体は匿名 UUID ベースなので人特定の心配は低い。ただし **設定・使い方しだいで PII が混入する**ポイントがいくつかある:

| 項目 | リスク | 対策 |
|---|---|---|
| RUM に `userId` を渡す API | アプリの認証 ID（メアド等の可能性）が入る | **渡さない**。匿名 UUID のままにする |
| URL の query string | `?email=...` 等で PII が URL に乗る | URL マスキング設定で query を `*` 化、またはアプリ側で PII を URL に出さない |
| カスタムイベントの属性 | 任意 key-value で PII を入れてしまう | カスタム属性に user 情報を入れない運用規約 |
| IP アドレス | RUM は内部で IP を取得（geolocation 用）。ダッシュボードは aggregated のみ | EU トラフィックがあるなら GDPR の cookie 同意が必要。日本主体なら通常運用で OK |
| エラーログのスタックトレース | URL や引数値がスタックに混入する可能性 | アプリ側で例外メッセージに PII を入れない |

### 6.3 推奨設定 — PII を最小化して DAU/WAU/MAU を取る

```javascript
import { AwsRum } from 'aws-rum-web';

const config = {
  sessionSampleRate: 1,
  identityPoolId: 'ap-northeast-1:xxxxx-xxxx-xxxx',   // 匿名利用なら Cognito Identity Pool
  endpoint: 'https://dataplane.rum.ap-northeast-1.amazonaws.com',
  telemetries: ['errors', 'performance', 'http'],     // 'interaction' は不要なら外す
  allowCookies: true,                                  // 重複排除のため必須
  enableXRay: false,
  // userId は渡さない（匿名 UUID のまま）
  // pagesToInclude / pagesToExclude で URL フィルタリング
};

const rum = new AwsRum(
  'application-id-uuid',
  '1.0.0',
  'ap-northeast-1',
  config,
);
```

ポイント:

- `allowCookies: true` → 同一ブラウザの再訪を 1 ユニーク扱い（重複排除のため必須）
- **`userId` プロパティは渡さない**（渡すとアプリ認証 ID が RUM に流れる）
- `telemetries` から `interaction` を外せばクリック単位の詳細データが減って PII 流入リスクが下がる
- URL query string に PII を出さない**実装規約**を併せて入れる

### 6.4 「ランダム UUID すら持たせたくない」場合

cookie ベースの永続 ID すら避けたい（厳格な GDPR 領域・cookie 同意取得が難しいケースなど）場合は、**Plausible / Fathom / Umami** のような「**当日限定の hash(IP + UA + salt)**」を使うプライバシーファースト分析が選択肢。RUM の代わりに使う形。

- 日次 hash → 翌日の同じユーザーは別ユーザーと判定
- 構造上、**DAU は取れるが WAU / MAU は取れない**（識別子が日替わり）
- WAU / MAU が要らないなら検討余地あり（AWS 製品ではないので別 SaaS 契約が要る）

## 7. 選択肢 d — Athena over ALB アクセスログ

ALB のアクセスログを S3 に置いて、Athena で集計する。

```sql
-- 例: cookie や JWT decoded sub から user_id を抽出できる前提
SELECT COUNT(DISTINCT user_id) AS dau
  FROM alb_logs
 WHERE date(time) = current_date - interval '1' day;
```

**長所**: ALB ログがあれば追加計装ゼロ／既存資産で完結

**短所**: ALB ログから user を抽出するには cookie 解析や JWT decode が必要（ログに user_id が直接出ない場合は前段でログ加工が要る）

**PII**: ALB ログには IP / UA / URL / cookie が出る。**ログ自体に PII リスクがある**ので、保管期間・アクセス制御の見直しが先。集計時は `user_id` 列だけ取り出す形で運用する。

## 8. 選択肢 e — CloudWatch Custom Metric

アプリ側で日次 DAU を計算して CloudWatch にメトリクス送信。

```python
import boto3
cw = boto3.client('cloudwatch')

cw.put_metric_data(
    Namespace='Product/Engagement',
    MetricData=[
        {'MetricName': 'DAU', 'Value': dau_count, 'Unit': 'Count'},
        {'MetricName': 'WAU', 'Value': wau_count, 'Unit': 'Count'},
        {'MetricName': 'MAU', 'Value': mau_count, 'Unit': 'Count'},
    ],
)
```

**長所**: CloudWatch Dashboard に並べやすい／アラート貼れる／**送信されるのは数値だけなので PII リスクゼロ**

**短所**: 集計ロジック（distinct count）はアプリ側で持つ必要がある／集計実行のスケジューリングが要る（EventBridge + Lambda 等）

**PII**: 送信されるのは集計後の数値のみ。**PII を一切含まない**。集計までの過程（DB から user_id を SELECT 等）はアプリ DB 内なので既存統制下。

## 9. 比較表

| 観点 | a. DB | b. Logs Insights | c. RUM | d. Athena/ALB | e. Custom Metric |
|---|---|---|---|---|---|
| 適性 | ログイン user | 既存ログ流用 | フロント計測 | アクセスログ流用 | 自前集計 |
| 計測対象 | ログイン user | アプリログの user | ブラウザ／端末 | アクセス元 | 任意（集計次第） |
| 重複排除精度 | 高（DB 真値） | 中（HLL 近似） | 高（cookie UUID） | 中（user 抽出次第） | 高（集計次第） |
| PII リスク | 低（DB 内） | ログ次第 | 設定次第（匿名化可） | ログ次第 | **ほぼゼロ**（数値のみ） |
| コスト | ほぼゼロ | $0.005/GB scan | $1/100K events | scan 量課金 | $0.30/metric/月〜 |
| 未ログイン対応 | ❌ | ❌ | ✅ | △ | △ |
| 標準ダッシュボード | ❌（自作） | ❌（自作） | ✅（DAU 標準） | ❌（自作） | △（CW Dashboard） |

## 10. 判断軸 — 推奨の選び方

| 状況 | 推奨 |
|---|---|
| すでに `users` / `events` テーブルがあって、対象がログイン user | **a. DB クエリ** |
| フロントエンドあり、未ログインも含めて計測したい、人を特定したくない | **c. CloudWatch RUM（匿名モード）** |
| バックエンド only でログだけある／既存ログ資産で済ませたい | **b. Logs Insights** |
| ALB アクセスログがあり、user 抽出のための前処理を組める | **d. Athena over ALB** |
| ダッシュボード化・アラート化が最優先／PII 露出をゼロにしたい | **e. Custom Metric**（アプリで集計して送る） |

**「人が誰かは分からなくていい、重複だけ排除したい」を満たす一番現実的な構成は c.（RUM）と e.（Custom Metric）の組み合わせ**:

- RUM でブラウザ単位の DAU/WAU/MAU（未ログインユーザー含む）を匿名で取る
- Custom Metric で「ログイン user の DAU」もメトリクス化して並べる
- どちらも **生 PII を持たない**形で運用できる

## 11. PII 全般のチェックリスト

- [ ] `userId` を RUM / OTel / ログに **渡す前に「内部 ID か」「不可逆ハッシュか」を確認**
- [ ] URL の query string に **メアド・名前・電話番号を載せない**実装規約
- [ ] ログ・カスタム属性に **PII を入れない**運用規約
- [ ] EU / GDPR トラフィックがあるなら **cookie 同意バナー**を設置
- [ ] ALB アクセスログ・OTel スパンの **保管期間・アクセス制御**を見直す
- [ ] 集計後の数値のみダッシュボード化（生レコードを横展開しない）
- [ ] 関連: [[プロダクト開発における個人情報保護]] / [[セキュリティロギング設計]] / [[コンプライアンスと法規制]]

## 12. まとめ

- 「人が誰か分からなくていい、重複だけ排除したい」要件には **CloudWatch RUM の匿名モード**が一番素直
- ログイン user の真値が欲しいなら **DB クエリ**が最も安く正確
- どちらも **PII を直接持たない**形で運用できる。ポイントは「`userId` を渡さない」「URL に PII を出さない」「カスタム属性に PII を入れない」の 3 つの規律
- Application Signals 等のサービス指標とは別軸の指標なので、**専用ツールを 1 つ立てる前提**で考えると整理しやすい

## 関連MOC

- [[MOC AWS]]
- [[MOC Business]]
- [[MOC Observability]]
- [[MOC Learning]]

## 関連ノート

- [[ECS と Lambda の観測性設計]] — Application Signals でサービス指標を取る方の話。本ノートはユーザー指標を扱う
- [[プロダクト開発における個人情報保護]] — Privacy by Design の文脈
- [[セキュリティロギング設計]] — ログに何を残すかと PII の扱い
- [[コンプライアンスと法規制]] — 改正個人情報保護法、GDPR
