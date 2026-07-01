---
tags: [done]
created: 2026-04-19
---

# MOC Learning

学習トラック全体の地図。知識の底上げが目的。直接の収益は狙わない。

## 分野別
- [[MOC AWS]]
- [[MOC Security]]
- [[MOC AI Engineering]]
- [[MOC Observability]]
- [[MOC DevSecOps]]
- [[MOC Business]]

## 最近の学習ノート
- 2026-07-01 [[AWS と GCP のクロスクラウド連携]] — STS ⇔ WIF で長期キー無しの双方向 ID フェデレーション。値の受け渡し（aud はあなた発、sub は相手発）
- 2026-06-07 [[Claude Managed Agents]] — Anthropic ホストの meta-harness。Brain/Hands/Session 3分離、長時間タスク向きの裏方インフラ
- 2026-06-07 [[AWS で Claude を利用する 3 つの選択肢]] — Bedrock / Claude Platform on AWS / Claude Enterprise の違い、1st/3rd party 視点、Marketplace の役割
- 2026-06-07 [[サプライチェーン攻撃]] — 定義／類型／2024-2026 の実事例（XZ・Polyfill・CrowdStrike・Vercel OAuth・npm 連発攻撃）／他攻撃との違い
- 2026-06-06 [[DAU WAU MAU を AWS で計測する]] — RUM 匿名モードで PII を持たずに unique ユーザー数を取る5つの選択肢
- 2026-06-06 [[サイドカーパターン]] — 補助コンテナで横断機能を切り出す。CW agent / OTel Collector / Envoy の文脈
- 2026-06-06 [[ECS と Lambda の観測性設計]] — 3パターン比較 → Application Signals 採択（ECS Next.js + Lambda）
- 2026-05-26 [[PrivateLink で別アカウントの Aurora に接続する]] — TGW との比較／NLB＋RDS Proxy 経由で公開／各アカウント実施事項
- 2026-05-23 [[TGW クロスアカウント接続 まとめ]] — TGW ノートの早見版。誰が何を設定するか / C が接続性を制御する図解
- 2026-05-21 [[Transit Gateway で複数 AWS アカウントを接続する]] — TGW クロスアカウント、B の Lambda/ECS → A の Aurora、CIDR 重複の罠
- 2026-05-21 [[AI 利用コストの予算設計]] — AI は消費型コスト、計画なき利用は予算事故（Uber 4ヶ月枯渇）
- 2026-05-21 [[SQL N＋1 問題と解決法|SQL N+1 問題と解決法]] — N+1 アンチパターン、ORM 遅延ロード、JOIN / IN バッチ / DataLoader
- 2026-05-21 [[SQL ビューの基礎と使いどころ]] — VIEW = 名前付き保存クエリ、抽象化 / 権限制御 / マテビュー
- 2026-05-21 [[NextAuth セッションと id_token デコードの関係]] — id_token デコードはサインイン1回、以降は NextAuth 独自セッション
- 2026-05-19 [[Cognito OAuth 実装と JWT 検証リファレンス]] — Cognito + API Gateway + Lambda Authorizer の実装メモ、SPA トークン保管
- 2026-05-17 [[OAuth 認証フローと Cognito クロスアプリ連携]] — Authorization Code Flow / トークン種別 / Cognito × IIC 多重連携
- 2026-05-16 [[S3 暗号化方式と CMK 移行戦略]] — AWS × Security 横断: SSE-KMS / CMK 移行運用

## 関連リンク
- [[MOC Home]]
- [[MOC Reading]]
