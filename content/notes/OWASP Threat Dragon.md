---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Threat Dragon
---

# OWASP Threat Dragon

> [!summary]
> **OWASP Threat Dragon** は OWASP が公開している OSS の脅威モデリングツール。データフロー図 (DFD) を描き、[[STRIDE]] フレームワーク（Spoofing / Tampering / Repudiation / Information Disclosure / Denial of Service / Elevation of Privilege）に沿って各コンポーネント・データフローに対する脅威を列挙・記録する。Webアプリ版とデスクトップ版（Electron）があり、無料で本格的な脅威モデリングが始められる。

## 何ができるか

- **DFD描画**: Process / External Entity / Data Store / Data Flow / Trust Boundary を直感的に配置
- **STRIDE 自動候補**: 各要素タイプに応じた脅威候補を表示
- **脅威ごとの記録**: 脅威の説明、影響度、対策、状態（Open/Mitigated/Transferred/Accepted）
- **レポート出力**: JSON / PDF / Markdown
- **Git管理**: モデルファイル（`.json`）をリポジトリにコミット可能 → 設計レビューPRに紐付けられる

## 脅威モデリングの位置づけ

[[脅威モデリング]] は「設計段階で脆弱性を予測し、対策コストの安いタイミングで埋め込む」プロセス。コードを書き始める前、API設計が固まる前にやるのが理想。Threat Dragon は **学習者・小規模チーム** に最も合う選択肢。

## 競合・代替

| ツール | 提供元 | 特徴 |
|---|---|---|
| **OWASP Threat Dragon** | OWASP | OSS, Web/Desktop |
| Microsoft Threat Modeling Tool | MS | Windows専用, STRIDE自動 |
| IriusRisk | 商用 | エンタープライズ向け、CI連携が強い |
| pytm | OWASP | Python DSL でモデル記述（コード化） |
| Threagile | OSS | YAML駆動、CI/CD親和性が高い |

## 使い始めの流れ

1. アプリの **業務フロー** を頭に置く
2. 主要な **コンポーネント（Web、API、DB、外部サービス）** を Process / Data Store として配置
3. **Trust Boundary**（インターネット境界、VPC境界、認証境界）を線で囲う
4. **データフロー** を矢印で繋ぐ
5. 各要素に対して STRIDE で脅威を1つずつ検討
6. 対策（既存 or 追加）を書き込む
7. 残存リスクを Accept / Transfer / Mitigate / Avoid のいずれかに分類

## 実務でのコツ

- **完璧を目指さない**: 100点の脅威モデルより、60点が継続的に更新される方が圧倒的に価値がある
- **新機能リリースのたびに見直す**: アーキテクチャ変更が脅威マップを必ず変える
- **[[OWASP ASVS]] と組み合わせる**: 脅威 → ASVS要件、で対策を具体化

## 出典

- OWASP Threat Dragon: https://owasp.org/www-project-threat-dragon/
- GitHub: https://github.com/OWASP/threat-dragon
- STRIDE 解説: https://learn.microsoft.com/security/engineering/threat-modeling

## 関連MOC

- [[MOC Security]]

## 関連ノート

- [[脅威モデリング]]
- [[OWASP]]
- [[OWASP ASVS]]
- [[A04 Insecure Design]]
- [[セキュリティ標準とフレームワーク]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
