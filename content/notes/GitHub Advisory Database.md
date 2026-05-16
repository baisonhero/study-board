---
tags: [inbox, learning, security, devsecops]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - GHSA
  - GitHub Advisories
---

# GitHub Advisory Database

> [!summary]
> **GitHub Advisory Database** は GitHub が運営する OSS 脆弱性データベース。npm / PyPI / Maven / RubyGems / NuGet / Go / Composer / pub / Swift / Rust / Erlang 等の主要エコシステムをカバーし、各脆弱性に **GHSA-ID** が振られる。[[Dependabot]] / GitHub Code Scanning / GitHub Dependency Graph はすべてここを情報源にしている。CVE が来る前の "preview" advisory を独自に公開することもあり、現代のSCAの基盤の一つ。

## なぜ独自DBが必要か

NVD（NIST）の CVE は **言語エコシステム単位の細かい情報が薄い**。「npm パッケージ `lodash` の `4.17.20` 以下が影響」のような実用情報は、ベンダーやエコシステム側が補完しないと使えない。GitHub Advisory Database は GitHub Security Lab の研究員や OSS メンテナーが直接登録する場として機能している。

## 仕組み

- メンテナーがリポジトリ内で **Security Advisory** を非公開ドラフト作成
- 修正版をリリースした後で公開
- 公開と同時に [[OSV.dev]] / [[Dependabot]] / npm audit / GitHub UI などに伝播
- CVE が必要なら同時に CVE 申請も行える（GitHub が CNA：CVE Numbering Authority）

## GHSA ID と CVE ID

- **GHSA-xxxx-yyyy-zzzz** はGitHub独自のID。CVE申請前でも発行可
- 後で **CVE-YYYY-NNNNN** が割り当てられて両IDが並ぶことが多い
- GitHubの方が公表が早いケースが頻繁にある（CVE発番がボトルネック）

## 取得方法

```bash
# GraphQL API
gh api graphql -f query='{
  securityAdvisories(first: 5, orderBy: {field: PUBLISHED_AT, direction: DESC}) {
    nodes { ghsaId, summary, severity, cvss { score } }
  }
}'

# Web
https://github.com/advisories
```

## Dependabot との関係

[[Dependabot]] は Advisory Database を購読し、自分のリポジトリで使っている依存に該当する advisory が出たら PR を立てる。**「OSSコミュニティの脆弱性発見 → GitHub Advisory 登録 → 自分のリポジトリに PR」** という流れがフルマネージドで動く。

## OSV.dev との関係

[[OSV.dev]]（Googleが運営）は GitHub Advisory Database を含む複数ソース（PyPI Advisory DB / Rust RustSec / npm 等）を **OSV スキーマ** に正規化した集約DB。検索クエリやAPIが OSV.dev のほうが扱いやすい場面もある。

## 出典

- GitHub Advisory Database: https://github.com/advisories
- About GHSA: https://docs.github.com/en/code-security/security-advisories
- OSV.dev integration: https://osv.dev/

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]

## 関連ノート

- [[CVE]]
- [[CVSS]]
- [[Dependabot]]
- [[SCA]]
- [[OSV.dev]]
- [[A06 Vulnerable and Outdated Components]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
