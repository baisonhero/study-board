---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Common Weakness Enumeration
---

# CWE

> [!summary]
> **CWE (Common Weakness Enumeration)** はソフトウェアやハードウェアにおける **脆弱性の"型"** をカテゴリ化した MITRE 管理のリスト。[[CVE]] が「個別の脆弱性事例」を識別するのに対し、CWE は「その脆弱性が**どの種類の弱点**から発生したか」を分類する。たとえば `CVE-2021-44228 (Log4Shell)` の弱点タイプは `CWE-502: Deserialization of Untrusted Data`。OWASP / [[OWASP ASVS]] / [[SAST]] の検知ルールが全部 CWE で語られる。

## CVE と CWE の違い

| 観点 | [[CVE]] | CWE |
|---|---|---|
| 単位 | 1製品の1脆弱性 | 弱点タイプ |
| 例 | `CVE-2021-44228` (Log4j) | `CWE-502` (Deserialization) |
| 用途 | パッチ追跡 | 設計レビュー、検知ルール |
| 数 | 23万件以上 | 約940件 |
| 関係 | 個別事例 | 型・パターン |

CVE には通常 **1つ以上のCWEがタグ付け** される。

## 重要なCWEカテゴリ例

- **CWE-79**: XSS（Cross-Site Scripting）
- **CWE-89**: SQL Injection
- **CWE-22**: Path Traversal
- **CWE-78**: OS Command Injection
- **CWE-287**: Improper Authentication
- **CWE-862**: Missing Authorization
- **CWE-352**: CSRF
- **CWE-918**: SSRF（[[A10 SSRF]] に対応）
- **CWE-502**: Deserialization of Untrusted Data
- **CWE-798**: ハードコードされた認証情報

## CWE Top 25

毎年MITREが**実世界の影響度** + **頻度**で Top 25 を発表（旧 CWE/SANS Top 25）。OWASP Top 10 と並ぶ業界指標。2024年版では XSS、Out-of-bounds Write、SQLi、CSRF、Path Traversal が上位。

## SAST/SCA ツールとの関係

[[SAST]] / [[SCA]] / [[DAST]] が検出する各脆弱性は、結果に **CWE-ID** が必ず付く。これにより：

- **横断比較**: ツールAとツールBの検知結果を統一指標で比較
- **進捗管理**: 「CWE-79対応率: 80%」のような指標が立てられる
- **コンプライアンス**: ASVS / PCI-DSS が CWE で要件を語る

## OWASP Top 10 / ASVS / NIST との関係

- [[OWASP Top 10]]: CWEを **10カテゴリにグルーピング** したもの。たとえば A03 Injection は CWE-89/CWE-78/CWE-77 など複数を含む
- [[OWASP ASVS]]: 各要件に CWE-ID を明示
- NIST SP 800-53 / PCI-DSS / FedRAMP: 統制と CWE のマッピング表が公開されている

CWE を起点に上記すべてに横断できるのが大きい。

## 出典

- MITRE CWE: https://cwe.mitre.org/
- CWE Top 25 (2024): https://cwe.mitre.org/top25/

## 関連MOC

- [[MOC Security]]

## 関連ノート

- [[CVE]]
- [[CVSS]]
- [[OWASP]]
- [[OWASP Top 10]]
- [[OWASP ASVS]]
- [[SAST]]
- [[セキュリティ識別子の体系]]
- [[セキュリティ標準とフレームワーク]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
