---
tags: [inbox, learning, security]
created: 2026-05-04
aliases:
  - Common Vulnerability Scoring System
  - CVSS v3.1
  - CVSS v4.0
---

# CVSS（Common Vulnerability Scoring System）

> [!summary]
> **個別の脆弱性の深刻度を 0.0〜10.0 のスコアで標準化する**業界標準。FIRST（Forum of Incident Response and Security Teams）が管理。CVE と必ずセットで登場する（「CVE-2021-44228 / CVSS 10.0」のように）。OWASPが「カテゴリ」を提供する一方、CVSSは「**個別事象の深刻度**」を提供する。役割が違うので競合しない。

## 1分まとめ

- **何のため**：1つの脆弱性に「これはどのくらいヤバいか」を点数で付ける
- **誰が決める**：管理体は **FIRST**（米国、非営利）。スコアは NVD（米国NIST）やベンダー、研究者が個別に算出
- **どこで見る**：CVE のレコード、GitHub の Security Advisory、各種スキャナのレポート
- **現行**：**v3.1**（2019年〜）が広く使われ、**v4.0**（2023年11月公開）への移行が進行中
- **読み方**：「シーブイエスエス」。**「CVESS」ではない**

## なぜ必要か

「Critical な脆弱性が3件、Highが12件、Mediumが47件あります」と説明したいとき、**何を基準にCritical/High/Mediumと呼ぶか**が共通化されていないと話が噛み合わない。CVSSは数値計算式まで決めて「**世界中で同じ基準で深刻度を算出**」できるようにした。

これが無いと：

- ベンダーAは「Critical」、ベンダーBは「High」と判定 → 顧客が混乱
- スキャナごとにスコア計算が違う → 比較不能
- 規制（PCI DSS等）で「CVSS 4.0以上はX日以内に修正」のような**機械的な閾値**が引けない

## CVSS v3.1 のスコア構成

3つのメトリクス群に分かれている。普段目にする「CVSSスコア」は **Base スコア**であることが多い。

### Base メトリクス（脆弱性そのものの特性、不変）

| グループ | 項目 | 意味 |
|---|---|---|
| **攻撃要素** | Attack Vector (AV) | ネットワーク / 隣接 / ローカル / 物理 |
| | Attack Complexity (AC) | 攻撃の難しさ（Low / High） |
| | Privileges Required (PR) | 必要な権限（None / Low / High） |
| | User Interaction (UI) | ユーザー操作が必要か |
| | Scope (S) | 影響が他コンポーネントに波及するか |
| **影響** | Confidentiality (C) | 機密性影響 |
| | Integrity (I) | 完全性影響 |
| | Availability (A) | 可用性影響 |

これらの値から数式で **0.0〜10.0** が出る。**Base は時間が経っても変化しない**。NVD が公開するのもこのスコア。

### Temporal メトリクス（時間で変化する）

- **Exploit Code Maturity** — エクスプロイトコードが公開されているか
- **Remediation Level** — 公式パッチがあるか、ワークアラウンドだけか
- **Report Confidence** — 情報の確度

例：エクスプロイトが PoC 段階のうちはスコアが少し下がるが、Metasploit に組み込まれたら上がる、など。

### Environmental メトリクス（環境固有）

- **CIA Requirements** — 自社にとって機密性/完全性/可用性のどれが重要か
- **Modified Base Metrics** — 自社環境では Attack Vector が変わる、など

例：「外部公開してないAPIだから AV はネットワークではなくローカル相当」と調整できる。

### スコア → 深刻度ラベル

| スコア範囲 | 深刻度 |
|---|---|
| 0.0 | None |
| 0.1〜3.9 | **Low** |
| 4.0〜6.9 | **Medium** |
| 7.0〜8.9 | **High** |
| 9.0〜10.0 | **Critical** |

## CVSS Vector String

スコアは内訳を1行の文字列で表現する慣習がある：

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
```

これは「ネットワーク経由 / 攻撃容易 / 認証不要 / ユーザー操作不要 / Scope変化なし / C・I・A 全て高影響」=  **Base 9.8 Critical** を意味する（典型的なリモートコード実行）。Vector が読めると「なぜこのスコアになったか」が分かるので、スコアだけ見るより精度が上がる。

## v4.0 の主な改善点（2023年11月公開）

| 変更 | 内容 |
|---|---|
| **Threat メトリクス** | Temporal を再構成。Exploitability の評価がより精緻に |
| **Supplemental メトリクス** | 「自動化可能性（Automatable）」「復旧（Recovery）」「価値密度（Value Density）」など意思決定向けの追加情報。スコア計算には影響しない |
| **Environmental の強化** | OT/ICS/IoT を意識した「Safety」「Provider Urgency」等を追加 |
| **新しい呼称** | Base のみ＝**CVSS-B**、Threat込み＝**CVSS-BT**、環境込み＝**CVSS-BTE**、補足込み＝**CVSS-BTSE** |

しばらくは v3.1 と v4.0 が並存する。NVD は段階的に v4 を採用。

## CVSS / CVE / CWE / OWASP の関係

ここが一番混乱しやすい。**役割で整理する**と分かりやすい：

| 名前 | 何を表す？ | 粒度 | 提供元 |
|---|---|---|---|
| **CVE** | 個別の脆弱性事象に振られる **ID** | 1事象につき1つ | MITRE / CVE Numbering Authorities |
| **CVSS** | その個別事象の **深刻度スコア** | 1事象につき1スコア | FIRST が仕様、各組織が算出 |
| **CWE** | 脆弱性の **型**（バグの種類） | 例: CWE-89=SQLi | MITRE |
| **[[OWASP Top 10]]** | Webで頻出する脆弱性カテゴリ TOP10 | 大カテゴリ | [[OWASP]] |

### 1つの脆弱性事象を例にすると

[[Log4Shell]]（CVE-2021-44228）の場合：

- **CVE-2021-44228** — 個別事象の識別子
- **CVSS v3.1 Base = 10.0 (Critical)** — どれくらいヤバいかの数値
- **CWE-502** Deserialization of Untrusted Data — どんな**型**のバグか
- **CWE-20** Improper Input Validation — もう1つ該当する型
- **OWASP Top 10 → A03 Injection / A06 Vulnerable Components** — Webアプリの**カテゴリ**としてはここに分類

つまり：

```
個別事象（CVE）── 深刻度（CVSS）
   │
   ├── 型（CWE）── まとめると ──→ カテゴリ（OWASP Top 10）
   │
   └── 製品（Log4j 2.x）
```

> [!important] OWASPとCVSSは**競合しない**
> OWASPは「**カテゴリ・チェックリスト・ガイドライン**」を提供する団体で、CVSSは「**個別事象の深刻度を測る数式**」を提供する規格。それぞれ違うレイヤーの問題を解いている。両方を併用する。
>
> - 「うちのアプリが OWASP Top 10 のどこに弱いか」 → OWASPカテゴリで議論
> - 「依存しているこのライブラリの CVE がどれくらいヤバいか」 → CVSSスコアで議論

### よくある誤解

- ❌ 「OWASP Top 10 のスコアが CVSS」 → 違う。Top 10にスコアは付かない。Top 10の各カテゴリにはCWEが紐付いていて、その型のCVEが個別にCVSSスコアを持つ
- ❌ 「CVSS は OWASP の規格」 → 違う。CVSSは **FIRST** の規格
- ❌ 「Critical な CVE = 必ず最優先」 → 違う。後述のリスクとの違いを参照

## CVSSは「深刻度」であって「リスク」ではない

ここを理解しないと CVSSスコアに振り回される。

| 用語 | 意味 |
|---|---|
| **深刻度（Severity）** | 「もし悪用されたらどれだけ被害が出るか」=  CVSSが測るもの |
| **リスク（Risk）** | 深刻度 × **発生可能性** × **自社への影響** |

実例：

- CVSS 10.0 でも **その機能を自社で無効化済み** → 自社リスクはほぼゼロ
- CVSS 5.5 (Medium) でも **認証バイパスで全顧客データが漏れる文脈** → 自社リスクは Critical
- CVSS 7.5 でも **インターネット非公開の管理ネットワーク内のみ** → 自社リスクは Low

そこで業界では **EPSS** や **CISA KEV** との併用が広まりつつある：

- **EPSS**（Exploit Prediction Scoring System、FIRST提供）— **30日以内に実際に悪用される確率**を出すスコア。CVSSが「もし悪用されたら」を測るのに対し、EPSSは「悪用される頻度」を測る
- **CISA KEV**（Known Exploited Vulnerabilities）— **米国CISAが「実際に悪用が観測された」と認定したCVEのカタログ**。連邦機関は期限内修正が義務化される

**実務の優先順位付けの目安**：

```
CISA KEV 該当 > EPSS 高 + CVSS High↑ > CVSS Critical 単独 > CVSS High > ...
```

## 実務での使いどころ

### 個人プロダクト（[[ファーストパーティコードとサードパーティコード]]）

- Dependabot / [[Trivy]] / GitHub Security Advisory のレポートに **CVSSスコア**が付いている
- スコアだけでなく Vector も見る（自分のアプリの使い方で AV や PR が変わるか確認）
- **9.0以上は即対応**、7.0以上は1〜2週間以内、それ未満は次回リリースで、くらいの粗いルールから始める

### 脆弱性の優先順位付け

1. **CISA KEV に載っているか**（最優先）
2. **EPSS が高いか**（次）
3. **CVSS Base のスコア**（基準）
4. **Vector を見て自分の環境に当てはまるか**（補正）
5. **影響範囲の規模**（クリティカルパスかどうか）

## 計算ツール

- 公式：https://www.first.org/cvss/calculator/3.1
- v4.0 公式：https://www.first.org/cvss/calculator/4.0
- NVD のCVE詳細ページにも内蔵されている

Vector をパラメータにそのまま渡すと再計算できる。**自社環境向けに Environmental を埋め直す**と、より実態に合ったスコアになる。

## 落とし穴メモ

- **NVD のスコアと製品ベンダーのスコアが食い違う**ことがある（評価視点が違う）
- **CVSS は依存関係の連鎖を考慮しない**（ライブラリAがCを呼ぶ場合、Cの脆弱性がAでどう露出するかは別途分析が要る）
- **同じCVEでもバージョンや構成で実際の影響が変わる** → Vector の Modified Base で再計算する
- **古いCVE（2016年以前）は v2 のスコアしかない**ことがある。v2 と v3 は互換性がないので注意

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[CVE]]
- [[OWASP]]
- [[OWASP Top 10]]
- [[セキュリティ標準とフレームワーク]]
- [[Log4Shell]]
- [[Trivy]]
- [[Dependabot]]
- [[ソフトウェアサプライチェーン強化]]
- [[サプライチェーン攻撃]]
- [[アプリケーションセキュリティ ツール分類]]
