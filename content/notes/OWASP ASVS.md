---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - ASVS
  - Application Security Verification Standard
---

# OWASP ASVS

> [!summary]
> **OWASP ASVS (Application Security Verification Standard)** は Web アプリケーションのセキュリティ要件を網羅的にチェックリスト化した OWASP の標準ドキュメント。[[OWASP Top 10]] が「最も多い10件」だとすれば、ASVS は「Webアプリで満たすべき要件のフルセット」。**Level 1 / 2 / 3** の3段階で、対象システムのリスクに応じて準拠レベルを選ぶ運用。

## 何が書いてあるか

V1〜V14 のカテゴリで Webアプリの全側面をカバー：

- V1: アーキテクチャ・設計・脅威モデリング
- V2: 認証（パスワード、MFA、セッション）
- V3: セッション管理
- V4: アクセス制御
- V5: バリデーション・サニタイゼーション・エンコーディング
- V6: 暗号
- V7: エラーハンドリング・ロギング
- V8: データ保護
- V9: 通信
- V10: 悪意あるコード
- V11: ビジネスロジック
- V12: ファイル・リソース
- V13: API・Web Service
- V14: 設定

各項目に「要件ID + 要件文 + 該当する [[CWE]] 番号」が紐付いている。たとえば `V2.1.1 64文字以上のパスワード長を許可していること (CWE-521)` のように。

## レベルの考え方

| Level | 対象 | カバー範囲 |
|---|---|---|
| **L1** | 自動スキャンで検出可能な最低限 | DAST / SAST で見つかる範囲 |
| **L2** | ほとんどのアプリで推奨される標準 | ペネトレーションテスト想定 |
| **L3** | 高セキュリティ要件（金融・ヘルスケア・政府系） | 手動レビュー + 全機能検査 |

「とりあえず L2 を目指す」が多くの組織の現実解。

## OWASP Top 10 との関係

- **Top 10**: 「これだけは絶対に外してはいけない」入門ガイド
- **ASVS**: 「網羅的な検証基準」上級ガイド

Top 10 のカテゴリは ASVS の特定要件に展開される。たとえば [[A01 Broken Access Control]] は ASVS V4 全体に対応する。

## 実務での使い方

- **要件定義**: 「このプロダクトは ASVS L2 準拠を目指す」と決め、機能要件と並行してセキュリティ要件をスプリントに入れる
- **セキュリティレビュー**: PR レビューや設計レビュー時のチェックリストとして使う
- **ペンテストSOW**: 外部委託の脆弱性診断で「ASVS L2 全項目を検査」と明示すると見積もりが揃う
- **自己検証**: [[脅威モデリング]] と組み合わせて自社プロダクトの抜けを発見

## 関連ツール

- **OWASP SAMM**: 組織レベルの成熟度モデル（ASVSは"プロダクト"単位）
- **OWASP MASVS**: モバイルアプリ版
- **OWASP ProActive Controls**: 「やるべきこと10選」開発者向けの軽量版

## 出典

- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- GitHub: https://github.com/OWASP/ASVS

## 関連MOC

- [[MOC Security]]

## 関連ノート

- [[OWASP Top 10]]
- [[OWASP]]
- [[CWE]]
- [[脅威モデリング]]
- [[セキュリティ標準とフレームワーク]]
- [[A01 Broken Access Control]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
