---
tags: [inbox, learning, security, devsecops]
created: 2026-05-05
auto-generated: 2026-05-05
aliases:
  - cyclonedx
  - OWASP CycloneDX
  - CycloneDX BOM
---

# CycloneDX

> [!summary]
> OWASPが主導する、セキュリティ用途に振り切った **BOM（部品表）標準**。SBOMだけでなくSaaSBOM・HBOM・ML-BOM・CBOM・VEX・VDRなどを単一仕様で表現できる。Ecma International の ECMA-424 として国際標準化済みで、サプライチェーンセキュリティの実装で事実上の主流のひとつ。

## 立ち位置

[[SBOM]] のフォーマットは大きく [[SPDX]] と CycloneDX の2強。両者はしばしば比較されるが設計思想が違う。

| 観点 | CycloneDX | [[SPDX]] |
|---|---|---|
| 出自 | OWASP（セキュリティ） | Linux Foundation（ライセンス） |
| 強み | 脆弱性・VEX・サプライチェーンリスク | ライセンス整合性、法務・コンプラ |
| 標準化 | ECMA-424 | ISO/IEC 5962:2021 |
| フォーマット | JSON / XML / Protobuf | JSON / YAML / RDF / tag-value |
| カバレッジ | SBOM/SaaSBOM/HBOM/ML-BOM/CBOM/MBOM/OBOM/VDR/VEX | SBOM中心（3.0で大幅拡張） |

ざっくり「DevSecOps現場で動かす実装系」が CycloneDX、「サプライヤー間で契約・コンプラに耐える形式」が [[SPDX]] という棲み分け。両方を生成しておく現場も多い。

## 表現できるBOMの種類

CycloneDX の特徴は「成分表」の概念をソフトウェアに閉じず、システム全体に拡張していること。

- **SBOM** — 通常のソフトウェア部品表
- **SaaSBOM** — 外部SaaS依存（API・認証連携・データ流通）の可視化
- **HBOM** — ハードウェアの部品表
- **ML-BOM** — 機械学習モデル・学習データ・パラメータの部品表
- **CBOM**（Cryptography BOM） — 使用している暗号アルゴリズム・鍵長・ライブラリの一覧。ポスト量子暗号移行の準備に必須
- **MBOM/OBOM** — 製造・運用工程のBOM
- **VDR**（Vulnerability Disclosure Report） — 検出された脆弱性のレポート
- **VEX**（Vulnerability Exploitability eXchange） — 「含まれているが影響なし」を機械可読で示す

## VEX が強い理由

[[SBOM]] があっても「含まれている = 影響を受ける」ではない（コードパス到達不能、設定で無効、ランタイムで使われない 等）。これを補正する形式が VEX。CycloneDX は VEX を仕様内に統合しており、SBOM と VEX を同じツールチェーンで扱える。

例：`CVE-2021-44228`（[[Log4Shell]]）が含まれていても「該当機能を使っていない」と VEX で宣言できる。スキャナがこれを尊重すれば、誤検知（False Positive）を減らせる。

## バージョン推移

- **1.4** — VEX 統合の実用ライン（2022年〜）
- **1.5** — ML-BOM 追加（2023年）
- **1.6** — CBOM 追加（2024年、ポスト量子暗号移行を見据えて）
- **1.7** — `metadata.lifecycles[].phase` でSBOM生成タイミング（design / pre-build / build / post-build / operations / discovery / decommission）を明示。Data Provenance & Citations、Intellectual Property Transparency、暗号アサーション拡張、ライセンス詳細拡張など

仕様書とリリースノートは [CycloneDX/specification](https://github.com/CycloneDX/specification)、概要は [cyclonedx.org/specification/overview](https://cyclonedx.org/specification/overview/)。

## 主なツール

- **[[Trivy]]** — `--format cyclonedx` でSBOM出力
- **[[Syft]]** — Anchore製、CycloneDX/SPDX両対応
- **CycloneDX 公式CLI** — Maven / npm / pip / Cargo / Go modules など言語別ジェネレータが揃っている
- **GitHub Dependency Graph** — リポジトリのSettingsからSBOMをエクスポート可能
- **Dependency-Track**（OWASP） — CycloneDX SBOM を取り込んで継続的に脆弱性を再評価する管理ツール。CycloneDXとセットで使われがち

## 個人プロジェクトでの最小実装

```bash
# Dockerイメージから生成
trivy image --format cyclonedx --output sbom.cdx.json myapp:latest

# Node.jsプロジェクトから生成
npx @cyclonedx/cyclonedx-npm --output-file sbom.cdx.json
```

CIで毎リリースごとに artifact として保存しておけば、後から CVE が出たときに過去バージョンも遡って影響調査できる。詳細は [[ソフトウェアサプライチェーン強化]] 参照。

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[SBOM]]
- [[SPDX]]
- [[Trivy]]
- [[Syft]]
- [[Dependabot]]
- [[サプライチェーン攻撃]]
- [[Log4Shell]]
- [[ソフトウェアサプライチェーン強化]]
- [[アプリケーションセキュリティ ツール分類]]

## 出典

- [CycloneDX 公式](https://cyclonedx.org/)
- [GitHub: CycloneDX/specification](https://github.com/CycloneDX/specification)
- [Specification Overview](https://cyclonedx.org/specification/overview/)
- [SBOM Formats Compared: CycloneDX vs SPDX](https://sbomify.com/2026/01/15/sbom-formats-cyclonedx-vs-spdx/)

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-05）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
