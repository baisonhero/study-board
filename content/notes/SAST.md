---
tags: [inbox, learning, security, devsecops]
created: 2026-05-06
auto-generated: 2026-05-06
aliases:
  - SAST
  - Static Application Security Testing
  - 静的アプリケーションセキュリティテスト
---

# SAST

> [!summary]
> ソースコード（または AST / バイトコード）を **実行せずに** 解析し、脆弱パターンを炙り出す静的解析。「自分で書いたコード」（ファーストパーティ）に潜むSQLi、XSS、ハードコード鍵、危険API呼び出しを早い段階で見つけるのが目的。IDE / pre-commit / PR時のCI に組み込み、開発者の手元に近いほど効果が大きい。[[DAST]] と [[SCA]] の中間ではなく、ファーストパーティ専用の検査帯。

## ファーストパーティの脆弱性を狙う

[[ファーストパーティコードとサードパーティコード]] の整理に従えば、SAST の守備範囲は **自分が書いたコード**。

| 種類 | 担当ツール | 例 |
|---|---|---|
| ファーストパーティ | **SAST** | `query = "SELECT ... " + userInput` の検出 |
| サードパーティ | [[SCA]] / [[SBOM]] | 使ってる lodash の既知 [[CVE]] 検出 |

依存パッケージのCVEは SCA が担当、ライブラリの中身まで踏み込んで解析するのは SAST の射程外と整理しておくと混乱しない。

## 何を検出できるか

ソースを構文解析してデータフローを追うので、**実行しなくても判定可能なパターン** に強い：

- **インジェクション系**: 文字列連結クエリ、`exec()` / `eval()` / `Runtime.exec()` 等の危険API呼び出し（[[A03 Injection]]）
- **暗号系**: MD5/SHA1 の使用、ハードコード鍵、弱い擬似乱数（[[A02 Cryptographic Failures]]）
- **シークレット検出**: コミットされた API トークン・秘密鍵・接続文字列
- **危険デシリアライゼーション**: Java の `ObjectInputStream`、Python の `pickle.loads`
- **JWT 危険API**: `none` アルゴリズム許容、署名検証の欠落（[[A07 Identification and Authentication Failures]]）
- **SSRF への発展経路**: ユーザ入力が `http.get()` の URL に直結している（[[A10 SSRF]]）
- **不適切なエラーハンドリング・ログ出力**: スタックトレース流出、機密のログ書き出し

逆に苦手なのは：

- **業務ロジックのバグ**（「数量に負の値を渡せる」など）
- **認可の境界違反**（「ユーザーAがBの注文を読める」など、ランタイム文脈が要る）
- **設定ミス**（環境変数・IaC の世界）

これらは [[DAST]] / 手動ペンテスト / [[脅威モデリング]] / IaC スキャナの領分。

## 代表ツール

- **Semgrep** — OSS、ルールを YAML 風に書ける。`p/owasp-top-ten` などのレジストリが充実。CI/CD への組み込みが軽い
- **GitHub CodeQL** — クエリ言語でデータフローを追跡。GitHub Advanced Security で標準提供、無料枠は public repo
- **SonarQube / SonarCloud** — 品質ゲートと統合。Maintainability / Reliability / Security をまとめて見る
- **Snyk Code** — DeepCode 由来。商用 SAST の主流のひとつ
- **Checkmarx CxSAST / Veracode** — エンタープライズ向け、コンプラ報告に強い
- **Bandit**（Python） / **Brakeman**（Rails） / **gosec**（Go） — 言語特化型 OSS

個人開発レベルなら **Semgrep + GitHub CodeQL** の二刀流が無料で十分強力。

## CI/CD での回し方

1. **PR時**: Semgrep / CodeQL を GitHub Actions で実行。差分のみスキャン（`semgrep --baseline-ref`）して PR コメントに alerts を出す
2. **pre-commit**: 軽量ルールセット（シークレット検出、`eval`使用検出など）を pre-commit hook で実行
3. **Nightly フルスキャン**: 全コードベースをルールフルセットで走査。SARIF 出力で GitHub Security タブへ
4. **Severity Gate**: HIGH/CRITICAL のみで `exit-code 1`、CI を落としてマージブロック

CodeQL は GitHub Actions の `github/codeql-action` で動かすのが標準。Semgrep も同様に `returntocorp/semgrep-action`。

## False Positive をどう減らすか

SAST は誤検知が宿命。運用ノウハウとして：

- ベースラインを取って「新規導入された警告のみ」をブロックする
- ルールごとに `nosemgrep:` / `# noqa` のインラインサプレッションを置き、なぜ無視したかをコミット履歴に残す
- プロジェクト固有のルールを `semgrep` で書き、自社のお作法をルール化する

「FP が多いから無視」になると DevSec の文化が崩れるので、サプレッションには必ず理由コメントを添える運用が鉄則。

## OWASP Top 10 への対応

[[OWASP Top 10]] のうち SAST が主担当なのは：

- A02 Cryptographic Failures（弱暗号API・ハードコード鍵）
- A03 Injection（危険API・文字列連結）
- A07 Auth Failures（JWT周り）
- A10 SSRF（信頼境界を越える `http.get` 等）

ハイブリッドでカバーするのは A01（[[DAST]]併用） / A04（脅威モデリング併用）。

## 出典

- OWASP SAST 概要: https://owasp.org/www-community/Source_Code_Analysis_Tools
- Semgrep 公式: https://semgrep.dev/
- GitHub CodeQL: https://codeql.github.com/

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]

## 関連ノート

- [[DAST]]
- [[アプリケーションセキュリティ ツール分類]]
- [[ファーストパーティコードとサードパーティコード]]
- [[OWASP]]
- [[OWASP Top 10]]
- [[A02 Cryptographic Failures]]
- [[A03 Injection]]
- [[A07 Identification and Authentication Failures]]
- [[A10 SSRF]]
- [[SBOM]]
- [[Web脆弱性の実装防御]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-06）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
