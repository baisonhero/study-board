---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - OWASP Cheat Sheets
---

# OWASP Cheat Sheet Series

> [!summary]
> **OWASP Cheat Sheet Series** は OWASP が運営する**Webアプリ開発者向けセキュリティ実装ガイド集**。SQLi対策、XSS防止、CSRF対策、JWT・パスワード・認証セッション・暗号化・Docker・Kubernetes・REST API・GraphQL など、100以上のテーマが**実装レベルの具体コード例**を含めてまとめられている。OWASP Top 10 が「分類と概念」だとすれば、こちらは「実装の現場で参照する辞書」。

## 構成

各シートは以下のフォーマット：

- **目的**: 何のための対策か
- **背景**: 該当する [[CWE]] / [[OWASP Top 10]] カテゴリ
- **推奨実装**: コード例、ライブラリ、設定
- **避けるべきアンチパターン**
- **参考文献・関連シート**

## 代表的なチートシート

| シート | 該当カテゴリ |
|---|---|
| Authentication Cheat Sheet | [[A07 Identification and Authentication Failures]] |
| Authorization Cheat Sheet | [[A01 Broken Access Control]] |
| Cross-Site Scripting Prevention | [[A03 Injection]] |
| SQL Injection Prevention | A03 |
| Cryptographic Storage | [[A02 Cryptographic Failures]] |
| Session Management | A07 |
| Password Storage | A07 |
| REST Security | API全般 |
| JWT for Java | A07 |
| CSRF Prevention | A01 |
| Content Security Policy | [[CSP]] |
| Secure Headers (HSTS, X-Frame-Options...) | [[A05 Security Misconfiguration]] |
| Docker Security | コンテナ |
| Kubernetes Security | K8s |
| Threat Modeling | [[脅威モデリング]] |
| Logging | [[A09 Security Logging and Monitoring Failures]] |
| Input Validation | A03 |

## 使い方

- **新規機能を作るたびに該当シートを確認**: 認証フロー、ファイルアップロード、ログ実装などのタイミング
- **PR レビュー時の根拠**: 「このコードは OWASP Authentication Cheat Sheet の §3.2 に反します」と引用
- **オンボーディング教材**: 入社時に主要シート（A01〜A03 関連）を読む

## 維持運営

- GitHub で公開、コミュニティのPRで継続更新
- 改訂頻度が高い（フレームワーク・ライブラリのバージョン追従）
- 日本語訳はコミュニティで一部進行

## 関連の OWASP プロジェクト

- [[OWASP Top 10]]: 概念分類
- [[OWASP ASVS]]: 検証基準（網羅版）
- **OWASP ProActive Controls**: 開発者向け "やるべきこと10選"
- [[OWASP Juice Shop]]: 実演用脆弱アプリ
- [[OWASP ZAP]]: 脆弱性スキャナ
- [[OWASP Threat Dragon]]: 脅威モデリングツール

## 出典

- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- GitHub: https://github.com/OWASP/CheatSheetSeries

## 関連MOC

- [[MOC Security]]

## 関連ノート

- [[OWASP]]
- [[OWASP Top 10]]
- [[OWASP ASVS]]
- [[Web脆弱性の実装防御]]
- [[CSP]]
- [[認証と認可]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
