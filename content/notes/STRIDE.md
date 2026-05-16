---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Spoofing Tampering Repudiation Information Disclosure DoS Elevation
---

# STRIDE

> [!summary]
> **STRIDE** は Microsoft が提唱した脅威モデリングの6カテゴリ。**S**poofing / **T**ampering / **R**epudiation / **I**nformation Disclosure / **D**enial of Service / **E**levation of Privilege の頭文字。データフロー図 (DFD) の各要素 (Process / Data Flow / Data Store / External Entity) ごとに「この要素はどの脅威にさらされるか」を列挙し、対策の有無を確認する基礎フレームワーク。[[OWASP Threat Dragon]] / Microsoft Threat Modeling Tool の中核。

## 6つの脅威カテゴリ

| 略号 | 脅威 | 影響するセキュリティ特性 | 例 |
|---|---|---|---|
| **S** | Spoofing (なりすまし) | Authentication | パスワード盗用、JWT偽造 |
| **T** | Tampering (改ざん) | Integrity | リクエストパラメータ書き換え、DB改竄 |
| **R** | Repudiation (否認) | Non-repudiation | 監査ログ欠如で「やってない」が成立 |
| **I** | Information Disclosure (情報漏洩) | Confidentiality | ログにPII、APIから他人の情報露出 |
| **D** | Denial of Service (DoS) | Availability | リソース枯渇、増幅攻撃 |
| **E** | Elevation of Privilege (権限昇格) | Authorization | 一般ユーザー→管理者、SUID 悪用 |

## DFD要素ごとの該当脅威

Microsoft の Threat Modeling Tool では DFD 要素ごとに **デフォルト適用される STRIDE** が決まっている：

| 要素 | 適用される STRIDE |
|---|---|
| External Entity | S, R |
| Process | S, T, R, I, D, E |
| Data Flow | T, I, D |
| Data Store | T, R, I, D |

たとえば「クライアント → APIサーバー」のデータフローには T (改ざん) / I (盗聴) / D (DoS) を検討する。

## 適用ステップ

1. **DFD を描く**: Process / Data Flow / Data Store / External Entity / Trust Boundary を配置
2. **要素ごとに STRIDE を列挙**: 該当する脅威カテゴリを書き出す
3. **既存の対策を確認**: TLS、認証、認可、レートリミット等
4. **残存リスクを判定**: Accept / Mitigate / Transfer / Avoid
5. **アクションアイテムを起票**: Jira / GitHub Issues に対策タスクを切る

## 強み・弱み

**強み**:

- カテゴリが少なく学習コストが低い
- DFD と組み合わせて視覚的
- Microsoft / OWASP のサポートツールが豊富

**弱み**:

- 複雑な攻撃チェーンを 1 カテゴリに収めにくい
- ビジネスロジック起因の脅威 (フロー操作等) が見えにくい
- 「STRIDE埋まったから完了」と慢心しやすい

## 代替・補完フレームワーク

- **PASTA (Process for Attack Simulation and Threat Analysis)**: ビジネスインパクト起点
- **OCTAVE**: 組織リスク全般
- **LINDDUN**: プライバシー特化（PII処理アプリ向け）
- **MITRE ATT&CK**: 攻撃技術カタログ（[[MITRE ATT&CK]] 参照）

STRIDE で大枠を埋め、ATT&CK で具体的な手法を当てる、という併用が現代的。

## 出典

- Microsoft Threat Modeling Tool: https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool
- STRIDE Explained: https://learn.microsoft.com/security/engineering/threat-modeling

## 関連MOC

- [[MOC Security]]

## 関連ノート

- [[脅威モデリング]]
- [[OWASP Threat Dragon]]
- [[A04 Insecure Design]]
- [[MITRE ATT&CK]]
- [[OWASP ASVS]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
