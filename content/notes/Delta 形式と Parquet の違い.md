---
title: Delta 形式と Parquet の違い — S3 で高速クエリするためのテーブルフォーマット選び
tags: [done, learning, aws]
created: 2026-07-01
aliases:
  - Delta Lake
  - Delta 形式
  - Delta vs Parquet
  - テーブルフォーマット
  - S3 Tables
  - Iceberg vs Delta
source: web
---

# Delta 形式と Parquet の違い — S3 で高速クエリするためのテーブルフォーマット選び

> [!summary]
> **Delta 形式** ＝ Parquet ファイルの上に **トランザクションログ**を乗せて「テーブル」として扱えるようにした**テーブルフォーマット**。Parquet が「1 個のファイルの中の列指向形式」なのに対し、Delta は「複数の Parquet ファイル ＋ ログ ＝ 1 つのテーブル」というレイヤーが違う概念。Databricks が作った OSS で、ACID トランザクション・タイムトラベル・スキーマ進化・MERGE/UPDATE/DELETE 等を提供。**2026 年時点では Apache Iceberg が事実上のデファクト**になっていて、AWS の **S3 Tables**（re:Invent 2024 発表）も Iceberg を採用。Delta も Athena・Glue・EMR でネイティブサポートされているので、Databricks 生態系や既存 Delta 資産があれば十分現役。**Delta ≠ Parquet**、**Delta ≠ S3 Tables（あれは Iceberg）** の 2 点を押さえるとブレない。

関連トピック: [[Delta Lake]] / [[Apache Iceberg]] / [[Apache Parquet]] / [[Amazon Athena]] / [[AWS Glue]] / [[S3 Tables]] / [[Lakehouse]]

## 1. ひとことで言うと

- **Parquet** ＝ **ファイル形式**（1 個の物理ファイルの内部構造。列指向で圧縮・カラム読み出し向き）
- **Delta** ＝ **テーブル形式**（複数の Parquet ファイル ＋ トランザクションログ ＝ 1 つの「テーブル」）
- レイヤーが違うので「どっちが速いか」比較はナンセンス。Delta は内部で Parquet を使っている

構造的にはこう:

```
Delta テーブル ＝
  data-00000.parquet
  data-00001.parquet
  data-00002.parquet
  ...
  _delta_log/00000000000000000000.json    ← トランザクションログ
  _delta_log/00000000000000000001.json
  _delta_log/...
```

Delta の本質は **`_delta_log/` の中身**。ここに「どのファイルがテーブルの一部か」「いつ追加/削除されたか」「スキーマは何か」が JSON で記録されて、これが ACID とタイムトラベルを可能にしている。

## 2. ★ 一番の混同ポイント — Parquet と Delta はレイヤが違う

「Parquet と Delta どっち使う？」は質問として成立していない。両方使ってる。

| レイヤ | 名前 | 何を決めるか |
|---|---|---|
| **ファイルフォーマット** | [[Apache Parquet]] / ORC / Avro | 1 ファイルの中身の並び方（列指向・行指向・圧縮方式） |
| **テーブルフォーマット** | **Delta Lake** / [[Apache Iceberg]] / [[Apache Hudi]] | 複数ファイルをまとめて「テーブル」として扱う枠組み（ACID・スキーマ・時系列） |

Delta / Iceberg / Hudi は**中でみんな Parquet を使う**。テーブルフォーマットは Parquet の上に乗る「メタデータ管理レイヤー」だと理解すると混乱しない。

## 3. なぜ Delta が生まれたか — 素の Parquet の課題

素の Parquet を S3 に大量に置いた運用（いわゆる**データレイク**）は昔からあったが、実用で困る点があった:

- **ACID がない** → 書き込み途中で失敗すると中途半端なファイルが残る、複数書き込みが競合すると壊れる
- **スキーマ変更が破壊的** → 列を追加/削除すると既存ファイルとの整合性を自力で管理
- **UPDATE / DELETE が困難** → 該当ファイルを丸ごと書き換える必要がある（GDPR の右忘れ対応で詰む）
- **同時読み書きで壊れる** → 誰かがファイル一覧を取っている最中に誰かが追加すると不整合
- **時系列で戻せない** → 「昨日の状態を見たい」が不可能

これらを **Parquet を壊さずに解決する薄い層** として Delta が誕生した（2019 年 Databricks 発表、2020 年 Linux Foundation に寄贈）。

## 4. Delta が提供する主な機能

| 機能 | 中身 |
|---|---|
| **ACID トランザクション** | 書き込みが atomic。中途半端な状態が読み手に見えない |
| **タイムトラベル** | `VERSION AS OF 42` / `TIMESTAMP AS OF '2026-06-01'` で過去のスナップショットを SELECT |
| **スキーマ進化 / 強制** | 列追加を安全に。想定外スキーマの書き込みは拒否できる |
| **MERGE / UPDATE / DELETE** | SQL の DML がそのまま使える（GDPR 削除依頼に対応可） |
| **楽観的同時実行制御** | 複数ライターが書いても最終的に整合。競合検出付き |
| **データスキッピング** | 各 Parquet の min/max をログに持ち、predicate で不要ファイルを読み飛ばす |
| **Z-order / Optimize** | クエリパターンに応じてファイル配置を最適化 |
| **CDC（Change Data Feed）** | 「何が変わったか」をストリームで取り出せる |

## 5. Delta vs Iceberg vs Hudi — テーブルフォーマット 3 強

| | **Delta Lake** | **Apache Iceberg** | **Apache Hudi** |
|---|---|---|---|
| 出自 | Databricks（2019） | Netflix（2018） | Uber（2016） |
| 得意 | Databricks 生態系、SQL 統合 | 分散書き込み、複数エンジン共存 | ストリーミング取り込み、CDC |
| メタデータ | JSON ログ（`_delta_log/`） | Avro マニフェスト＋メタデータツリー | Timeline（メタデータログ）|
| **2026 年の勢い** | Databricks 圏で強い | **事実上のデファクト**（AWS / Snowflake / Google / Databricks 全対応） | ストリーミング用途に残る |

**2026 年の潮流**: **Iceberg が open lakehouse のデファクトに**。全主要クラウド（AWS / GCP / Snowflake）が採用し、Databricks 自身も Iceberg 読み書きを完全サポート。Delta も現役だが「新規プロジェクトなら Iceberg で組む」が多数派に。

補足: **Delta Lake UniForm** で「Delta テーブルを Iceberg として読ませる」ことも可能（メタデータを両方書き出す）。境界は溶けつつある。

## 6. AWS で Delta を使う実際

### 6.1 Amazon Athena — マネージド SQL クエリ

```sql
CREATE EXTERNAL TABLE my_delta_table
LOCATION 's3://my-bucket/path/to/delta/'
TBLPROPERTIES ('table_type' = 'DELTA');

SELECT * FROM my_delta_table WHERE event_date = '2026-07-01';
```

- 2022 年から Athena が Delta ネイティブ対応
- manifest 生成や `MSCK REPAIR` 不要
- min/max ベースの**ファイルスキッピングも自動**

### 6.2 AWS Glue — ETL / カタログ

- Glue 3.0 以降で Delta サポート
- Glue Data Catalog に Delta テーブルを登録可能
- Spark ジョブで Delta を読み書き

### 6.3 EMR — Spark フル機能

```bash
spark-submit \
  --packages io.delta:delta-spark_2.12:3.0.0 \
  --conf "spark.sql.extensions=io.delta.sql.DeltaSparkSessionExtension" \
  --conf "spark.sql.catalog.spark_catalog=org.apache.spark.sql.delta.catalog.DeltaCatalog"
```

- MERGE / OPTIMIZE / Z-ORDER 等フル機能
- Databricks ではないので細かい最適化は自力

### 6.4 制約: S3 の書き込みは楽観的排他

- Delta の同時書き込みは**楽観的**（write 時に競合検出）
- S3 は Read-after-Write 一貫性はあるが**リストの一貫性が緩い**
- 複数ライターが並列で書くと、稀に「別ライターが書いたファイルが見えない」問題が起きる → DynamoDB を lock manager にする回避策あり

## 7. ★ 2026 年時点で押さえるべき最大の混同

**「S3 Tables ＝ Delta」ではない**。よくある勘違い。

- **Amazon S3 Tables**（re:Invent 2024 発表、2025 年 GA）は **Apache Iceberg を採用**
- S3 の中に **table bucket** という新しいバケット種別を作り、Iceberg テーブルをマネージドに扱う
- コンパクション・スナップショット期限切れ・不要ファイル削除を**バックグラウンドで自動運用**
- Athena / Redshift / EMR / Spark / Flink など Iceberg 対応エンジンから読み書き可能

つまり:

- 「**S3 で高速クエリしたい**」→ 2026 年時点の第一候補は **S3 Tables（Iceberg）**
- 「**既存の Delta 資産がある** or **Databricks と連携する**」→ Athena / Glue の Delta サポートで十分現役
- 「**Delta と Iceberg どっちが速いか**」→ 500K ファイル規模で Iceberg 2-5 秒 / Delta 8-15 秒という数字はあるが、100 TB 以上や特定アクセスパターンでない限り**両者とも実用上十分速い**。差は「エコシステム重力」の方が大きい

## 8. どれを選ぶか — 判断軸

| 状況 | 推奨 |
|---|---|
| S3 で高速クエリしたい、新規プロジェクト、マネージドで運用負荷ゼロ | **S3 Tables（Iceberg）** |
| 既存 Delta 資産がある、Databricks と連携する | **Delta Lake** on S3（Athena / Glue） |
| 自前で細かく Iceberg を運用したい | **Self-managed Iceberg** on S3 |
| ストリーミング取り込み中心（Kafka → CDC） | **Hudi** |
| 素の Parquet で十分（append only、UPDATE / DELETE 不要、単一ライター） | **Parquet 直** |

「**S3 上で高速クエリしたい、テーブルとして扱いたい**」なら、2026 年時点は **S3 Tables → Iceberg or Delta（既存資産次第）** の順で検討するのが素直。

## 9. まとめ

- **Delta ＝ Parquet の上に乗るテーブルフォーマット**（ACID・タイムトラベル・スキーマ進化・MERGE / UPDATE / DELETE）
- **Parquet は列指向のファイル形式**、Delta は複数 Parquet を束ねる**メタデータ層**。レイヤーが違うので直接比較しない
- Delta / Iceberg / Hudi は同じ問題を解く 3 兄弟。2026 年は **Iceberg がデファクト**
- **AWS の S3 Tables は Iceberg 採用**（Delta ではない、ここが最頻の勘違い）
- Delta も Athena / Glue / EMR で普通にサポートされているので既存資産や Databricks 連携なら現役
- 高速クエリの「速さ」は**テーブルフォーマット選択より、ファイルサイズ・パーティション設計・データスキッピングの効かせ方**の方が支配的

## 関連MOC

- [[MOC AWS]]
- [[MOC Learning]]

## 関連ノート

- [[S3 暗号化方式と CMK 移行戦略]] — S3 側の暗号化設計。テーブルフォーマットと直交
- [[SQL ビューの基礎と使いどころ]] — テーブルの上位概念。Athena でも view は使える
- [[AI 利用コストの予算設計]] — 分析基盤も同じく変動費なのでコスト設計が肝

## 参考リンク（出典）

- [Delta Lake on S3 — Delta.io](https://delta.io/blog/delta-lake-s3/)
- [Query Linux Foundation Delta Lake tables — Amazon Athena docs](https://docs.aws.amazon.com/athena/latest/ug/delta-lake-tables.html)
- [Using the Delta Lake framework in AWS Glue — AWS Glue docs](https://docs.aws.amazon.com/glue/latest/dg/aws-glue-programming-etl-format-delta-lake.html)
- [Expand data access through Apache Iceberg using Delta Lake UniForm on AWS — AWS Big Data Blog](https://aws.amazon.com/blogs/big-data/expand-data-access-through-apache-iceberg-using-delta-lake-uniform-on-aws/)
- [AWS S3 Tables?! The Iceberg Cometh — Data Engineering Central](https://dataengineeringcentral.substack.com/p/aws-s3-tables-the-iceberg-cometh)
- [S3 Tables vs Self-Managed Iceberg on AWS — AWS Tip](https://medium.com/aws-tip/s3-tables-vs-iceberg-on-aws-which-wins-d73b6c316e94)
- [Apache Iceberg vs Delta Lake vs Hudi 2026 Compared — tech-insider](https://tech-insider.org/apache-iceberg-vs-delta-lake-vs-hudi-2026/)
