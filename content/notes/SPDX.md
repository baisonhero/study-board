---
tags: [inbox, learning, security, devsecops]
created: 2026-05-05
auto-generated: 2026-05-05
aliases:
  - spdx
  - Software Package Data Exchange
---

# SPDX（Software Package Data Exchange）

> [!summary]
> Linux Foundation がホストする、ソフトウェアの **部品・ライセンス・サプライチェーン情報を交換するためのオープン標準**。ISO/IEC 5962:2021 として国際標準化されており、サプライヤー間の契約・コンプライアンス対応で事実上の共通言語。[[CycloneDX]] と並ぶ [[SBOM]] の二大フォーマットのひとつ。

## 立ち位置

- 出自: 2010年に Linux Foundation でスタート
- 目的: OSS ライセンス情報の正確な伝達 → 拡張して SBOM 全般へ
- 強み: ライセンス整合性、法務・コンプライアンス対応、長期保管・監査用途
- 標準化: **ISO/IEC 5962:2021** として承認済み（参考: [Wikipedia: Software Package Data Exchange](https://en.wikipedia.org/wiki/Software_Package_Data_Exchange)）

[[CycloneDX]] と比べると、SPDX は「サプライヤーが顧客や行政に渡す書類」としての性格が強い。

| 観点 | SPDX | [[CycloneDX]] |
|---|---|---|
| 出自 | Linux Foundation（ライセンス・コンプラ） | OWASP（セキュリティ） |
| 強み | ライセンス／法務／監査 | 脆弱性／VEX／DevSecOps |
| 標準化 | ISO/IEC 5962:2021 | ECMA-424 |
| フォーマット | JSON / YAML / RDF / Tag-Value / spreadsheet | JSON / XML / Protobuf |
| 文化 | 静的・契約寄り | 動的・運用寄り |

調達・コンプラ要件があれば SPDX、CI で動かすなら [[CycloneDX]] が好まれる傾向。両方出力する現場も多い。

## SPDX 3.0 の刷新（2024年4月公開）

長く使われてきた SPDX 2.x をベースに、3.0 は **モデルそのものを刷新**した（参考: [SPDX 3.0 Revolutionizes Software Management](https://www.linuxfoundation.org/press/spdx-3-revolutionizes-software-management-in-systems-with-enhanced-functionality-and-streamlined-use-cases) / [SPDX Specification v3.0.1](https://spdx.github.io/spdx-spec/v3.0.1/)）。

### プロファイル制（Profiles）

3.0 で導入された目玉。SPDX 2.x が「ひとつの仕様で全部表現する」設計だったのに対し、3.0 はユースケースごとに **プロファイル** を組み合わせる。

- **Core** — 全プロファイル共通の基盤（Element、Relationship、Identity 等）
- **Software** — SBOM、パッケージ、ファイル、スニペット
- **Licensing** — ライセンス情報（伝統的なSPDXの本丸）
- **Security** — 脆弱性情報、VEX 相当
- **AI** — AI モデルの BOM
- **Dataset** — 学習データセットのBOM
- **Build** — ビルドプロセスのメタデータ
- **Lite** — 簡易版

例えば「AI モデルとそのライセンス情報を渡す」なら Core + Software + Licensing + AI + Dataset の組み合わせで表現できる。

### 要素（Element）の独立性

SPDX 3.0 は **すべての要素が独立して参照可能** になるよう再設計された。2.x ではドキュメント単位での「封筒」の中に閉じていた情報が、3.0 では要素単位で他ドキュメントから参照できる。粒度の細かいSBOM管理や、複数のSBOMをまたぐ分析がしやすくなった。

## ライセンス情報の標準

SPDX の真価のひとつが **SPDX License List**。短い識別子（`MIT`, `Apache-2.0`, `GPL-2.0-only` 等）でライセンスを正確に表現する。GitHub・npm・Cargo・Maven 等のエコシステムが採用しているデファクト識別子。

```json
{
  "name": "express",
  "versionInfo": "4.19.2",
  "licenseConcluded": "MIT",
  "licenseDeclared": "MIT"
}
```

ライセンス監査・法務対応の機械化はこの識別子があるおかげで成立している。

## 主なツール

- **[[Syft]]**（Anchore） — SPDX/CycloneDX両対応、コンテナ・FS・OCI イメージから SBOM 生成
- **[[Trivy]]** — `--format spdx-json` で生成可能
- **GitHub Dependency Graph** — SPDX エクスポート可能（標準機能）
- **FOSSA / Black Duck / Snyk** — 商用、SPDX を取り込んで法務レポートを生成
- **SPDX 公式ツール群** — Java/Go/Rust/Python 各種ライブラリ、各言語のパッケージマネージャ向けジェネレータ

## 個人プロジェクトでの最小実装

```bash
# Trivy で SPDX 形式SBOMを生成
trivy image --format spdx-json --output sbom.spdx.json myapp:latest

# Syft で生成
syft myapp:latest -o spdx-json > sbom.spdx.json

# GitHub のリポジトリから直接エクスポート
# Settings → Security → Dependency graph → Export SBOM (SPDX形式)
```

調達側からSBOM提出を求められたときは、まずSPDX形式を出しておけば無難。

## 政策・コンプライアンス文脈

- **米国大統領令14028（2021年5月）** — 連邦政府向けソフトウェアにSBOM提出を義務化。SPDX/CycloneDX のいずれも受け入れ可
- **EU Cyber Resilience Act（CRA）** — EU 内でも同様の要件が広がる
- **NTIA Minimum Elements for an SBOM** — 米商務省 NTIA が定義した SBOM の必須項目セット。SPDX はこれを満たす設計

## 注意点

- ファイルレベルまで完全に記述するとサイズが大きくなる。粒度をどこまで細かく取るかはツール設定次第
- 2.x と 3.0 で構造が大きく違う。受信側のツールが対応しているか事前確認
- ライセンス識別子は SPDX License List に登録のないものも存在する。`LicenseRef-` プレフィックスでカスタム定義可能
- SBOM は「作って終わり」ではなく、CVE 追跡用に **継続的に再評価する** ことが重要 → [[SBOM]] と [[Dependabot]] と組み合わせる

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[SBOM]]
- [[CycloneDX]]
- [[Trivy]]
- [[Syft]]
- [[Dependabot]]
- [[サプライチェーン攻撃]]
- [[Log4Shell]]
- [[ソフトウェアサプライチェーン強化]]
- [[コンプライアンスと法規制]]

## 出典

- [SPDX 公式](https://spdx.dev/)
- [SPDX Specification v3.0.1](https://spdx.github.io/spdx-spec/v3.0.1/)
- [SPDX 3.0 Revolutionizes Software Management（Linux Foundation）](https://www.linuxfoundation.org/press/spdx-3-revolutionizes-software-management-in-systems-with-enhanced-functionality-and-streamlined-use-cases)
- [Wikipedia: Software Package Data Exchange](https://en.wikipedia.org/wiki/Software_Package_Data_Exchange)
- [The Complete Guide to SPDX（FOSSA）](https://fossa.com/learn/spdx/)

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-05）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
