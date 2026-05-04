---
tags: [inbox, learning, security, devsecops]
created: 2026-05-04
auto-generated: 2026-05-04
aliases:
  - dependabot
  - GitHub Dependabot
---

# Dependabot

> [!summary]
> GitHubが提供する **依存パッケージの自動アップデート + 脆弱性アラート** 機能。リポジトリで使っているライブラリにCVEが出たら通知し、修正バージョンへのPRを自動作成してくれる。個人〜エンタープライズまで無料で使える [[SCA]] の入口として定番。

## 3つの構成要素

Dependabotは目的の違う3機能の集合体。混同しがちなので分けて理解する。

| 機能 | 役割 | トリガー |
|---|---|---|
| **Dependabot Alerts** | 既知脆弱性（CVE）の通知 | [[GitHub Advisory Database]] に新規エントリ追加時 |
| **Dependabot Security Updates** | 脆弱性修正PRを自動作成 | Alertsの内容に基づき発火 |
| **Dependabot Version Updates** | 通常の新バージョンへのPRを定期作成 | `dependabot.yml` のスケジュール（daily/weekly/monthly） |

Alertsは Settings → Code security から GUI でON、Version Updates だけ `.github/dependabot.yml` の作成が必要。

## 設定ファイル（dependabot.yml）

`.github/dependabot.yml` に書く。最小構成例：

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

`package-ecosystem` は npm / pip / cargo / docker / github-actions / bundler など多数対応。GitHub Actions の固定バージョンも更新対象にできるのが地味に便利。

グルーピング、無視ルール、PR上限、レビュアー自動指定なども書ける。

## 2026年時点のアップデート

- **マルウェア検出**（2026年3月〜）— npmパッケージのマルウェア亜種を [[GitHub Advisory Database]] と突き合わせて検出。Alertsで通知される。
- **AIエージェントへのアサイン**（2026年4月〜）— Dependabot Alertsを Copilot コーディングエージェントに割り当てて修正PRを作らせられる（GitHub Code Security + Copilot 必要）。
- **組織レベルのプライベートレジストリ**（2026年4月〜）— 社内のnpm/Maven/Dockerフィードを組織設定でまとめて登録可能に。

## 競合・代替

- **Renovate** — Dependabotより細かい制御が可能（モノレポ対応、グルーピング、自動マージ条件など）。OSSプロジェクトで好まれがち。
- **Snyk Open Source** — 商用[[SCA]]。ライセンスチェックや到達可能性分析（reachability analysis）が強み。
- **[[Trivy]]** — スキャナ寄り。SBOMやコンテナイメージにも対応するが「PRを自動で作る」までは別途仕組みが必要。

個人/小規模なら Dependabot から始めるのが王道。詳細は [[アプリケーションセキュリティ ツール分類]] 参照。

## 個人プロジェクトでの運用

CLAUDE.md の [[DevSecOps]] ルール「新規リポジトリ作成時: Dependabot Alerts ON」を実行するための具体ステップ：

1. **リポジトリ作成直後**: Settings → Code security → Dependabot alerts と Security updates をON
2. **依存関係を入れたら**: `.github/dependabot.yml` を追加（npm + github-actions の最小構成でOK）
3. **週次レビュー**: Open状態のDependabot PRを確認 → CIが通っていればマージ
4. **重大Alert発生時**: 即座にVaultに `#incident` ノート作成 → 影響範囲分析 → 対応

放置するとPRが溜まって無視される負債になりがちなので、週次の確認をルーチン化するのが鍵。

## 注意点

- **PRの量**: モノレポや古いプロジェクトだと一気にPRが大量に来る。最初は `open-pull-requests-limit` を絞る。
- **メジャーアップデートでビルドが壊れる**: 自動マージするならテストカバレッジが前提。CIが弱いうちは手動レビュー推奨。
- **間接依存**: ロックファイル経由でしか更新されない依存がある。直接依存への明示的アップグレードが必要なケースあり。
- **「含まれている = 影響を受ける」ではない**: VEX（[[SBOM]] 参照）の概念で実際の到達可能性を確認すべき。

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[サプライチェーン攻撃]]
- [[ソフトウェアサプライチェーン強化]]
- [[SBOM]]
- [[Trivy]]
- [[Log4Shell]]
- [[アプリケーションセキュリティ ツール分類]]
- [[ファーストパーティコードとサードパーティコード]]
- [[OWASP Top 10]]

## 出典

- [About Dependabot security updates - GitHub Docs](https://docs.github.com/en/code-security/concepts/supply-chain-security/about-dependabot-security-updates)
- [About Dependabot version updates - GitHub Docs](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates)
- [Dependabot now detects malware in npm dependencies (GitHub Changelog, 2026-03-17)](https://github.blog/changelog/2026-03-17-dependabot-now-detects-malware-in-npm-dependencies/)
- [Dependabot alerts are now assignable to AI agents for remediation (GitHub Changelog, 2026-04-07)](https://github.blog/changelog/2026-04-07-dependabot-alerts-are-now-assignable-to-ai-agents-for-remediation/)
- [Dependabot and code scanning: Org-level private registries (GitHub Changelog, 2026-04-14)](https://github.blog/changelog/2026-04-14-dependabot-and-code-scanning-org-level-private-registries/)

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-04）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
