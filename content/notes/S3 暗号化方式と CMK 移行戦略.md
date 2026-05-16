---
tags: [done, learning, security, aws]
created: 2026-05-16
aliases:
  - S3 SSE-KMS
  - S3 暗号化
  - SSE-KMS CMK
  - S3 CMK 移行
source: claude-chat
---

# S3 SSE-KMS (CMK) 暗号化と移行運用ガイド

> [!summary]
> 社外秘データを格納する [[S3]] バケットの暗号化を [[SSE-S3]] から [[SSE-KMS]] (CMK) へ移行する際の、設計判断と運用手順。脅威モデル・[[CMK]] 作成方法・[[CloudTrail]] による二段認可監査・[[Lambda]] + [[SES]] 復号送信パターン・[[OTel パイプライン]] 継続流入下での [[Replication]] 移行・[[S3 Inventory]] + [[Athena]] + [[S3 Batch Operations]] による進捗管理までを通しで整理。

関連トピック: [[KMS]] / [[S3 Inventory]] / [[Athena]] / [[S3 Batch Operations]] / [[CloudTrail]] / [[OTel パイプライン]] / [[Lambda]] / [[SES]]

---

## 1. 暗号化方式の整理

| 方式 | 鍵管理 | 監査ログ | 社外秘適性 |
|---|---|---|---|
| [[SSE-S3]] | AWS | × | △ 一般情報まで |
| [[SSE-KMS]] (AWS 管理鍵 `aws/s3`) | AWS/KMS | △ | ○ 社外秘の下限 |
| **SSE-KMS ([[CMK]])** | 顧客/[[KMS]] | ◎ | ◎ **推奨** |
| [[DSSE-KMS]] | 顧客/KMS 二重 | ◎ | ◎ 機密以上 |
| [[クライアントサイド暗号化]] | 顧客 (AWS 外) | ◎ | ◎ 極秘・規制対応 |

**結論**: 社外秘なら最低でも **SSE-KMS + Customer Managed Key**。

---

## 2. SSE-S3 の限界 (脅威モデル)

[[SSE-S3]] が防げるのは AWS 側のインシデント限定。

防げる:

- AWS データセンターからの物理ディスク盗難
- 廃棄ハードウェアからの復元
- AWS 内部の悪意ある作業員

**現実的な S3 漏洩シナリオには無力**:

- バケットポリシー誤設定 (パブリック公開)
- [[IAM]] クレデンシャル漏洩
- 内部不正 (権限を持つ社員の持ち出し)
- 署名付き URL の流出
- アプリ脆弱性経由のデータ取得

つまり SSE-S3 は「コンプライアンス文書に "保管時暗号化済み" と書ける」形式的価値が主目的。

---

## 3. CMK の作成方法

「[[CMK]]」は鍵生成元ではなく **管理主体が顧客** という意味。3 パターンある。

- **[[KMS]] で生成 (標準)**: KMS HSM 内部で鍵マテリアル生成。ポリシー・ローテーション・有効化/無効化は全て顧客管理 → これでも CMK 扱い
- **[[BYOK]] (インポート)**: 自分で鍵マテリアル生成して KMS にインポート。「鍵生成主体が自社」のエビデンス用途
- **[[External Key Store]] (XKS)**: 鍵を AWS 外部 HSM に置く。強い規制対応向け

普通の社外秘用途なら KMS 生成で十分。

---

## 4. アクセス制御の仕組み

### 透過復号と二段認可

SSE-KMS ([[CMK]]) では **S3 読み取り権限 + KMS 復号権限の両方** が必要。

- 両方持つ → コンソール GUI / CLI で透過的にプレビュー・ダウンロード可
- `s3:GetObject` のみ・`kms:Decrypt` なし → `AccessDenied`
- `kms:Decrypt` のみ・`s3:GetObject` なし → そもそもオブジェクトに到達不可

この「2 段目の関門」が [[KMS]] キーポリシーで定義され、[[CloudTrail]] に `kms:Decrypt` 呼び出しが残る点が SSE-S3 との決定的な違い。**復号ログの設定方法と参照方法は §12 を参照**。

### SSE-S3 との比較

| 項目 | [[SSE-S3]] | SSE-KMS ([[CMK]]) |
|---|---|---|
| 鍵単位のアクセス制御 | 不可 | 可 (KMS キーポリシー) |
| 復号者の監査 | 不可 | CloudTrail に全件記録 |
| 鍵無効化による即時アクセス遮断 | 不可 | 可 |
| 鍵ローテーション制御 | AWS 任せ | 顧客制御 |

---

## 5. Lambda + SES での復号送信

技術的には可能。[[Lambda]] 実行ロールに以下を付与:

```
s3:GetObject (対象バケット/プレフィックス)
kms:Decrypt (対象 KMS キー ARN)
ses:SendRawEmail (添付付きは RawEmail 必須)
```

```python
import boto3
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText

s3 = boto3.client('s3')
ses = boto3.client('ses')

# S3 が裏で KMS Decrypt を呼ぶ。Lambda コード上で明示呼び出し不要
obj = s3.get_object(Bucket='xxx', Key='secret.pdf')
pdf_bytes = obj['Body'].read()

msg = MIMEMultipart()
msg['Subject'] = '社外秘資料'
msg['From'] = 'sender@example.com'
msg['To'] = 'recipient@example.com'
msg.attach(MIMEText('本文'))
attachment = MIMEApplication(pdf_bytes, _subtype='pdf')
attachment.add_header('Content-Disposition', 'attachment', filename='secret.pdf')
msg.attach(attachment)

ses.send_raw_email(RawMessage={'Data': msg.as_string()})
```

### 設計上の注意

社外秘 PDF を [[SES]] でメール添付するのは技術的に動いても運用リスクが大きい。

- メールはサーバー間 TLS のみ。受信側メールボックス以降は平文
- 誤送信時のリカバリ不可
- SES 送信ログは宛先のみ。開封・転送は追跡不能
- 受信者から第三者への転送を技術的に防げない

**代替案**: [[S3 Presigned URL]] (有効期限つき) をメール送付。リンク時限失効・[[CloudTrail]] にアクセス者記録・誤送信時も期限切れで保護。

---

## 6. 既存データの CMK 移行

### 重要な前提

**バケットのデフォルト暗号化設定を変更しても、既存オブジェクトは自動的に再暗号化されない**。デフォルト暗号化は「これから新規 PUT されるオブジェクトに適用される設定」だけ。

既存データを移行するには **オブジェクトを自分自身に上書きコピー** するか、新バケットへコピーする必要がある。

### 同一バケット方式 vs 新バケット方式

| 観点 | 同一バケット再暗号化 | 新バケット移行 |
|---|---|---|
| アプリ参照変更 | 不要 | 全箇所書き換え |
| ロールバック | 困難 | 容易 (旧バケット残存) |
| 監査の説明しやすさ | △ 混在期間あり | ◎ クリーン |
| 一時的コスト | 通常 | ストレージ 2 倍 |
| カットオーバー作業 | 不要 | 必要 |

**社外秘文脈では新バケット方式が監査説明しやすい**。

---

## 7. S3 イベント通知のフィルタリング

[[S3]] イベントはタイプ単位でフィルタ可能。**これが継続流入下での移行の鍵**。

| イベント名 | 発生タイミング |
|---|---|
| `s3:ObjectCreated:Put` | 通常 PUT ([[Firehose]] やアプリのアップロード) |
| `s3:ObjectCreated:Post` | フォーム POST |
| `s3:ObjectCreated:Copy` | CopyObject API ([[S3 Batch Operations]] の再暗号化) |
| `s3:ObjectCreated:CompleteMultipartUpload` | マルチパート完了 |
| `s3:ObjectCreated:Replication` | [[Replication]] 経由 |

**[[Lambda]] 通知を `:Put` + `:CompleteMultipartUpload` に絞れば**、Copy 操作・Replication 経由はトリガーされない。これで「通常書き込みは発火・移行コピーは発火しない」を両立できる。

---

## 8. 継続流入下での移行戦略 (OTel パイプライン文脈)

[[OTel パイプライン]] で 1〜2 分間隔の書き込みがあるバケットの場合の推奨フロー。[[Firehose]] 出力先バケットの移行を想定。

### 推奨: 新バケット + S3 Replication 方式

1. 新バケットを作成 (デフォルト暗号化 [[CMK]] + [[Bucket Keys]] 有効)
2. 新バケットに [[Lambda]] 通知を設定 (`:Put` + `:CompleteMultipartUpload` のみ)
3. 旧→新で [[S3 Replication]] を設定 (既存オブジェクトの一括レプリケーション含む)
4. Replication 経由は `:Replication` イベントなので Lambda 発火しない
5. [[CloudWatch]] の `ReplicationLatency` メトリクスで転送完了を確認
6. Firehose の出力先を新バケットに切り替え (このタイミングだけ調整必要)
7. 切替後は新規書き込みが `:Put` で正常発火
8. 旧バケットを読み取り専用化 → 検証 → 削除

Firehose は内部バッファリングがあるので、切替の 1〜2 分間程度なら実質ダウンタイムなしで切り替え可能。

### 代替: 同一バケット内で再暗号化

1. [[Lambda]] 通知を `:Put` + `:CompleteMultipartUpload` に絞る (先に変更)
2. [[S3 Batch Operations]] で既存オブジェクトを自分自身にコピー (→ `:Copy` イベントなので Lambda 発火しない)
3. Firehose からの新規書き込みは `:Put` なので通常通り発火
4. バケットのデフォルト暗号化を [[CMK]] に変更

メリット: カットオーバー不要、Firehose 設定変更不要、アプリ影響ゼロ
デメリット: バージョニング有効だと旧暗号化バージョンが残る、バケット内に新旧混在期間が発生

---

## 9. 進捗管理: S3 Inventory + Athena + Batch Operations

バケット内に [[SSE-S3]] と [[CMK]] が混在する状況で、どのファイルが移行済か追跡する標準ワークフロー。

### 個別ファイル確認

```bash
aws s3api head-object --bucket xxx --key yyy \
  --query '[ServerSideEncryption, SSEKMSKeyId]'
```

返り値:

- `["AES256", null]` → SSE-S3 (移行対象)
- `["aws:kms", "arn:aws:kms:..."]` → SSE-KMS (移行済み)

`list-objects` では暗号化情報は返らない。件数が多い場合は HEAD 全件は非現実的。

### 大量データの一括識別: S3 Inventory

[[S3 Inventory]] はバケット内全オブジェクトのメタデータを日次/週次で CSV/Parquet 出力する機能。

設定手順:

1. インベントリ出力先バケットを用意
2. 対象バケットで Inventory 設定を作成
3. 出力フィールドに `EncryptionStatus` を含める
4. 形式は [[Parquet]] 推奨 ([[Athena]] クエリで高速・低コスト)
5. 初回出力は最大 48 時間待ち

### Athena で移行対象を抽出

```sql
-- 暗号化方式ごとの件数 (進捗ダッシュボード用)
SELECT encryption_status, COUNT(*) AS cnt
FROM s3_inventory
WHERE dt = '最新日付'
GROUP BY encryption_status;

-- 移行対象 (SSE-S3) のキー一覧を抽出
SELECT key FROM s3_inventory
WHERE dt = '最新日付'
  AND encryption_status = 'SSE-S3';
```

### Batch Operations への接続

抽出したキー一覧をマニフェスト形式 (CSV) で S3 に置き、[[S3 Batch Operations]] のジョブ入力に指定。

```
bucket-name,object-key
my-bucket,logs/2024/01/file001.json.gz
my-bucket,logs/2024/01/file002.json.gz
```

Batch Operations の Copy ジョブでは、コピー時の暗号化指定として `aws:kms` + [[CMK]] ARN を渡せる。

---

## 10. 完了判定と監査証跡

[[Athena]] クエリで `encryption_status = 'SSE-S3'` の件数がゼロになれば移行完了。

この結果セットを保存しておけば監査エビデンスにそのまま使える:

- Athena クエリ実行履歴
- [[CloudTrail]] の `CopyObject` 件数
- `head-object` 全件確認スクリプトの結果

社外秘移行の文脈では、「いつから全データ [[CMK]] になったか」を Athena 結果で明示できると説明が綺麗。

---

## 11. コストの目安

- **[[S3 Inventory]]**: ¥0.0025/100 万オブジェクト程度 (リスト料金)
- **[[Athena]] クエリ**: スキャンしたデータ量で課金。Parquet 形式なら数十円〜
- **[[S3 Batch Operations]]**: ジョブあたり $0.25 + オブジェクトあたり $1/100 万件 + 通常の Copy/KMS 料金
- **[[KMS]] API コスト**: SSE-KMS はオブジェクト単位で KMS API を呼ぶ → **[[Bucket Keys]] を必ず有効化** (90%以上削減可)

---

## 12. CMK 復号ログの取得と分析

[[CMK]] にした最大の運用メリットの一つが「**誰が・いつ・どの S3 オブジェクトを復号したか**」を全件追跡できる点。設定方法と参照方法を整理。

### デフォルト動作

[[KMS]] API 呼び出し (`Encrypt` / `Decrypt` / `GenerateDataKey` / `ReEncrypt`) は **[[CloudTrail]] の management event として自動的に記録される**。data event の有効化は不要。

ただし「自動的に記録」は **アカウント内で trail が 1 本でも作られている前提**。trail 未作成だと [[CloudTrail]] Event history (直近 90 日・コンソール参照のみ) しか残らないため、監査要件があるなら必ず trail を作る。

### Step 1. CloudTrail Trail の作成

AWS マネジメントコンソール: **CloudTrail → Trails → Create trail**

| 設定項目 | 推奨値 |
|---|---|
| Trail name | `org-audit-trail` 等 |
| Storage location | 別バケット (専用) |
| Log file SSE-KMS encryption | 有効 (別 CMK で暗号化) |
| Log file validation | 有効 (改竄検知用ハッシュ) |
| CloudWatch Logs | 有効 (アラート連携用) |
| Management events: Read | **ON** ([[KMS]] `Decrypt` は Read 扱い) |
| Management events: Write | ON (`PutKeyPolicy` 等の検知) |
| Data events | (S3 個別オブジェクトの Get/Put 監査が必要な場合のみ) |

**ベストプラクティス**: trail 保管先バケットを **別 AWS アカウント** に置く ([[CloudTrail]] log destruction 防止)。Organization Trail を使えば全アカウントの監査ログを 1 箇所に集約可能。

### Step 2. ログに記録される内容

CMK で S3 オブジェクトを取得すると、以下のような [[CloudTrail]] event が出る:

```json
{
  "eventTime": "2026-05-16T10:23:11Z",
  "eventName": "Decrypt",
  "eventSource": "kms.amazonaws.com",
  "userIdentity": {
    "type": "AssumedRole",
    "principalId": "AROAEXAMPLE:my-session",
    "arn": "arn:aws:sts::123456789012:assumed-role/data-reader/my-session",
    "sessionContext": {
      "sessionIssuer": {
        "arn": "arn:aws:iam::123456789012:role/data-reader"
      }
    }
  },
  "sourceIPAddress": "203.0.113.42",
  "userAgent": "[aws-cli/2.x]",
  "requestParameters": {
    "encryptionContext": {
      "aws:s3:arn": "arn:aws:s3:::my-bucket/secret.pdf"
    },
    "encryptionAlgorithm": "SYMMETRIC_DEFAULT"
  },
  "resources": [
    {
      "ARN": "arn:aws:kms:ap-northeast-1:123456789012:key/abcd-...",
      "type": "AWS::KMS::Key"
    }
  ],
  "errorCode": null
}
```

押さえどころ:

- **`userIdentity`**: 誰が ([[IAM]] ロール ARN・セッション名)
- **`sourceIPAddress`**: どこから (社内 NAT 範囲外なら異常)
- **`requestParameters.encryptionContext."aws:s3:arn"`**: **どの S3 オブジェクト** を復号したか。これが CMK 監査の決定打
- **`resources[].ARN`**: どの CMK を使ったか
- **`errorCode`**: 失敗 (`KMSInvalidStateException` / `AccessDeniedException`) も全部記録される

### Step 3. ログの取得場所

| 場所 | 保管期間 | 用途 |
|---|---|---|
| **CloudTrail Event history** (コンソール) | 90 日 | ad-hoc 調査・直近の確認 |
| **Trail 出力先 S3** | 永続 (ライフサイクル設定次第) | 長期保管・[[Athena]] クエリ |
| **CloudTrail Lake** | 最大 7 年 | SQL ライクなクエリ・コンプライアンス対応 |
| **CloudWatch Logs** | 設定次第 | リアルタイムアラート ([[CloudWatch]] メトリクスフィルタ) |

### Step 4. Athena で復号ログを分析

trail 出力先バケットに対して [[Athena]] テーブルを作っておくと、CMK Decrypt の通常運用クエリが書ける。

```sql
-- 特定 CMK の Decrypt 全件 (直近 7 日)
SELECT
  eventTime,
  userIdentity.principalId AS principal,
  userIdentity.sessionContext.sessionIssuer.arn AS role,
  sourceIPAddress,
  json_extract_scalar(requestParameters, '$.encryptionContext."aws:s3:arn"') AS s3_object,
  errorCode
FROM cloudtrail_logs
WHERE eventName = 'Decrypt'
  AND eventSource = 'kms.amazonaws.com'
  AND resources[1].ARN = 'arn:aws:kms:ap-northeast-1:xxx:key/yyy'
  AND eventTime > date_format(current_date - interval '7' day, '%Y-%m-%dT%H:%i:%sZ')
ORDER BY eventTime DESC;

-- 異常検知: 滅多に Decrypt しない Principal を炙り出す
SELECT
  userIdentity.principalId AS principal,
  sourceIPAddress,
  COUNT(*) AS cnt
FROM cloudtrail_logs
WHERE eventName = 'Decrypt' AND eventSource = 'kms.amazonaws.com'
  AND eventTime > date_format(current_date - interval '30' day, '%Y-%m-%dT%H:%i:%sZ')
GROUP BY userIdentity.principalId, sourceIPAddress
HAVING COUNT(*) < 5
ORDER BY cnt;

-- 特定 S3 オブジェクトを誰が読んだか
SELECT eventTime, userIdentity.principalId, sourceIPAddress
FROM cloudtrail_logs
WHERE eventSource = 'kms.amazonaws.com' AND eventName = 'Decrypt'
  AND json_extract_scalar(requestParameters, '$.encryptionContext."aws:s3:arn"')
      = 'arn:aws:s3:::my-bucket/secret.pdf'
ORDER BY eventTime DESC;
```

### Step 5. リアルタイムアラート

[[CloudWatch]] Logs と [[EventBridge]] 経由で異常を即時通知:

- **CloudWatch メトリクスフィルタ**: trail の CloudWatch Logs ストリームに対し、`Decrypt` の失敗 (`errorCode = "AccessDenied"`) や特定 Principal の出現をパターン化し、SNS → Slack
- **EventBridge ルール**: `source = aws.kms` & `detail.eventName = Decrypt` を [[Lambda]] / SNS に流す。新規 IAM Role からの Decrypt や夜間アクセスを検知
- **CloudTrail Insights**: API call の base rate からの逸脱を自動検知 (有料・~$0.35/100k events)。KMS Decrypt 急増の早期発見向け

### 落とし穴と注意点

1. **[[Bucket Keys]] とのトレードオフ**: Bucket Keys を有効にすると、S3 がバケット単位の data key をキャッシュして KMS 呼び出しを集約する。結果として **個別オブジェクトの Decrypt 1:1 トレースが取れなくなる** (S3 内部でまとめて 1 回の Decrypt にされる)。コスト 90% 減と引き換えに監査粒度が落ちる → 「監査要件 > コスト」のバケットには Bucket Keys 無効、そうでなければ有効、と分ける運用が現実解
2. **encryptionContext は呼び出し元任意**: S3 や Lambda 経由なら自動で `aws:s3:arn` が入るが、SDK 直接呼びの自社アプリは context を明示的に渡す必要がある。社内コーディング規約に入れる
3. **trail がない / 止まっている**: CMK にしただけで満足せず、**trail のヘルスチェック** (CloudWatch アラーム: `IsLogging = false` 検知) を必ず仕込む。trail 自体を消す攻撃ベクトルもあるので、Organization Trail で集中管理が望ましい
4. **CloudTrail Logs 自体の暗号化**: trail 出力先 S3 を [[CMK]] で暗号化する場合、その CMK は trail 用に別キーを切る (監査対象キーと監査ログキーは分離)
5. **コスト**: management event 自体は **無料** (最初の 1 コピー分)。S3 出力ストレージと Athena スキャン料、CloudTrail Lake / Insights は別途課金

---

## 関連メモ・派生タスク

- 自社 [[S3]] バケットで [[Bucket Keys]] が未設定の場合、コスト最適化として優先度高
- `head-object` 全件検証スクリプトを再利用可能ツールとして整備しておくと監査時に強い
- [[Lambda]] 通知設定の変更は事前に dev 環境で動作確認 (`:Copy` 除外で漏れがないか)
- 既存の S3 → Lambda パイプライン (`test-s3-before-bison` → `test-s3-after-bison`) もこのパターンの適用候補

---

## 残課題（議論の元になった問い）

1. [[SSE-S3]] の暗号化レベルは社外秘に十分か → 不十分。AWS 側インシデント限定の保護
2. [[CMK]] は自分で鍵を作るのか、AWS で作ったものを使えるのか → どちらも可。普通は [[KMS]] で生成
3. CMK 化すると GUI で見られなくなるのか → そうではなく、二段の権限が必要になる
4. [[Lambda]] で CMK 暗号化 PDF を復号して [[SES]] 送信できるか → 可能だが運用リスク大、[[S3 Presigned URL]] 推奨
5. デフォルト暗号化を CMK に変更すれば既存データも CMK 化されるか → されない。明示的な再コピーが必要
6. 同一バケット再暗号化 vs 新バケット移行どちらが良いか → 用途次第。社外秘は新バケットが説明しやすい
7. [[OTel パイプライン|OTel]] で継続流入する状況で切り替えタイミングを取りにくい → [[Replication]] + イベント種別フィルタで解決
8. Lambda トリガーで「通常書き込みは発火・コピーは発火しない」は可能か → 可能。`:Put` 系のみに絞る
9. SSE-S3 と CMK の混在状態でどのファイルが未移行か識別できるか → 可能。[[S3 Inventory]] + [[Athena]]

---

## 関連MOC

- [[MOC AWS]]
- [[MOC Security]]
- [[MOC Learning]]

## 関連ノート

- [[AWSセキュリティ実装]]
- [[暗号の基礎]]
- [[セキュリティロギング設計]]
- [[セキュリティ標準とフレームワーク]]
- [[セキュリティ識別子の体系]]
- [[インフラセキュリティ運用]]
- [[A02 Cryptographic Failures]]
- [[A09 Security Logging and Monitoring Failures]]
