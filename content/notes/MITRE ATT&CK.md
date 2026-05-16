---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - ATT&CK
  - MITRE ATT&CK Framework
---

# MITRE ATT&CK

> [!summary]
> **MITRE ATT&CK** は米国非営利MITREが整備している **攻撃者のTTP（Tactics, Techniques, Procedures）** のナレッジベース。実際のインシデント・APT分析から得られた攻撃技術を**段階別**にカタログ化しており、防御側が「自社はどの攻撃に弱いか」「検知ルールはどの技術をカバーしているか」を点検する共通言語になっている。エンタープライズ / モバイル / ICS（産業制御）/ クラウド の4ドメイン版が公開されている。

## 構成

- **Tactics（戦術 / Why）**: 攻撃者の目的フェーズ。Initial Access → Execution → Persistence → Privilege Escalation → Defense Evasion → ... → Impact の14段階
- **Techniques（技術 / How）**: 各フェーズで使われる具体的手法。例: `T1566 Phishing`, `T1059 Command and Scripting Interpreter`
- **Sub-techniques**: より具体化。例: `T1566.001 Spearphishing Attachment`
- **Procedures**: 既知のAPT/マルウェアが実際に使った手順

## 防御側の使い方

### ATT&CK Navigator でカバレッジマップ

各SOC（Security Operations Center）が「**この技術はEDRで検知できる**」「**この技術は未対策**」を色塗りする。社内ロードマップで未対策を埋めていく。

### 検知ルール（Sigma / Splunk SPL）にATT&CK IDをタグ付け

```yaml
title: PowerShell Encoded Command
tags:
  - attack.execution
  - attack.t1059.001
detection:
  ...
```

検知ルールがどの技術をカバーしているかが自動集計できる。

### Purple Team 演習

Red Team（攻撃役）が `T1078 Valid Accounts` でログインし、Blue Team（防御役）が検知できるかを試す、というシナリオベース演習がATT&CK で言語化される。

## 学習リソース

- **MITRE ATT&CK Navigator**: https://mitre-attack.github.io/attack-navigator/
- **Atomic Red Team**: https://atomicredteam.io/ — ATT&CK技術ごとの実演スクリプト
- **CALDERA**: MITRE製の自動レッドチーミングプラットフォーム

## OWASP Top 10 との位置づけ

- [[OWASP Top 10]] は **Webアプリの脆弱性カテゴリ**（攻撃の入口の典型）
- ATT&CK は **攻撃者の全行動パターン**（侵入後のラテラルムーブまでカバー）
- 両者は **補完関係**。Web侵入 → 認証情報窃取 → 横展開 → データ持ち出し、の全フローをATT&CKは記述する

## クラウド版

`ATT&CK for Cloud` は AWS / Azure / GCP / SaaS 特化。`T1078.004 Cloud Accounts`、`T1199 Trusted Relationship` など、クラウド時代特有の技術がカタログ化されている。

## 出典

- MITRE ATT&CK: https://attack.mitre.org/
- Atomic Red Team: https://atomicredteam.io/

## 関連MOC

- [[MOC Security]]

## 関連ノート

- [[攻撃側視点とハンズオン学習]]
- [[OWASP Top 10]]
- [[インシデントレスポンス]]
- [[セキュリティ標準とフレームワーク]]
- [[コンテナとKubernetesセキュリティ]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
