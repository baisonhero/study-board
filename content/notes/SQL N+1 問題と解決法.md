---
tags: [done, learning, database]
created: 2026-05-21
aliases:
  - N+1問題
  - N+1 problem
  - N+1 クエリ
  - イーガーローディング
---

# SQL N+1 問題と解決法

> [!summary]
> N+1 問題は「一覧を取る 1 本のクエリ + その各行ごとに関連データを取る N 本のクエリ」が走ってしまう、典型的なパフォーマンスアンチパターン。多くは [[ORM]] の遅延ロードで無自覚に発生する。データが増えるほど線形にクエリ本数が増え、レイテンシと DB 負荷を悪化させる。解決の核は **「ループの中でクエリを投げない」** — JOIN や `IN` でまとめて取る。

関連トピック: [[SQL]] / [[ORM]] / [[クエリ最適化]] / [[イーガーローディング]] / [[DataLoader]] / [[SQL ビューの基礎と使いどころ]]

## 1. N+1 問題とは

「一覧を 1 回のクエリで取得 (**1**)」したあと、「その各行に紐づく関連データを 1 行ずつ別クエリで取得 (**N**)」してしまう状態。合計 **N+1 本**のクエリが飛ぶことからこう呼ぶ。

### 具体例

ブログの「記事一覧」で、各記事の著者名も表示したいケース。

```
[1] SELECT * FROM posts;                          -- 記事を 100 件取得
        ↓ 取得した 100 件をループ
[2] SELECT * FROM users WHERE id = 1;             -- 1 件目の著者
[3] SELECT * FROM users WHERE id = 2;             -- 2 件目の著者
...
[101] SELECT * FROM users WHERE id = 100;         -- 100 件目の著者
```

記事 100 件なら **101 本**のクエリ。記事が 1,000 件になれば **1,001 本**。件数に比例してクエリが増える。

## 2. なぜ起きるのか

### 2.1 ORM の遅延ロード (lazy loading)

最大の原因。ORM は関連オブジェクトに**アクセスした瞬間**に裏でクエリを投げる。コード上はただのプロパティアクセスに見えるので、クエリが飛んでいることに気づきにくい。

```python
# Django の例 — 一見ふつうのループ
posts = Post.objects.all()          # [1] SELECT * FROM posts
for post in posts:
    print(post.author.name)         # ループのたびに [2]..[N] が飛ぶ
```

```ruby
# Rails (ActiveRecord) でも同じ
Post.all.each do |post|
  puts post.author.name            # post.author でその都度 SELECT
end
```

`post.author` が「ただの属性」に見えて、実は毎回 DB アクセスしている。これが N+1 の温床。

### 2.2 ループの中の手書きクエリ

ORM を使わなくても、ループ内で都度 `SELECT` を書けば同じことが起きる。

```javascript
const posts = await db.query("SELECT * FROM posts");
for (const post of posts) {
  // ループの中でクエリ → N+1
  post.author = await db.query("SELECT * FROM users WHERE id = ?", [post.author_id]);
}
```

### 2.3 GraphQL のリゾルバ

GraphQL は各フィールドごとにリゾルバが走るため、ネストした関連 (`posts { author { name } }`) で素朴に実装すると N+1 が起きやすい。

## 3. 何が問題なのか（悪さ）

- **レイテンシの悪化**: クエリ 1 本ごとにネットワーク往復 (RTT) が発生。1 本 1ms でも 1,000 本で 1 秒。アプリとDBが別ホストなら往復遅延が支配的になる
- **DB 負荷の増大**: 接続取得・パース・プランニングのオーバーヘッドがクエリ本数分かかる。コネクションプールを食いつぶす
- **スケールしない**: データ件数に比例してクエリが増える。開発時(10件)は速くても本番(1万件)で破綻する。**件数が少ないうちは顕在化しない**のが厄介
- **見えにくい**: ORM のせいでコード上は 1 行。コードレビューでも気づかれず、障害になって初めて発覚しやすい

要するに「動くけど遅い、しかもデータが育つほど悪化する」時限爆弾。

## 4. どう検知するか

- **クエリログを見る**: 開発環境で SQL ログを出し、1 画面の表示で何本クエリが飛んでいるか数える。同じ形のクエリが大量に並んでいたら N+1
- **ORM のクエリカウンタ**: Django Debug Toolbar、Rails の `Bullet` gem、Laravel Telescope などが N+1 を自動警告してくれる
- **APM / トレーシング**: [[OTel]] などの分散トレースでスパンを見ると、同種の DB スパンが大量に並ぶ形で可視化される
- **テストで縛る**: 「この処理は最大 N 本まで」とクエリ本数をアサートするテストを書くと再発を防げる

## 5. 解決法

核心は **「ループの中でクエリを投げない」「関連データはまとめて 1〜数本で取る」**。

### 5.1 JOIN でまとめて取る（イーガーローディング）

関連テーブルを最初から結合して 1 本で取得する。

```sql
SELECT posts.*, users.name AS author_name
FROM posts
JOIN users ON users.id = posts.author_id;
```

ORM では「eager loading」の指定をする。

```python
# Django: select_related (1:1 / 多:1 を JOIN)
posts = Post.objects.select_related("author").all()
# → JOIN 1 本で著者ごと取得
```

```ruby
# Rails: includes
Post.includes(:author).each { |post| puts post.author.name }
```

### 5.2 IN 句でバッチ取得する

JOIN の代わりに「親を取る 1 本」+「子をまとめて取る 1 本」の **2 本**にする方法。1:N の関連で行が増えすぎるのを避けたいときに有効。

```sql
-- [1] 記事を取得
SELECT * FROM posts;
-- [2] 出てきた author_id をまとめて 1 本で
SELECT * FROM users WHERE id IN (1, 2, 3, ..., 100);
```

```python
# Django: prefetch_related は内部でこの IN 方式を使う（1:N / N:N 向き）
posts = Post.objects.prefetch_related("comments").all()
```

`select_related` = JOIN 方式、`prefetch_related` = IN 方式、と覚えると整理しやすい。Rails の `includes` は状況に応じてどちらかを自動選択する。

### 5.3 DataLoader パターン（GraphQL 等）

[[DataLoader]] は「同一イベントループ内で発生した個別の id 取得要求を**自動でまとめて 1 本の `IN` クエリ**にする」ライブラリ。GraphQL の N+1 対策の定番。

```javascript
const userLoader = new DataLoader(async (ids) => {
  const rows = await db.query("SELECT * FROM users WHERE id IN (?)", [ids]);
  return ids.map((id) => rows.find((r) => r.id === id));
});
// リゾルバ内では userLoader.load(authorId) を呼ぶだけ。
// 個別の load() が裏で 1 本の IN クエリに束ねられる。
```

### 5.4 手書きクエリなら自分で束ねる

ORM を使わない場合は、ループの外で関連 id を集め、`IN` でまとめて取り、メモリ上で突き合わせる。

```javascript
const posts = await db.query("SELECT * FROM posts");
const authorIds = [...new Set(posts.map((p) => p.author_id))];
const authors = await db.query(
  "SELECT * FROM users WHERE id IN (?)", [authorIds]
);
const byId = new Map(authors.map((a) => [a.id, a]));
posts.forEach((p) => { p.author = byId.get(p.author_id); });
```

## 6. JOIN と IN（バッチ）の使い分け

| 観点 | JOIN 方式 | IN（バッチ）方式 |
|---|---|---|
| クエリ本数 | 1 本 | 2 本（親 + 子） |
| 向いている関連 | 多:1 / 1:1 | 1:N / N:N |
| 行数の膨張 | 1:N だと親行が**重複**して増える | 重複しない |
| 転送量 | 重複分だけ無駄が出やすい | 無駄が少ない |
| 実装 | ORM の select_related 等 | ORM の prefetch_related / DataLoader |

1:N を JOIN すると「親 1 件 × 子 100 件 = 100 行」に膨らみ、親のカラムが 100 回繰り返される。こういうときは IN 方式が素直。多:1（記事→著者）は JOIN が素直。

## 7. やり過ぎ注意

- **全部 eager load すればいい、ではない**: 使わない関連まで先読みすると、逆に無駄なデータ転送になる。「その画面で実際に使う関連だけ」先読みする
- **JOIN しすぎも遅い**: 5 個も 6 個もテーブルを結合すると 1 本のクエリ自体が重くなる。N+1 を潰すために巨大 JOIN を作って別の問題を生むことがある
- **ページネーションと 1:N JOIN は相性が悪い**: `LIMIT` が「膨張した行」に対してかかり、意図した件数にならない。1:N はバッチ方式が安全

## 8. まとめ

- N+1 = 一覧 1 本 + 各行ごとに関連取得 N 本。**ORM の遅延ロードで無自覚に発生**
- 悪さ: レイテンシ悪化・DB 負荷増・データ件数に比例して悪化・コード上見えない
- 検知: クエリログ、ORM の N+1 検出ツール、APM トレース、クエリ本数テスト
- 解決: **ループ内でクエリを投げない**。多:1 は JOIN（eager load）、1:N は `IN` バッチ、GraphQL は [[DataLoader]]
- 「動くけど遅い」典型なので、開発時の少データで気づかず本番で顕在化する点に最も注意

## 関連MOC

- [[MOC Learning]]

## 関連ノート

- [[SQL ビューの基礎と使いどころ]] — ビューも「元クエリが遅ければ遅い」、N+1 とあわせクエリ設計の基礎
- [[SQL]]
- [[ORM]]
- [[クエリ最適化]]
- [[DataLoader]]
