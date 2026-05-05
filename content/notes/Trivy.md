---
tags: [inbox, learning, security, devsecops]
created: 2026-05-05
auto-generated: 2026-05-05
aliases:
  - trivy
  - aquasec/trivy
---

# Trivy

> [!summary]
> Aqua Security が開発する OSS の **総合セキュリティスキャナ**。コンテナイメージ・ファイルシステム・Gitリポジトリ・Kubernetes クラスタ・クラウドアカウント・IaC を単一CLIから走査でき、脆弱性・設定ミス・シークレット・[[SBOM]] 出力までこなす。個人開発者から大企業まで、CI/CDのセキュリティゲートとして定番。

## 何を検出できるか

| 対象 | 検出内容 |
|---|---|
| **OSパッケージ** | Alpine/Debian/Ubuntu/RHEL等のディストリ脆弱性（[[CVE]]） |
| **言語ライブラリ** | npm/pip/Maven/Cargo/Go/Composer/RubyGems 等 |
| **コンテナイメージ** | レイヤごとに上記を統合スキャン |
| **IaC** | Terraform / CloudFormation / Kubernetes manifest / Dockerfile / Helm の設定ミス |
| **シークレット** | コミットされたAPIキー・トークンなど |
| **ライセンス** | OSSライセンスの一覧化・ポリシー違反検出 |
| **Kubernetes** | ライブクラスタ走査（Trivy Operator 経由） |
| **クラウド** | AWS/GCP/Azureアカウント走査（misconfig） |

「ひとつ入れておけば一通り見られる」のが最大の魅力。

## SBOM 連携

[[SBOM]] の生成と入力の双方に対応している（参考: [Trivy SBOM](https://trivy.dev/docs/latest/supply-chain/sbom/)）。

```bash
# CycloneDX 形式でSBOM生成
trivy image --format cyclonedx --output sbom.cdx.json myapp:latest

# SPDX 形式でSBOM生成
trivy image --format spdx-json --output sbom.spdx.json myapp:latest

# 既存のSBOMファイルから脆弱性スキャン（イメージのpull・解析を省ける）
trivy sbom sbom.cdx.json
```

`--format cyclonedx` はデフォルトで脆弱性情報を含めない。脆弱性も同梱したいなら `--scanners vuln` を明示する。CIではSBOM生成と脆弱性スキャンを分けて、SBOMをartifactとして長期保存しておくのが定石。

## 基本コマンド

```bash
# Dockerイメージ
trivy image nginx:latest

# ファイルシステム（プロジェクトルート）
trivy fs .

# Gitリポジトリ（リモート可）
trivy repo https://github.com/owner/repo

# Kubernetes クラスタ
trivy k8s --report summary cluster

# IaC のみに絞る
trivy config .

# CRITICAL のみ・終了コードを上げてCI失敗にする
trivy image --severity CRITICAL --exit-code 1 myapp:latest
```

## CI/CDでの使い方

GitHub Actions なら [aquasecurity/trivy-action](https://github.com/aquasecurity/trivy-action) が便利：

```yaml
- name: Run Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:${{ github.sha }}'
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'CRITICAL,HIGH'
    exit-code: '1'

- name: Upload to GitHub Security tab
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: 'trivy-results.sarif'
```

SARIF 形式で吐けば GitHub Security タブに統合できる。

## 競合・棲み分け

- **[[Dependabot]]** — GitHub純正、PRを作るのが強み。スキャンというより「修正提案」寄り
- **Snyk** — 商用、UI/UXとレポートが優秀。商用[[SCA]]の主流
- **Grype**（Anchore） — OSS、Trivyに近い。[[Syft]] とセットで使うとSBOM連携が綺麗
- **Clair** — Quay 由来のレジストリ向けスキャナ
- **Snyk Container / Sysdig / Wiz** — エンタープライズ向け統合製品

OSSで「全部入り」を求めるなら Trivy、商用UIや到達可能性分析（reachability analysis）込みで本格運用なら Snyk が一般的な選択肢。

## 2026年の動き

公式情報や2026年のレビュー記事によると、SBOM生成の強化と false positive フィルタリングの改善が進んでいる（参考: [Trivy 公式](https://trivy.dev/) / [Container Security Scanning for Production: Trivy, Snyk, and ...](https://www.hostmycode.com/blog/container-security-scanning-production-trivy-snyk-grype-integration-strategies-2026)）。Aquaの `--scanners` を絞り込んでパイプラインの実行時間を短縮するのが運用上のトレンド。

## 個人プロジェクトでの導入手順

1. ローカル: `brew install trivy` または `docker run --rm aquasec/trivy`
2. CI に GitHub Actions を追加（上記サンプル）
3. SARIF で GitHub Security タブに連携
4. `.trivyignore` で誤検知や対応保留CVEを管理（理由のコメントを必ず添える）
5. 週次で `trivy image --download-db-only` を走らせてDBを最新化（CIでも `cache` 推奨）

詳細は [[アプリケーションセキュリティ ツール分類]] と [[ソフトウェアサプライチェーン強化]] 参照。

## 注意点

- 言語ライブラリ検出はマニフェスト/ロックファイル依存。lockfileがなければ精度が落ちる
- 「含む = 攻撃可能」ではない。VEX（[[CycloneDX]]）で誤検知を整理するべき
- DBは定期更新が必要。古いDBで「No vulnerabilities found」を信じない
- IaCルールセットはdefaultで広め。プロジェクトに合わせて `--severity` や `--ignore-policy` で調整する

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[SBOM]]
- [[CycloneDX]]
- [[SPDX]]
- [[Syft]]
- [[Dependabot]]
- [[CVE]]
- [[CVSS]]
- [[Log4Shell]]
- [[サプライチェーン攻撃]]
- [[ソフトウェアサプライチェーン強化]]
- [[アプリケーションセキュリティ ツール分類]]
- [[コンテナとKubernetesセキュリティ]]

## 出典

- [Trivy 公式](https://trivy.dev/)
- [GitHub: aquasecurity/trivy](https://github.com/aquasecurity/trivy)
- [Trivy SBOM ドキュメント](https://trivy.dev/docs/latest/supply-chain/sbom/)
- [Trivy Action（GitHub Actions）](https://github.com/aquasecurity/trivy-action)
- [Aqua Security: Software Supply Chain Security with Trivy](https://www.aquasec.com/blog/software-supply-chain-security-trivy-sbom/)

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-05）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
