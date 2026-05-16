---
tags: [inbox, learning, product, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - RLS
  - Row Level Security
  - Supabase Row Level Security
---

# Supabase RLS

> [!summary]
> **Supabase RLS (Row Level Security)** は PostgreSQL 標準機能を Supabase が前面に押し出した **行単位アクセス制御**。クライアント（ブラウザ・モバイル）から `anon key` で直接Postgresを叩く設計が成立するのは、RLSが「他人の行は絶対に見せない」を**DB側で**強制してくれるおかげ。RLSポリシーが無効＝誰でも全行読み書き可、という致命的な状態になるので Supabase プロジェクトでは **最初に書くべきコード** の筆頭。

## なぜ存在するか

Supabase のアーキテクチャは **PostgREST + PostgreSQL** で、フロントエンドが直接DBに接続する。これは Firebase的なDX（バックエンド書かなくていい）を提供する一方で、**認証情報がクライアント側にある = SQL レベルで認可しないと終わる**ことを意味する。

RLS はその唯一の防衛線。Auth で得た JWT の `sub`（user id）を `auth.uid()` で取り出し、`USING (user_id = auth.uid())` のようなポリシーを書く。

## 基本構文

```sql
-- テーブルに RLS を有効化（最重要：忘れると全行公開）
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- SELECT ポリシー: 自分の投稿だけ読める
CREATE POLICY "users can read their own posts"
ON posts FOR SELECT
USING (auth.uid() = user_id);

-- INSERT ポリシー: 自分の user_id でしか挿入できない
CREATE POLICY "users can insert their own posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE/DELETE も同様
CREATE POLICY "users can update their own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

`USING` は既存行を見る条件、`WITH CHECK` は INSERT/UPDATE 後の行を検査する条件。両方書かないと「他人の行を `UPDATE` で `user_id` だけ書き換えて自分に移す」みたいな逃げ道が残る。

## よくある落とし穴

- **RLS有効化を忘れる**: `ENABLE ROW LEVEL SECURITY` が無いとポリシーがあっても効かない（Supabase Studio に警告が出る）
- **`service_role` キーをクライアントに渡す**: `service_role` は RLS を**バイパス**する。サーバーサイドのみで使う
- **JOINで他テーブルを参照する場合**: 参照先テーブルにもRLSが必要。Storage の `objects` テーブルも忘れずに
- **複雑なポリシー = 遅い**: ポリシー内のサブクエリが N+1 で走る場合がある。インデックス必須
- **匿名ユーザー（`anon` role）の権限**: `auth.uid()` が `NULL` になるので、`auth.uid() IS NOT NULL` を必須条件にしないと匿名でも通る

## 主要パターン

- **オーナーシップ**: `user_id = auth.uid()`
- **共有可能リソース**: `is_public = true OR user_id = auth.uid()`
- **チームメンバーシップ**: 別テーブル `team_members` を JOIN
- **ロールベース**: JWT claims に `role` を入れて `(auth.jwt() ->> 'role') = 'admin'`

## OWASP Top 10 との関係

[[A01 Broken Access Control]] が Supabase で起きるとしたら、ほぼ100% RLS の書き漏れ。**「Webアプリの第一の脆弱性 = アクセス制御」を、Supabaseは"DBに押し下げて解く"** という設計判断をしている。

## 出典

- Supabase RLS Docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- PostgreSQL RLS Docs: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

## 関連MOC

- [[MOC Product]]
- [[MOC Security]]

## 関連ノート

- [[A01 Broken Access Control]]
- [[認証と認可]]
- [[プロダクト開発における個人情報保護]]
- [[Claude Life OS 設計書]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
