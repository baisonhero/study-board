---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Juice Shop
  - OWASP JuiceShop
---

# OWASP Juice Shop

> [!summary]
> **OWASP Juice Shop** は OWASP が公開している **意図的に脆弱な Web アプリケーション**。Node.js + Angular で実装された "ジュース通販サイト" の体裁を取りながら、内部に [[OWASP Top 10]] / [[OWASP ASVS]] 対応の100以上のチャレンジを仕込んである。学習者は SQLi、XSS、IDOR、JWT改ざん、レースコンディションなど現代的な脆弱性を**手元のブラウザで**実演できる。[[攻撃側視点とハンズオン学習]] の入口として鉄板。

## 何ができるか

- **OWASP Top 10 全カテゴリ** の実演（[[A01 Broken Access Control]] 〜 [[A10 SSRF]]）
- **JWT** の改ざん、`alg: none` 攻撃、署名鍵の弱さ
- **GraphQL** のイントロスペクション悪用、Batching Attack
- **REST API** の認可漏れ、IDORの典型
- **ファイルアップロード** 経由のリモートコード実行
- **CAPTCHA バイパス**、レートリミット欠如
- **クライアントサイド** のソースマップ漏洩、コメント内の管理者ヒント

各チャレンジには **難易度1〜6（★）** が付き、CTF的に解いていける。スコアボードで進捗が可視化される。

## デプロイ方法

```bash
# Docker（推奨、最も速い）
docker run --rm -p 3000:3000 bkimminich/juice-shop

# Node.js から直接
git clone https://github.com/bkimminich/juice-shop
cd juice-shop && npm install && npm start

# Heroku / Vercel / GitPodなど one-click deploy も公式提供
```

ローカルで `http://localhost:3000` を [[OWASP ZAP]] / Burp Suite 経由で叩く、というのが典型的な学習構成。

## 学習の進め方

1. **無垢にUIを触る**: 普通のECサイトとして買い物してみる（業務知識）
2. **DevToolsを開く**: Network・Console・Application タブで構造を観察
3. **公式ヒント無しで Easy（★）を解く**: SQL Injection で管理者ログイン、など
4. **詰まったら ヒントブック**: 公式 GitBook がチャレンジごとに段階的ヒント
5. **Mediumへ進む**: OWASP ZAP / Burp で自動化された探索を試す
6. **GraphQL / WebSocket チャレンジへ**: モダン技術スタックの攻撃面を理解

## なぜ「ジュース通販」か

- 業務ドメインがシンプル（買い物カゴ・購入・配送・レビュー）→ 学習者が機能を理解するコストが低い
- 商品画像・販売文句にイースターエッグが仕込まれている
- 多言語対応で世界中で使われている

## 注意点

- 本物の機密情報は入っていないが、**インターネットに公開しない**。攻撃対象に対する公開承認の練習場所として認められているのはローカルか自分の管理下のみ
- 攻撃手法を学ぶ性質上、業務システムへの応用は厳禁（[[コンプライアンスと法規制]] 参照）

## 出典

- OWASP Juice Shop: https://owasp.org/www-project-juice-shop/
- 公式 Pwning Juice Shop（GitBook）: https://pwning.owasp-juice.shop/
- GitHub: https://github.com/juice-shop/juice-shop

## 関連MOC

- [[MOC Security]]

## 関連ノート

- [[OWASP Top 10]]
- [[OWASP]]
- [[OWASP ZAP]]
- [[攻撃側視点とハンズオン学習]]
- [[A01 Broken Access Control]]
- [[A03 Injection]]
- [[DAST]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
