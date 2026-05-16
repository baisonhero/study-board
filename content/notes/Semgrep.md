---
tags: [inbox, learning, security, devsecops]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - semgrep
---

# Semgrep

> [!summary]
> **Semgrep** はソースコードに対する **構文木ベースの静的解析ツール**。grepの簡単さと AST マッチングの精度を両立し、`if $X == $Y:` のような **コードパターン** を直接書いて検知ルールにできる。OSS版とSemgrep Cloud（旧Semgrep AppSec Platform）の2形態。[[SAST]] カテゴリで急速に普及し、特に開発者にルール作成を任せやすい点で支持されている。

## 何が便利か

- **ルールが読める / 書ける**: 正規表現と違い、構文木レベルでマッチするので誤検知が少ない
- **多言語サポート**: Python / JS/TS / Go / Java / Ruby / C / C# / Rust / Kotlin / Scala / PHP / Swift / Terraform 等
- **コミュニティルール**: Semgrep Registry に1000以上のセキュリティルール（OWASP, CWE準拠）
- **CIで数秒**: Goで書かれた高速エンジン

## ルール例

```yaml
rules:
  - id: python-eval-user-input
    pattern: eval($USER_INPUT)
    message: ユーザー入力に対する eval() は危険
    languages: [python]
    severity: ERROR
```

これだけで `eval(request.GET['x'])` を検出する。`$USER_INPUT` はメタ変数で、任意の式にマッチ。

## CIでの実行

```yaml
- uses: returntocorp/semgrep-action@v1
  env:
    SEMGREP_RULES: p/security-audit p/secrets p/owasp-top-ten
```

OSSパック p/* を組み合わせるだけで「[[OWASP Top 10]] + シークレット検出 + セキュリティ監査」が走る。

## 比較

| ツール | アプローチ | 強み |
|---|---|---|
| **Semgrep** | AST パターンマッチ | ルール書きやすい、開発者UX |
| CodeQL | データフロー解析 | 深い解析、taint tracking が強い |
| SonarQube | 多言語静的解析 | 品質・バグ・脆弱性の総合 |
| Bandit | Python AST | Python特化、軽量 |

**Semgrep Supply Chain** という新機能で[[SCA]]領域（依存の脆弱性 + reachability分析）にも進出。

## 自作ルール戦略

社内の禁止API・命名規則・パターンを Semgrep で**コード化**する戦略が広がっている。たとえば「`requests.get(verify=False)` 禁止」「`print(` を本番コードに残さない」「特定の社内ロガーを使う」等を CI で強制。Lint と SAST の中間的なポジション。

## 出典

- Semgrep: https://semgrep.dev/
- Registry: https://semgrep.dev/r
- GitHub: https://github.com/returntocorp/semgrep

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]

## 関連ノート

- [[SAST]]
- [[SCA]]
- [[OWASP Top 10]]
- [[CWE]]
- [[Web脆弱性の実装防御]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
