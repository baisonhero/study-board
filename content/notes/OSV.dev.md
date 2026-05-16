---
tags: [inbox, learning, security, devsecops]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - OSV
  - Open Source Vulnerabilities
---

# OSV.dev

> [!summary]
> **OSV.dev** は Google が運営する **OSS脆弱性データベースのアグリゲータ**。GitHub Advisory Database / PyPI Advisory DB / RustSec / Go vuln / npm / Maven 等、エコシステムごとに散らばっていた脆弱性情報を **OSVスキーマ** に正規化し、無料のAPIとして提供する。ツール側は「どのソースから来たデータか」を気にせず、統一スキーマでクエリできる。

## OSV スキーマ

```json
{
  "id": "GHSA-jfh8-c2jp-5v3q",
  "summary": "Log4j vulnerability",
  "affected": [{
    "package": {"ecosystem": "Maven", "name": "org.apache.logging.log4j:log4j-core"},
    "ranges": [{"type": "ECOSYSTEM", "events": [{"introduced": "2.0"}, {"fixed": "2.17.1"}]}]
  }],
  "references": [{"type": "WEB", "url": "https://..."}],
  "severity": [{"type": "CVSS_V3", "score": "CVSS:3.1/AV:N/AC:L/..."}]
}
```

「**パッケージマネージャ名 + パッケージ名 + バージョン範囲**」で表現するのがOSVの核。NVDの CVE は OS パッケージとの紐付けが弱いが、OSVはこれを言語エコシステム単位で精緻化している。

## 統合ソース

- [[GitHub Advisory Database]] (npm, Maven, NuGet, PyPI, RubyGems, Composer, Go, pub, Cargo, Swift, etc.)
- PyPI Advisory DB
- RustSec
- Go vulnerability database
- Linux kernel CVE feed
- AlmaLinux / Rocky Linux / Debian / Ubuntu security advisories
- Android, OSS-Fuzz finding 等

## API利用

```bash
# CLI
curl -X POST -d '{"version": "2.14.1", "package": {"name": "log4j-core", "ecosystem": "Maven"}}' \
  https://api.osv.dev/v1/query

# Python
pip install osv
```

ツール側からのバッチクエリも `/v1/querybatch` で対応。1リクエストで数百パッケージを一気に問い合わせられる。

## osv-scanner

Googleが公式提供するスキャナ `osv-scanner` は、リポジトリの依存ロックファイルを読み取って OSV.dev に問い合わせる、最も手軽なSCA入口の一つ。

```bash
osv-scanner -r ./my-project
```

## NVD / GitHub との位置づけ

- **NVD (NIST)**: 全脆弱性CVEの公式DB。エコシステム情報は薄い
- **[[GitHub Advisory Database]]**: GitHubが運営、GHSA-ID発行、エコシステム情報あり
- **OSV.dev**: 上記を含む複数ソースを集約、開発者向けに最適化

ツールやエコシステムごとに最適なソースが違う場合は OSV.dev 経由が無難。

## 出典

- OSV.dev: https://osv.dev/
- OSV schema: https://ossf.github.io/osv-schema/
- osv-scanner: https://github.com/google/osv-scanner

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]

## 関連ノート

- [[GitHub Advisory Database]]
- [[CVE]]
- [[CVSS]]
- [[SCA]]
- [[SBOM]]
- [[Dependabot]]
- [[A06 Vulnerable and Outdated Components]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
