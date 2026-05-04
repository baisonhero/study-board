---
tags: [inbox, learning, security]
created: 2026-05-04
aliases:
  - Common Vulnerabilities and Exposures
  - CVE-ID
  - CVE番号
---

# CVE（Common Vulnerabilities and Exposures）

> [!summary]
> **個別の脆弱性事象に世界共通の ID を振る**仕組み。1999年から運用される事実上の業界標準。「CVE-2021-44228」のような形式で、製品・バージョン・脆弱性内容を**1つに紐付ける ID** を提供する。**CVE自身はスコアも分類も持たない。ただのID台帳**。深刻度は [[CVSS]]、型分類は CWE、Webカテゴリは [[OWASP Top 10]] が補完する。

## 1分まとめ

- **何のため**：「あの脆弱性のことを話している」を**世界中で一意に指せる**ようにする識別子
- **誰が管理**：**MITRE**（米国非営利）が運営、**CISA**（米国国土安全保障省）が後援
- **形式**：`CVE-YYYY-NNNNN`（例: `CVE-2021-44228`）。連番部分は4桁以上の可変長
- **発行者**：**CNA**（CVE Numbering Authorities）と呼ばれる認定組織が振り出す（GitHub、Microsoft、Google、Red Hat、JPCERT/CC 等、世界に数百社）
- **読み方**：「シーブイイー」

## なぜ必要か

セキュリティ業界には毎日のように脆弱性が報告される。同じ脆弱性をベンダーAは "Apache HTTP RCE bug"、ベンダーBは "httpd remote exec vuln" と呼んでいたら、**同じものか違うものか議論できない**。

CVEは、これを一発で解決する：

- A社のスキャナレポート、B社のSIEM、C社のパッチ通知 → 全部 `CVE-2024-12345` で言及される
- パッチ管理ツールが「未修正のCVEは何件か」を機械的に数えられる
- 規制やSLAで「CISA KEV のCVEは X日以内に対応」のような**機械契約**が成り立つ

つまり CVE は **脆弱性の世界における「商品コード」**のようなもの。

## CVE-ID の構造

```
CVE - 2021 - 44228
 │     │      │
 │     │      └── そのCNAがその年に発行した連番（4〜7桁、可変長）
 │     └────────── 採番された年（≠脆弱性が公開された年）
 └──────────────── 固定接頭辞
```

**注意**：「2021」は **採番した年** であって**修正された年でも公開された年でもない**。先に予約だけしておいて翌年に公開されることもある。

## CVE のライフサイクル

```
Reserved（予約済み・非公開）
    ↓ 詳細が確定したら
Public / Awaiting Analysis（公開・未解析）
    ↓ NVD等が分析
Analyzed（CVSS / CWE / 影響製品が付与済）
    ↓ 必要があれば
Modified / Rejected
```

- **Reserved**：CNAが将来公開予定として番号だけ確保した状態。脆弱性詳細はまだ非公開。協調的開示（coordinated disclosure）でよくある
- **Awaiting Analysis**：詳細が公開され、NVD等で深堀り分析待ち
- **Analyzed**：CVSSスコア、CWEタイプ、CPE（影響を受ける製品/バージョン）が付与された状態
- **Rejected**：誤って割り当てられた、重複だった等で取り消されたCVE

## CNA（CVE Numbering Authorities）

CVEを発行できるのは**認定された組織だけ**。これがCNA。

- **Root CNA**：MITRE 自身（最終裁定）、CISA、JPCERT/CC（日本）、Red Hat（オープンソース全般）など
- **CNA**：自社製品の脆弱性に番号を振れる権限を持つ。GitHub、Microsoft、Google、Apple、Mozilla、Cisco、Oracle、AWS など
- **CNA-LR**（Last Resort）：上記でカバーできない領域を担当

GitHub は **オープンソースリポジトリ向けの大型CNA** で、`github.com/<org>/<repo>/security/advisories` から CVE を発行できる。**個人開発者がOSSを公開している場合、自分でCVEを取れる重要なルート**。

## CVE と NVD の違い

混同されがちな2つを整理：

| | CVE（MITRE） | NVD（NIST） |
|---|---|---|
| 役割 | **ID 台帳** | CVE に**追加情報を付与する分析データベース** |
| 持つ情報 | 説明文、参照リンク | + **CVSSスコア、CWE分類、CPE（影響製品）** |
| 提供元 | MITRE | NIST（米国国立標準技術研究所） |
| URL | cve.org | nvd.nist.gov |
| 関係 | NVD は CVE を取り込んで分析 | CVE 公開後に NVD が解析して付加情報を付ける |

実務で「CVEのスコア」と言うときの**スコアは多くの場合NVDが付けたもの**で、CVE本体には深刻度の概念がない。

## 関連用語との整理

[[CVSS]] のノートと重複するが、ここにも全体像を再掲：

| 名前 | 何を表す？ | 粒度 |
|---|---|---|
| **CVE** | 個別事象の **ID** | 1事象=1ID |
| **CVSS** | その事象の **深刻度スコア** | 1事象=1スコア（複数版あり） |
| **CWE** | 脆弱性の **型**（バグの種類） | 1事象に複数CWEが付くことも |
| **CPE** | 影響を受ける **製品・バージョン** | 機械可読な製品名 |
| **CAPEC** | 攻撃パターンの分類 | 攻撃側目線 |
| **[[OWASP Top 10]]** | Webで頻出する脆弱性カテゴリ TOP10 | 大カテゴリ |

### Log4Shell を全部に当てはめる

[[Log4Shell]] を例に並べると：

```yaml
CVE:    CVE-2021-44228
CVSS:   v3.1 Base 10.0 (Critical)  ← AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H
CWE:    CWE-502 (Deserialization of Untrusted Data)
        CWE-20  (Improper Input Validation)
        CWE-917 (Expression Language Injection)
CPE:    cpe:2.3:a:apache:log4j:2.14.1:*:*:*:*:*:*:*  （など）
OWASP:  Top 10 → A03 Injection / A06 Vulnerable and Outdated Components
KEV:    収載済み（2021/12/10）
EPSS:   公開直後ほぼ100%
```

「**CVEは骨**、CVSSは深刻度の肉付け、CWEは分類タグ、CPEは適用範囲、KEV/EPSSは現実の悪用情報、OWASPは大カテゴリ」と覚えるとスッキリする。

## CVE / KEV / EPSS — 優先順位付けの3点セット

CVEだけでは「何件ある」しか分からない。実務では下記を組み合わせて優先順位を付ける：

| | 提供元 | 答えること |
|---|---|---|
| **CVSS** | FIRST 仕様、NVD等が算出 | もし悪用されたらどれだけ深刻か |
| **EPSS** | FIRST | 30日以内に**実際に悪用される確率** |
| **CISA KEV** | CISA | **既に悪用が観測された** CVE のリスト |

```
CISA KEV該当 → 即対応
   ↓
EPSS高 + CVSS High↑ → 期限管理して計画対応
   ↓
CVSS Critical 単独 → スケジュールに乗せる
   ↓
それ以外 → 次回リリースで
```

## CVE エコシステムの最近のトピック

> [!warning] 2024年4月の MITRE 契約問題
> 2024年初頭、MITRE と米国政府の CVE 運営契約が短期で打ち切られかけ、業界に大きな動揺が走った（最終的に延長）。これを契機に、**ヨーロッパ主導で代替案 GCVE（Global CVE Allocation System）** や ENISA による **EUVD** など、CVEに依存しすぎない動きが進んでいる。実務的には当面 CVE が主流のままだが、複数IDが並走する未来は念頭に置く。

> [!info] 採番遅延・バックログ
> NVDは2024年に解析バックログが大量に積み上がり、「CVEは公開されたが NVD分析が追いついていない」状態が頻発。**新しいCVEは NVD ではなく GitHub Security Advisories や ベンダー直の情報を見るほうが速い**ことが増えている。

## 個人開発者にとっての使いどころ

### 受け取り側（依存ライブラリの脆弱性をチェック）

- [[Dependabot]] / [[Trivy]] / GitHub Security Advisory のレポートに **CVE-ID** が出る
- **CVE-ID で検索**すれば公式情報・パッチ・PoCが揃う：
  - https://nvd.nist.gov/vuln/detail/CVE-YYYY-NNNNN
  - https://github.com/advisories?query=CVE-YYYY-NNNNN
  - https://www.cve.org/CVERecord?id=CVE-YYYY-NNNNN
- **CISA KEV** に載っていれば最優先：https://www.cisa.gov/known-exploited-vulnerabilities-catalog

### 発信側（自分のOSSに脆弱性が見つかったとき）

- GitHub上のリポジトリで **Security Advisory** を作成すると、GitHubが CNA として **自動でCVEを発行**してくれる
- 流れ：
  1. リポジトリの `Security` タブ → `Report a vulnerability`
  2. プライベートで報告者と修正案を協議（**協調的開示**）
  3. パッチ準備
  4. Advisory を Publish → GitHubがCVE発行 → NVDに連携
- **発見者として外部OSSにCVEを切らせる**場合は、そのプロジェクトの SECURITY.md を読んで連絡経路に従う。直接GitHub Issueを切るのはNG（公開してしまうため）

## ハマりやすい落とし穴

- **CVE-IDが付いているからといって悪用可能とは限らない** — 理論的脆弱性に過ぎない場合も多い
- **同じ製品の同じ脆弱性に複数CVEが振られる**ことがある（CNAが分かれて重複）
- **CVE説明文が曖昧** — 詳細は元のSecurity Advisory やベンダーの release note を辿らないと判断できないケースが多い
- **ライブラリ脆弱性の「影響を受けるバージョン」記載が間違っていることがある** — 実機で再現するのが結局確実
- **CVEが付いていない脆弱性も存在する** — 全ての脆弱性がCVE化されるわけではない（CNA採番方針次第）

## 参考リンク

- CVE 公式：https://www.cve.org/
- NVD：https://nvd.nist.gov/
- GitHub Advisory Database：https://github.com/advisories
- CISA KEV：https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- EPSS：https://www.first.org/epss/
- JVN（日本のCVE的データベース）：https://jvn.jp/

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[CVSS]]
- [[OWASP]]
- [[OWASP Top 10]]
- [[セキュリティ標準とフレームワーク]]
- [[Log4Shell]]
- [[Trivy]]
- [[Dependabot]]
- [[ソフトウェアサプライチェーン強化]]
- [[サプライチェーン攻撃]]
- [[ファーストパーティコードとサードパーティコード]]
