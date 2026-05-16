---
tags: [inbox, learning, security, devsecops]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - sca
  - Software Composition Analysis
  - ソフトウェアコンポジション分析
---

# SCA

> [!summary]
> **SCA (Software Composition Analysis)** はアプリケーションが使っている**サードパーティ依存（OSS）に既知の脆弱性が含まれていないか**をスキャンする手法・ツールカテゴリ。[[ファーストパーティコードとサードパーティコード]] のサードパーティ側を担当し、[[SAST]]（自前コード）と対をなす。代表ツールは [[Dependabot]] / [[Trivy]] / Snyk / OWASP Dependency-Check / Grype / [[Semgrep]] supply-chain など。

## 何を見ているか

SCAは「自分で書いていないコード」に責任を負う。具体的には：

- 言語別のロックファイル（`package-lock.json` / `poetry.lock` / `Gemfile.lock` / `go.sum` / `Cargo.lock` など）
- コンテナイメージ内の OS パッケージ・言語ライブラリ
- [[SBOM]]（[[CycloneDX]] / [[SPDX]]）から逆引き

これらを **脆弱性データベース（[[GitHub Advisory Database]] / [[OSV.dev]] / NVD / ベンダー独自DB）** と突き合わせ、[[CVE]] 番号・[[CVSS]] スコア・該当バージョン範囲・修正済みバージョンを通知する。

## SAST / DAST との位置づけ

| 観点 | [[SAST]] | **SCA** | [[DAST]] |
|---|---|---|---|
| 対象 | 自前ソース | 依存ライブラリ | 動いているアプリ |
| 検査タイミング | コミット / PR | コミット / PR / リリース後も継続 | ステージング / 本番 |
| 検出する脆弱性 | SQLi, XSS, ハードコード鍵 | 既知CVE, ライセンス違反 | 認証バイパス, IDOR |
| 偽陽性 | やや多い | 少ない（CVEは事実） | 中程度 |

SCAの大きな特徴は **リリース後も継続的にスキャンし続ける** こと。新しい [[CVE]] は毎日公開されるので、過去のリリースに対する遡及スキャンが必須。

## 主要ツール

- **[[Dependabot]]**（GitHub標準・無料）— PR自動作成までやる
- **[[Trivy]]**（Aqua, OSS）— コンテナとIaCも見られる総合スキャナ
- **Grype + [[Syft]]**（Anchore）— SBOM起点での運用に最適化
- **Snyk**（商用 + OSSティア）— 開発者UXが強い
- **OWASP Dependency-Check**（OSS）— Java/Mavenが歴史的に強い
- **GitHub Advanced Security**（GHAS）— Dependency review + Code scanning統合

## 運用のキモ

- **ロックファイルが必須**: SCAは「実際に使っているバージョン」を見る。ロックファイルが無いとプロジェクト全体が誤検知だらけになる
- **脆弱性ノイズの管理**: 全件対応は不可能。[[CVSS]] スコアと **実際に脆弱コードパスを呼んでいるか（reachability）** で優先順位を付ける
- **修正版が無いCVE**: ベンダーが見捨てた古いライブラリは、代替ライブラリへの移行か isolation で対処する
- **SBOM保存**: [[Log4Shell]] のような事件の時、過去リリースのSBOMがあれば即座に影響範囲が分かる

## OWASP Top 10 との関係

[[A06 Vulnerable and Outdated Components]] が SCA の存在理由そのもの。「使っている依存が古いまま放置されると侵入される」というカテゴリで、毎年OWASPランキングに残り続けている古典的問題。

## 出典

- OWASP SCA: https://owasp.org/www-community/Component_Analysis
- GitHub Dependabot: https://docs.github.com/en/code-security/dependabot
- Snyk SCA overview: https://snyk.io/series/open-source-security/software-composition-analysis-sca/

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]

## 関連ノート

- [[SAST]]
- [[DAST]]
- [[SBOM]]
- [[Dependabot]]
- [[Trivy]]
- [[Syft]]
- [[CVE]]
- [[CVSS]]
- [[A06 Vulnerable and Outdated Components]]
- [[ファーストパーティコードとサードパーティコード]]
- [[ソフトウェアサプライチェーン強化]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
