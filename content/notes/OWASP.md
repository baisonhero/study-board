---
tags: [inbox, learning, security]
created: 2026-04-26
aliases:
  - Open Worldwide Application Security Project
  - Open Web Application Security Project
---

# OWASP（Open Worldwide Application Security Project）

> [!summary]
> アプリケーションセキュリティ分野で最も影響力のある **非営利オープンコミュニティ**。Webアプリの脆弱性ランキング「OWASP Top 10」で広く知られるが、その実態は数百のプロジェクト・ドキュメント・ツールを抱える知識基盤。AppSecの「業界共通言語」を作っている存在。

## 基本情報

- **正式名称**：Open Worldwide Application Security Project（旧名 Open Web Application Security Project、2023年に「Web」→「Worldwide」へ改称）
- **設立**：2001年
- **形態**：501(c)(3) 非営利財団（米国）
- **公式**：https://owasp.org/
- **特徴**：すべてのコンテンツが無料・オープン、ベンダーロックなし、世界中のチャプターがコミュニティ運営

略称の発音は「**オワスプ**」。「OWPS」ではないので注意。

## なぜ重要か

セキュリティ業界には「これを基準に話そう」という共通語彙が必要で、その役割を OWASP が担っている。例えば「Broken Access Control」と言えば全員が同じ脆弱性カテゴリを思い浮かべる。商用ベンダー製品の脆弱性レポートも、PCI DSS のような規制も、個別企業のAppSec教育資料も、おおむね OWASP の枠組みに沿って作られる。

## フラッグシッププロジェクト（特に重要なもの）

### ランキング系（"Top 10")

| プロジェクト | 内容 |
|---|---|
| **[[OWASP Top 10]]** | Webアプリ脆弱性のトップ10（2021年版が現行、次版が2025〜で議論中） |
| **OWASP API Security Top 10** | APIに特化した版（最新は2023年版） |
| **OWASP Mobile Top 10** | モバイルアプリ向け |
| **OWASP LLM Top 10** | 生成AI / LLMアプリ向け（2023年〜の新カテゴリ） |
| **OWASP Top 10 CI/CD Security Risks** | CI/CDパイプラインの脆弱性 |

### 標準・チェックリスト

- **OWASP ASVS**（Application Security Verification Standard）— Webアプリ検証要件のチェックリスト標準。Level 1（基本）/ 2（標準）/ 3（厳格）の3段階。商用脆弱性診断の仕様としても使われる
- **OWASP MASVS**（Mobile ASVS）— モバイル版
- **OWASP SAMM**（Software Assurance Maturity Model）— 組織のAppSec成熟度モデル
- **OWASP SKF**（Security Knowledge Framework）— 開発者向け学習・チェックフレームワーク

### ツール

- **[[OWASP ZAP]]**（Zed Attack Proxy）— OSSの [[DAST]] ツール、業界標準クラス
- **OWASP Dependency-Check** — [[SCA]] ツール
- **OWASP Dependency-Track** — [[SBOM]] と脆弱性インテリジェンスを継続監視するプラットフォーム
- **OWASP [[CycloneDX]]** — [[SBOM]] フォーマット標準
- **OWASP Threat Dragon** — 脅威モデリング図を描くツール
- **OWASP Juice Shop** — 学習用に脆弱性を仕込んだ意図的に壊れているWebアプリ。練習台の定番

### ドキュメント・ガイド

- **OWASP Cheat Sheets** — 実装上の注意点をテーマ別にまとめた一枚モノ集（XSS、CSRF、認証、ロギング等）。実装者向けの即戦力資料
- **OWASP Web Security Testing Guide（WSTG）** — ペンテスト手順の体系
- **OWASP Code Review Guide** — コードレビュー観点
- **OWASP Threat Modeling Cheat Sheet** — 脅威モデリングの始め方

## プロジェクトのステータス

OWASPプロジェクトには成熟度ラベルが付いている：

- **Flagship**（旗艦）— 高品質・継続メンテ・推奨。Top 10、ZAP、ASVS、SAMM、Juice Shop など
- **Production** — 本番利用可能レベル
- **Lab** — 開発中
- **Incubator** — アイデア段階

新しいツールを採用するときは Flagship かどうか確認すると外れにくい。

## 個人で取り入れる場合の入り口

学習順の例：

1. **[[OWASP Top 10]]** を読んで脆弱性カテゴリの大枠を把握
2. 興味のあるカテゴリの **OWASP Cheat Sheet** を読む（実装者目線で具体的）
3. **OWASP Juice Shop** をローカルで立ち上げて実際に攻撃してみる（=守る側の理解が深まる）
4. 自分のプロジェクトに **OWASP ZAP** を回してみる
5. 規模が出てきたら **ASVS** で検証要件を整理、**SAMM** で組織成熟度を測る

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[セキュリティ学習ロードマップ]]
- [[OWASP Top 10]]
- [[OWASP API Security Top 10]]
- [[アプリケーションセキュリティ ツール分類]]
- [[OWASP ZAP]]
- [[SBOM]]
- [[CycloneDX]]
- [[脅威モデリング]]
