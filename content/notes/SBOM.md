---
tags: [inbox, learning, security]
created: 2026-04-26
aliases:
  - Software Bill of Materials
  - ソフトウェア部品表
---

# SBOM（Software Bill of Materials）

> [!summary]
> ソフトウェアに含まれている **部品の成分表**。使ってる依存ライブラリ・バージョン・ライセンス・ハッシュなどを構造化データで持つ。サプライチェーン攻撃や新規CVE発覚時に「どこに何が入ってるか」を即座に答えるための基盤。

## なぜ必要になったか

食品の原材料表示と同じ発想。ソフトウェアに含まれる第三者ライブラリの数は膨大で、把握できていないと脆弱性対応が後手に回る。

象徴的な事例：

- **Log4Shell（2021）** — Java製の log4j ライブラリのゼロデイ。世界中の企業が「うちのシステムに log4j 入ってる？どのバージョン？」を即答できず、数日〜数週間の対応遅延。SBOMがあれば検索一発だった。
- **xz-utils backdoor（2024）** — 圧縮ライブラリxzに長期計画的に仕込まれたバックドア。発見が偶然だったこともあり、業界全体で「依存の可視化が足りてない」という反省材料になった。

## 政策・標準化の流れ

- **米国大統領令14028（2021年5月）** — 連邦政府に納入するソフトウェアにSBOM提出を義務化。これでSBOMが業界標準になる流れが決定的に。
- **EU Cyber Resilience Act（CRA）** — EUでも同様の方向。
- **NTIA**（米商務省 国家電気通信情報庁）が SBOM の最低要素（minimum elements）を定義。

## 主要フォーマット

| フォーマット | 出自 | 特徴 |
|---|---|---|
| **[[SPDX]]** | Linux Foundation | ライセンス情報に強い、ISO/IEC 5962:2021 として標準化 |
| **[[CycloneDX]]** | OWASP | セキュリティ用途に振っている、軽量、VEX（Vulnerability Exploitability eXchange）に強い |
| **SWID** | NIST | 古め、資産管理寄り |

どちらもJSON/XMLで出力可能で、ツール間で相互変換可能。

## 主なツール

- **[[Syft]]**（Anchore製、OSS）— コンテナイメージやソースから一発でSBOM生成。CycloneDX/SPDX両対応
- **[[Trivy]]** — SCAスキャナだが SBOM 出力にも対応[]()
- **GitHub Dependency Graph** — リポジトリのSettings から SBOM をエクスポート可能（標準機能）
- **Snyk** / **Dependabot** / **Anchore** など主要なSCAツールはおおむね対応
- **CycloneDX CLI** — 各言語のパッケージマネージャ用の専用ジェネレータあり（Maven、npm、pip 等）

## SCAとの関係

[[SAST]] / [[DAST]] / [[SCA]] / [[CNAPP]] のうち、SBOMは特に **SCA** と強く結びつく。

```
SCAツール ──生成──→ SBOM ──インプット──→ 脆弱性スキャナ / [[CNAPP]] / 監査ツール
```

最近の主流は「SCAでスキャンする」より「**SBOMを成果物として吐いて、それを別のツールで継続的に再評価する**」パターン。一度作ったSBOMを vulnerability database（[[GitHub Advisory Database]]、[[OSV.dev]]）と突き合わせ続ければ、新しいCVEが出た時に自動で影響範囲がわかる。

## VEX（補足概念）

SBOMがあっても「**含まれている = 影響を受ける**」ではない（コードパスから到達不能、設定で無効化、等）。これを補足する形式が **VEX（Vulnerability Exploitability eXchange）**。「SBOM上はlog4jを含むが、当該CVEは影響なし」という判定情報を機械可読で渡せる。CycloneDXに統合されている。

## 個人プロジェクトで取り入れる場合

- GitHubリポジトリなら **Settings → Security → Dependency graph → Export SBOM** でワンクリック
- ローカルで作るなら `syft <image-or-dir> -o cyclonedx-json` 一発
- CIに組み込むなら、release ごとに SBOM を artifact として保存しておくと、後から脆弱性が見つかった時に過去バージョンも遡及調査できる

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[セキュリティ学習ロードマップ]]
- [[ソフトウェアサプライチェーン強化]]
- [[アプリケーションセキュリティ ツール分類]]
- [[SCA]]
- [[サプライチェーン攻撃]]
- [[Log4Shell]]
- [[Dependabot]]
- [[Trivy]]
