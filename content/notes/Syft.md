---
tags: [inbox, learning, security, devsecops]
created: 2026-05-06
auto-generated: 2026-05-06
aliases:
  - syft
  - anchore/syft
  - Syft (SBOM Generator)
---

# Syft

> [!summary]
> Anchore が開発する OSS の **[[SBOM]] 生成専用ツール**。コンテナイメージ・ファイルシステム・OCIアーカイブから依存パッケージを一括抽出し、[[CycloneDX]] / [[SPDX]] / Syft独自JSON など主要フォーマットで出力できる。脆弱性スキャンは持たず、**「材料表を作ること」だけに特化** しているのが思想。脆弱性検知は同じAnchore製の Grype や [[Trivy]] と組み合わせて使うのが定番。

## 何をするツールか

Syft の役割はひとつ — **「このイメージ／コードベースに何が入っているか」を機械可読な形で書き出す**。具体的には：

- OS パッケージ（Alpine apk / Debian dpkg / RPM / Arch）
- 言語ライブラリ（npm / pip / Maven / Gradle / Cargo / Go modules / Composer / RubyGems / Cocoapods 等）
- バイナリの追跡（Goバイナリのモジュール情報、Java の MANIFEST など）
- ファイルダイジェスト（オプション）

これを CycloneDX / SPDX のような標準フォーマットに変換することで、後段のツール（脆弱性スキャナ、ライセンスチェッカ、サプライチェーン管理プラットフォーム）に渡せる。

## なぜ独立しているか — Trivy との棲み分け

[[Trivy]] も SBOM 出力に対応しているが、Syft が別ツールとして残る理由は：

| 観点 | Syft | [[Trivy]] |
|---|---|---|
| 主目的 | SBOM 生成 | 総合スキャン（脆弱性／IaC／シークレット） |
| 検出範囲 | パッケージ網羅性に強い（Goバイナリ等） | 脆弱性照合に強い |
| 連携 | Grype / Anchore Enterprise | 単独完結 |
| 出力形式 | CycloneDX / SPDX / 独自 JSON / Table / Text | CycloneDX / SPDX / SARIF など |

「SBOM を一次資料として長期保存し、後で何度でも脆弱性スキャンをやり直したい」場合、SBOM生成と脆弱性スキャンを分けたほうが運用が綺麗。Syft + Grype はその思想を一番素直に実装している。

## 基本コマンド

```bash
# Docker / OCI イメージから SBOM 生成
syft myapp:latest

# CycloneDX JSON で書き出し
syft myapp:latest -o cyclonedx-json > sbom.cdx.json

# SPDX JSON で書き出し
syft myapp:latest -o spdx-json > sbom.spdx.json

# ファイルシステム（プロジェクトルート）
syft dir:.

# OCI アーカイブから
syft oci-archive:./image.tar

# tar アーカイブから
syft docker-archive:./image.tar
```

`-o` には `table`（人間向け）、`json`（Syft独自）、`cyclonedx-xml`、`cyclonedx-json`、`spdx-tag-value`、`spdx-json`、`github-json` などが指定可能。複数同時出力もできる。

## Grype との連携

Grype（Anchoreの脆弱性スキャナ）は Syft の出力をそのまま入力にできる：

```bash
# パイプで脆弱性スキャン
syft myapp:latest -o json | grype

# 既存の SBOM ファイルから
grype sbom:./sbom.cdx.json
```

イメージのpullや依存解析を都度やらなくて済むため、CIが速くなる。SBOM 自体を artifact として S3 などに長期保存しておけば、後日新しい [[CVE]] が公表されたときに再スキャンができる（**過去のリリースが今も脆弱か** を答えられる）。

## CI/CD での使い方

GitHub Actions では [anchore/sbom-action](https://github.com/anchore/sbom-action) が公式。

```yaml
- name: Generate SBOM
  uses: anchore/sbom-action@v0
  with:
    image: ghcr.io/owner/app:${{ github.sha }}
    format: cyclonedx-json
    output-file: sbom.cdx.json

- name: Upload SBOM artifact
  uses: actions/upload-artifact@v4
  with:
    name: sbom
    path: sbom.cdx.json
```

GitHub の Release に SBOM を添付したり、[[A06 Vulnerable and Outdated Components]] で参照される **「リリースのたびにSBOMを残す」運用** に向いている。

## ライセンス検出

Syft は依存ごとのライセンス情報も拾うので、SPDX 形式で書き出すとライセンス監査の一次資料にもなる。OWASP Dependency-Track や FOSSA に取り込めば、ライセンス違反の継続監視が可能。

## サプライチェーン文脈

[[ソフトウェアサプライチェーン強化]] の文脈では：

- **生成（Syft）** → **保存（CycloneDX/SPDX のartifact）** → **監視（Dependency-Track / Grype）**
- [[Log4Shell]] のようなインシデント発生時、過去のリリースが影響を受けたかを SBOM だけで答えられる
- [[Dependabot]] が「未来のPR」だとすれば、SBOM + Grype は「過去のリリース」に対する遡及検査

## 出典

- Syft GitHub: https://github.com/anchore/syft
- Anchore SBOM ガイド: https://anchore.com/sbom/
- anchore/sbom-action: https://github.com/anchore/sbom-action

## 関連MOC

- [[MOC DevSecOps]]
- [[MOC Security]]

## 関連ノート

- [[SBOM]]
- [[CycloneDX]]
- [[SPDX]]
- [[Trivy]]
- [[Dependabot]]
- [[A06 Vulnerable and Outdated Components]]
- [[サプライチェーン攻撃]]
- [[Log4Shell]]
- [[ソフトウェアサプライチェーン強化]]
- [[CVE]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-06）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
