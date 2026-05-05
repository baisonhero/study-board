---
tags: [inbox, learning, security]
created: 2026-05-05
aliases:
  - A08
  - Software and Data Integrity Failures
  - インテグリティ不備
  - サプライチェーン
  - CI改ざん
---

# A08 Software and Data Integrity Failures

> [!summary]
> [[OWASP Top 10]] 2021年版で **新設**。コード／インフラ／データに対する **改ざん検出の欠如**。CI/CDパイプラインの汚染、署名なしアップデート、信頼できないデシリアライゼーション、依存パッケージの侵害などを含む。**SolarWinds事件 (2020)** や **Codecov事件 (2021)** が業界を変え、SLSA / Sigstore / 署名検証の標準化が進んだ。[[サプライチェーン攻撃]] と密接。

## どういう脆弱性か

- **CI/CD パイプラインの汚染** — ビルド環境で任意コード実行可能、シークレット流出
- **署名検証なしの自動アップデート** — 改ざんされたバイナリを正規アプリが受け入れ
- **信頼できないソースからのライブラリ取り込み** — typosquatting、dependency confusion
- **安全でないデシリアライゼーション** — Java/Python/PHP のオブジェクト復元時に任意コード実行
- **シークレットのハードコード／リポジトリ混入** — 一度漏れたら永久に漏れた扱い
- **クライアントサイドで信頼すべきでない値を信頼** — トークンや署名なしの状態保持

## 攻撃例

### SolarWinds Orion 事件 (2020)

- 攻撃者が SolarWinds のビルドサーバに侵入
- Orion の **正規ビルドプロセス** に SUNBURST バックドアを混入
- **正規の署名付き** でアップデート配信され、約 18,000 顧客がインストール
- 米国財務省、商務省、国防総省、Microsoft等が侵害された

→ **「正規ベンダの正規署名」 を信頼してもダメ**。ビルド環境の完全性まで担保が必要、という業界教訓。

### Codecov Bash Uploader (2021)

CIで使われていた `bash <(curl -s https://codecov.io/bash)` というスクリプトが改ざんされ、CIシークレットが攻撃者サーバに送信されていた。**約2ヶ月発覚せず**、影響を受けた組織はAtlassian、Twilio、HashiCorp、Rapid7など。

### npm event-stream / コinminer 系侵害

- `event-stream` (2018) — メンテナ譲渡で悪意コード混入
- `ua-parser-js` (2021) — npm アカウント乗っ取りでクリプトマイナー混入
- `node-ipc` (2022) — メンテナの政治的抗議で破壊的コード混入（protestware）

### dependency confusion (2021)

社内プライベートパッケージと同名のパッケージをパブリックレジストリに公開すると、設定によってはパブリック側が優先されて取り込まれる、という Alex Birsan の研究。Apple、Microsoft、PayPal等で実証された。

### 安全でないデシリアライゼーション

```python
# 危険: pickle で任意コード実行可能
import pickle
data = pickle.loads(request.body)

# Java の ObjectInputStream、PHP の unserialize() も同類
```

## 防御策

### 1. CI/CD パイプラインのハードニング

- **ビルド環境を ephemeral に**（毎回作り直し、永続させない）
- ビルド時に渡すシークレットを最小化、必要時だけ
- **OIDC** を使ったクラウド認証（長期キー禁止、GitHub Actions ↔ AWS の OIDCフェデレーション等）
- branch protection + 必須レビュー
- 自前 runner より GitHub-hosted runner を優先

### 2. SLSA レベルでサプライチェーン強度を定義

[SLSA](https://slsa.dev/) (Supply-chain Levels for Software Artifacts) はビルドパイプライン強度のフレームワーク：

| Level | 内容 |
|---|---|
| **L1** | ビルド手順が文書化、provenance 生成 |
| **L2** | バージョン管理、ホストされたビルドサービス |
| **L3** | ビルドが分離・改ざん耐性 |
| **L4** | 二重レビュー、再現可能ビルド |

### 3. 成果物への署名と検証

- **Sigstore / cosign** でコンテナイメージや成果物に署名
- 配布時に署名検証を必須化
- in-toto attestation でビルド経路を証明

```bash
cosign sign $IMAGE
cosign verify $IMAGE --certificate-identity ... --certificate-oidc-issuer ...
```

### 4. 依存パッケージの取り込み制御

- **Lockfile を必ずコミット**（`package-lock.json`、`yarn.lock`、`poetry.lock`）
- **ハッシュ／integrity 検証** （npm の `--integrity`、pip の `hash-checking mode`）
- **dependency confusion 対策**: スコープ付きパッケージ（`@org/package`）、private registry の優先設定
- 新規依存追加時はメンテナンス状況を確認（[[A06]]）

### 5. シークレット管理

- リポジトリにコミットさせない（[[シークレット管理]]）
- `gitleaks` / `trufflehog` を pre-commit と CI で
- 漏洩時は **即座にローテーション**（git history から消すだけでは不十分）
- AWS Secrets Manager / Parameter Store / Doppler / 1Password Secrets Automation

### 6. デシリアライゼーションの安全策

- ユーザー入力を pickle / unserialize に流さない
- JSON / Protobuf 等のスキーマ強制フォーマットを使う
- どうしても必要ならホワイトリスト（許可クラスのみ）

### 7. クライアント信頼の最小化

- HTML/JS/Cookie に格納する値は改ざん前提
- セキュリティ判定はサーバ側で
- JWT 等は必ず署名検証（[[A07]]）

## 検出手段

- **[[SCA]] / [[SBOM]]** — 取り込んだ成分の把握
- **GitHub Advisory / OSV** — 既知の悪意あるパッケージ情報
- **CI構成の監査** — workflow ファイルレビュー
- **gitleaks / trufflehog** — コミット内シークレット検知
- **コンテナイメージ署名検証** — cosign verify をデプロイゲートに

## 参考事例

- **SolarWinds (2020)** — ビルドパイプライン汚染の象徴
- **Codecov (2021)** — CIサプライチェーン攻撃
- **xz/liblzma バックドア (2024)** — 数年単位の長期戦略
- **PyPI / npm 連続事件** — マルウェア混入の常態化
- **Kaseya VSA (2021)** — MSP経由のランサムウェア感染、署名済みアップデートで配信

詳細は [[サプライチェーン攻撃]] と [[ソフトウェアサプライチェーン強化]]。

## Next.js / Supabase での落とし穴

- **`postinstall` スクリプト** — 悪意あるパッケージの最大の攻撃面。CI で `--ignore-scripts` を検討
- **Vercel デプロイの環境変数注入** — Build Logs に出ていないか
- **Edge Functions のコード署名** — まだ標準化途上、可能なら Provenance を活用
- **GitHub Actions に長期 AWS アクセスキーを入れない** — OIDC + IAM ロールで

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[OWASP Top 10]]
- [[サプライチェーン攻撃]]
- [[ソフトウェアサプライチェーン強化]]
- [[SBOM]]
- [[CycloneDX]]
- [[シークレット管理]]
- [[Log4Shell]]

## 出典

- [OWASP Top 10:2021 A08 Software and Data Integrity Failures](https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/)
- [SLSA Framework](https://slsa.dev/)
- [Sigstore](https://www.sigstore.dev/)
- [CISA: Software Supply Chain Attack Mitigation](https://www.cisa.gov/news-events/news/defending-against-software-supply-chain-attacks)
