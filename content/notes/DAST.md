---
tags: [inbox, learning, security, devsecops]
created: 2026-05-06
auto-generated: 2026-05-06
aliases:
  - DAST
  - Dynamic Application Security Testing
  - 動的アプリケーションセキュリティテスト
---

# DAST

> [!summary]
> **動いているアプリ** に対して外側からブラックボックスで攻撃ペイロードを送り込み、応答差分から脆弱性を炙り出すテスト手法。コードを見ない代わりに、実環境の挙動 — 認証バイパス、XSS、[[A03 Injection|SQLi]]、設定ミス、ヘッダ抜け — を高精度に検出できる。SDLC の右側（staging / pre-prod）で [[SAST]] と相補的に使うのが定石。

## SAST との対比

| 観点 | [[SAST]] | DAST |
|---|---|---|
| 解析対象 | ソースコード（実行しない） | 動いているアプリ（HTTP越し） |
| 実行タイミング | IDE / pre-commit / PR | staging / 定期スキャン / pre-prod |
| 言語依存 | 強く依存 | 言語非依存（HTTPプロトコルしか見ない） |
| 強み | 開発者の手元で早く回せる | False positive が少ない、本物の攻撃を再現 |
| 弱み | 誤検知が多い、ランタイム文脈が見えない | デプロイ済みが前提、遅い、コード由来のバグは見落とし |

両者は **対立するものではなく、検出する層が違う**。詳しい全体像は [[アプリケーションセキュリティ ツール分類]] を参照。

## 何を見つけられるか

DAST は HTTP リクエスト/レスポンスを観察して脆弱性を探す。代表的な検出例：

- **インジェクション系**: [[A03 Injection|SQLi]]、コマンドインジェクション、XSS（reflected/stored）、SSRF — ペイロードを流して応答差分を検査
- **認証/セッション**: ログインフォームのレート制限不備、Cookie 属性の欠落（HttpOnly/Secure/SameSite）、セッション固定
- **認可**: ID をローテーションして他人のリソースに到達できるか（[[A01 Broken Access Control|IDOR]] の自動探索）
- **設定ミス**: 不要メソッド（PUT/DELETE）の許可、`X-Frame-Options` / `CSP` などの [[A05 Security Misconfiguration|セキュリティヘッダ]] 抜け、デフォルトページ露出
- **暗号系**: HTTPS リダイレクトの不備、HSTS なし、弱いTLS（[[A02 Cryptographic Failures]]）

逆に **業務ロジックの脆弱性** — 「権限の境界が論理的におかしい」「価格を負の値で送れる」など — は DAST では拾い切れない。手動ペンテストや脅威モデリング（[[脅威モデリング]]）が要る。

## 代表ツール

- **[[OWASP|OWASP ZAP]]** — OSS の業界標準。CLI / GUI / Docker / GitHub Action で動く。スキャナだけでなくプロキシとしてブラウザ操作の傍受もできる
- **Burp Suite**（PortSwigger） — Pro版が商用ペンテストの定番。DAST 機能としては Burp Scanner
- **Nuclei** — テンプレートベースの高速スキャナ。CVE 検証やヘッダ検査などを YAML テンプレで宣言
- **Acunetix / Invicti / Tenable Web App Scanning** — エンタープライズ向け商用 DAST
- **sqlmap** — SQLi 専用だが圧倒的に強力。DAST の発想に近い動的検査

## CI/CD での回し方

毎PRで回すには遅すぎるので、典型的には：

1. **Nightly スキャン**: ZAP の Baseline Scan を毎晩 staging に対して走らせ、新規 alert を Slack / GitHub Issues に通知
2. **リリース前の Full Scan**: Active Scan は時間がかかる（数時間〜）ので、リリース直前にバッチで実行
3. **Authenticated Scan**: ログイン後のページも対象にするため、事前にセッションを取得してスキャナに渡す
4. **API 用 OpenAPI 連携**: ZAP は OpenAPI/Swagger ファイルを読み込ませると API エンドポイントを網羅的にテストできる

GitHub Actions だと `zaproxy/action-baseline` が手早い。SARIF 出力で GitHub Security タブに統合できる。

## OWASP Top 10 への対応

[[OWASP Top 10]] のうち DAST が主担当なのは：

- A01 Broken Access Control（IDOR の総当たり）
- A03 Injection（ペイロード送出）
- A05 Security Misconfiguration（ヘッダ・露出）
- A07 [[A07 Identification and Authentication Failures|認証/セッション]]
- A10 SSRF

A02（暗号）/ A06（依存パッケージ）/ A09（ログ）は SAST / [[SBOM]] / [[システム監視と可観測性|Observability]] の領分。

## 出典

- OWASP ZAP 公式: https://www.zaproxy.org/
- OWASP DAST 概念ページ: https://owasp.org/www-project-devsecops-guideline/latest/02b-Dynamic-Application-Security-Testing
- PortSwigger Web Security Academy: https://portswigger.net/web-security

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]

## 関連ノート

- [[SAST]]
- [[アプリケーションセキュリティ ツール分類]]
- [[OWASP]]
- [[OWASP Top 10]]
- [[Web脆弱性の実装防御]]
- [[A01 Broken Access Control]]
- [[A03 Injection]]
- [[A05 Security Misconfiguration]]
- [[A07 Identification and Authentication Failures]]
- [[A10 SSRF]]
- [[脅威モデリング]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-06）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
