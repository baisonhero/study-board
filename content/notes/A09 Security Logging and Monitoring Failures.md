---
tags: [inbox, learning, security]
created: 2026-05-05
aliases:
  - A09
  - Security Logging and Monitoring Failures
  - ログ不足
  - 監視不足
---

# A09 Security Logging and Monitoring Failures

> [!summary]
> [[OWASP Top 10]] 2021年版で **9位**。「攻撃された／侵害された」のに **気付けない** ことがリスク、というカテゴリ。世界平均で侵害の検知に **数百日** かかると報告される（IBM "Cost of a Data Breach"）。ログがない／構造化されていない／集約されていない／アラート設計がない、いずれもここに該当。可観測性（[[Observability]]）と地続き。

## どういう脆弱性か

- **重要操作のログがない** — ログイン失敗、権限変更、エクスポート、削除
- **ログに必要情報が欠ける** — 誰が／何を／いつ／どこから
- **構造化されていない** — `printf` 的な人間向けログだけで機械分析できない
- **保管期間が短い** — インシデント発生時に既にローテで消えている
- **集約されていない** — 各サーバにバラバラで横断検索できない
- **アラート設計がない** — ログはあるが誰も見ない／通知されない
- **PII／秘密情報がログに混入** — 別の脆弱性に転化（[[A02]]）
- **ログ自体の改ざん耐性なし** — 攻撃者が侵入後に痕跡を消せる

## 攻撃例

### 検知遅延の典型

- 攻撃者が侵入 (Day 0)
- ラテラルムーブメント、権限昇格、データ持ち出し（Day 1〜数週間）
- ある日、外部研究者／顧客／ダークウェブ販売情報から **第三者経由で発覚**

業界の年次調査でも検知の **大半が外部通報** によるという数字が繰り返し出ている。社内検知できていない＝ログ／監視の失敗。

### ログ削除によるカバーアップ

```bash
# 攻撃者が侵入後にログ削除
> /var/log/auth.log
echo "" > /var/log/syslog
```

ローカルログだけだと改ざんで証跡が消える。

### PII ログ漏洩

```javascript
logger.info(`Login attempt: ${JSON.stringify(req.body)}`)
// → email, password が平文ログに残る
// → ログ保存先（CloudWatch、S3、SaaS）の権限を持つ全員に閲覧可能
```

Twitter (2018) は内部ログにパスワードが平文記録されていた事例があった。

## 防御策

### 1. 「最低限ログを残すべき」イベントを定める

- **認証**: ログイン成功／失敗、ログアウト、パスワード変更、MFA設定変更
- **認可**: 権限変更、ロール付与、管理者操作
- **データ**: 削除、エクスポート、大量参照
- **入力検証エラー**: 正常系から外れた挙動
- **サーバ／インフラ**: クラッシュ、再起動、設定変更
- **セキュリティ**: WAF検知、レート制限発動、不審なIP

### 2. 構造化ログ（JSON）

```json
{
  "ts": "2026-05-05T10:00:00Z",
  "level": "info",
  "event": "auth.login.success",
  "user_id": "u_123",
  "ip": "203.0.113.5",
  "ua": "Mozilla/5.0...",
  "trace_id": "abc-def"
}
```

タイムスタンプ、トレースID、ユーザーID、IPは標準項目に。検索・集計の効率が桁違い。

### 3. 一元集約とログ転送

- **集約先**: CloudWatch Logs、Datadog、Grafana Loki、Splunk、Elastic、BigQuery
- **転送経路**: OpenTelemetry Collector、Fluent Bit、Vector
- ホストローカルだけにせず、ホストが落ちても残る場所に
- アクセス権を最小化（運用者は読める、開発者は本番ログ閲覧に承認）

### 4. ログから機微情報を除外（redaction）

- パスワード、JWT、APIキー、クレカ番号、PIIをマスク
- ロガー側で `redact` 設定（pino、winston、bunyanの機能）
- 構造化ログだとフィールドベースで自動除外しやすい

### 5. アラート設計（SIEM / 監視ルール）

- ログイン失敗連続 → 認証ブルートフォース
- 管理者ログインの普段と違うIP／時刻
- 大量ダウンロード／エクスポート
- WAF / Cloudflare の異常検知
- エラーレート急上昇（[[システム監視と可観測性]]）

アラートは **PagerDuty / Slack** 等の人間にちゃんと届く先へ。

### 6. 改ざん耐性

- 重要ログは **append-only ストレージ**（S3 Object Lock、CloudWatch Logs の immutable 設定）
- WORM (Write Once Read Many) ストレージ
- ログ転送は終端で署名／ハッシュチェーン

### 7. 保管期間（リテンション）方針

| 種別 | 推奨期間 |
|---|---|
| 認証ログ | 1年以上 |
| アクセスログ | 90〜180日（ホット）+ 1年（コールド） |
| セキュリティアラート | 1〜2年 |
| 監査証跡 | 法令準拠（PCI DSSは1年、SOC2では1年） |

[[コンプライアンスと法規制]] のフレームワークに合わせて決める。

### 8. インシデント対応との接続

- ログから攻撃のタイムラインを再構築できる体制
- Runbook（[[インシデントレスポンス]]）でログクエリのテンプレ化
- フォレンジック用の保全手順

## 検出手段

- **観点**: 「自分で1時間で `誰がいつ何をしたか` が再構築できるか？」
- **テスト**: 模擬侵入演習（red team / purple team）でアラート発火を確認
- **ログレビュー**: 月次で誤検知／検知漏れを点検

## 参考事例

- **多数の侵害事例で「検知まで200日超」** — IBM "Cost of a Data Breach Report" の長期トレンド
- **Capital One (2019)** — IDS/SIEMが検知を出していたが、運用側でアラートが埋もれていたとされる（[[A05]]、[[A10]]とも関連）
- **Twitter (2018)** — 内部ログにパスワード平文混入

## Next.js / Supabase での落とし穴

- **Vercel Logs の保管期間** — プランによる。長期保管は外部転送が必須
- **Supabase の audit log** — 有効化されているか、アクセス権限を確認
- **Edge Functions のログ** — リージョン分散で集約必須
- **クライアント側エラーログ** — Sentry等を使っても PII 除外を必ず設定
- **OpenTelemetry** — トレース／メトリクス／ログを統合（[[Observability]]）

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]
- [[MOC Observability]]
- [[MOC Learning]]

## 関連ノート

- [[OWASP Top 10]]
- [[セキュリティロギング設計]]
- [[システム監視と可観測性]]
- [[インシデントレスポンス]]
- [[コンプライアンスと法規制]]

## 出典

- [OWASP Top 10:2021 A09 Security Logging and Monitoring Failures](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/)
- [OWASP Cheat Sheet: Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [IBM Cost of a Data Breach Report](https://www.ibm.com/reports/data-breach)
