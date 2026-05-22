---
tags: [done, learning, database]
created: 2026-05-21
aliases:
  - SQL VIEW
  - SQL ビュー
  - データベースビュー
  - マテリアライズドビュー
---

# SQL ビューの基礎と使いどころ

> [!summary]
> ビュー (VIEW) は「名前を付けて保存したクエリ」。物理的にデータを持たず、参照されるたびに元の `SELECT` が実行される**仮想テーブル**。複雑な結合や集計に名前を付けて再利用し、テーブル構造をアプリから隠蔽できる。重い集計を実体化したい場合は**マテリアライズドビュー**を使う。

関連トピック: [[SQL]] / [[RDB]] / [[PostgreSQL]] / [[マテリアライズドビュー]] / [[Supabase RLS]] / [[クエリ最適化]]

## 1. ビューとは何か

ビューは **`SELECT` 文に名前を付けて保存したもの**。データベース上では「仮想テーブル」として振る舞う。

- **実体を持たない**: ビュー自体はデータを格納しない。参照されるたびに、定義された `SELECT` がその場で実行される
- **テーブルと同じように使える**: `SELECT * FROM ビュー名` で普通のテーブルのようにクエリできる
- **常に最新**: 元テーブルが更新されれば、ビューの結果も自動で最新になる（再実行されるため）

イメージとしては「よく使う検索条件・結合に**ショートカット名**を付けておく」もの。

## 2. 作り方と使い方

### 作成

```sql
CREATE VIEW active_users AS
SELECT id, name, email, last_login_at
FROM users
WHERE status = 'active'
  AND deleted_at IS NULL;
```

### 参照

普通のテーブルと同じ。

```sql
SELECT * FROM active_users WHERE last_login_at > '2026-05-01';
```

### 定義の変更・削除

```sql
-- 定義を上書き（多くの RDB で対応）
CREATE OR REPLACE VIEW active_users AS
SELECT id, name, email FROM users WHERE status = 'active';

-- 削除
DROP VIEW active_users;
```

### ビュー経由の更新

条件を満たす「更新可能ビュー (updatable view)」なら `INSERT` / `UPDATE` / `DELETE` も可能。ただし条件は厳しい（§5 参照）。実務では**ビューは読み取り専用として扱う**のが無難。

## 3. 通常ビュー vs マテリアライズドビュー

| 観点 | 通常のビュー | マテリアライズドビュー |
|---|---|---|
| データの実体 | 持たない（毎回再実行） | **持つ**（結果をディスクに保存） |
| 鮮度 | 常に最新 | `REFRESH` するまで古いまま |
| 参照速度 | 元クエリの重さに依存 | **速い**（実体を読むだけ） |
| ストレージ | ほぼ消費しない | 結果セット分を消費 |
| 用途 | 抽象化・簡潔化・権限制御 | 重い集計の高速化・ダッシュボード |

```sql
-- マテリアライズドビュー（PostgreSQL）
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT date_trunc('month', ordered_at) AS month,
       SUM(amount) AS total
FROM orders
GROUP BY 1;

-- 最新化（手動 or バッチ/cron で定期実行）
REFRESH MATERIALIZED VIEW monthly_sales;
```

「速度が欲しい・多少古くてもいい集計」はマテリアライズド、「常に最新・定義の整理が目的」は通常ビュー、と使い分ける。

## 4. メリット

### 4.1 複雑なクエリの抽象化・再利用

3テーブル結合 + 集計のような重いクエリに名前を付ければ、アプリ側は `SELECT * FROM ビュー` と書くだけ。同じロジックをコピペで散らばらせない。

### 4.2 セキュリティ・権限制御

元テーブルへの直接アクセスを禁止し、**ビューにだけ権限を与える**ことで、見せたい列・行だけ公開できる。

```sql
-- 給与列を除いた社員ビューだけを一般ロールに見せる
CREATE VIEW employees_public AS
SELECT id, name, department FROM employees;   -- salary は出さない

GRANT SELECT ON employees_public TO app_readonly;
-- employees 本体への GRANT はしない
```

[[Supabase RLS]] のような行レベルセキュリティと組み合わせると、列はビュー・行は RLS で絞る二段構えにできる。

### 4.3 インターフェースの安定化（後方互換）

テーブル構造を変えても、**ビューの定義を調整すれば呼び出し側は無修正**で済む。カラム名変更・テーブル分割のリファクタリング時に、ビューが「変わらない窓口」として機能する。

### 4.4 集計・命名の一貫性

「売上」「アクティブユーザー」のような業務定義をビューに固定すれば、人によって集計条件がブレない。BI ツールや複数アプリで定義を共有できる。

### 4.5 クエリの可読性

ネストしたサブクエリを段階的にビュー化すると、長大な SQL を意味のある単位に分割できる。

## 5. 制約・注意点

- **更新可能ビューの条件は厳しい**: 単一テーブル由来・集計や `DISTINCT`・`GROUP BY` を含まない、等。結合や集計を含むビューは原則読み取り専用
- **パフォーマンスは元クエリ次第**: 通常ビューは「ショートカット名」にすぎず、遅いクエリはビューにしても遅い。インデックスは**元テーブル側**に必要
- **ビューのネストし過ぎに注意**: ビューを参照するビューを何段も重ねると、実行計画が読みにくくなり最適化が効きづらくなる
- **マテリアライズドビューは鮮度管理が必須**: `REFRESH` を忘れると古いデータを返し続ける。更新タイミング（バッチ / トリガ / オンデマンド）を設計する
- **マテリアライズドビューの REFRESH はコスト**: 全件再計算が走る。PostgreSQL は `REFRESH ... CONCURRENTLY` で参照を止めずに更新可能（要ユニークインデックス）
- **DDL 依存**: 元テーブルの列を `DROP` するとビューが壊れる / 削除できないことがある

## 6. 実践例 — 段階的なビュー設計

```sql
-- ① 生ログから「成功した注文」だけを抽出するビュー
CREATE VIEW completed_orders AS
SELECT * FROM orders WHERE status = 'completed';

-- ② ①を使って顧客別の集計ビュー
CREATE VIEW customer_totals AS
SELECT customer_id,
       COUNT(*)      AS order_count,
       SUM(amount)   AS lifetime_value
FROM completed_orders
GROUP BY customer_id;

-- アプリ側はこれだけ
SELECT * FROM customer_totals WHERE lifetime_value > 100000;
```

集計が重くダッシュボードで多用するなら、②をマテリアライズドビューにして夜間バッチで `REFRESH` する、という発展形になる。

## 7. いつ使う / 使わないか

**使うとよい場面**

- 同じ結合・集計を複数箇所で使い回す
- 元テーブルを直接見せたくない（列・行の隠蔽）
- テーブル構造を変えても呼び出し側を守りたい
- 業務上の集計定義を一箇所に固定したい

**使わない / 慎重になる場面**

- 一度きりのアドホッククエリ（ビュー化する意味が薄い）
- 「遅いから」とビュー化しても、通常ビューでは速くならない → 必要なのはインデックスかマテリアライズドビュー
- ネストを深くして実行計画を不透明にしてしまうケース

## 関連MOC

- [[MOC Learning]]

## 関連ノート

- [[Supabase RLS]] — 行レベルセキュリティ。ビューの列制御と組み合わせる二段構え
- [[SQL]]
- [[マテリアライズドビュー]]
- [[クエリ最適化]]
