---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - ZAP
  - Zed Attack Proxy
  - OWASP Zed Attack Proxy
---

# OWASP ZAP

> [!summary]
> **OWASP ZAP (Zed Attack Proxy)** は OWASP が開発・維持する OSS の Web脆弱性スキャナ / 中間プロキシ。ブラウザとサーバー間に挟まり、リクエスト・レスポンスを傍受しつつ自動的に [[A01 Broken Access Control]] / [[A03 Injection]] / [[A05 Security Misconfiguration]] などを攻撃側視点で検査する。商用の Burp Suite と並ぶ [[DAST]] の代表格で、無償で使える点が最大の強み。

## 主な機能

- **中間プロキシ**: ブラウザのトラフィックを記録・改変
- **自動スキャン**: クロール → 攻撃ペイロード注入 → 脆弱性レポート
- **手動探索（Spider / AJAX Spider）**: SPAのDOMを辿る
- **Fuzzer**: パラメータに大量のペイロードを順に注入
- **API スキャン**: OpenAPI / GraphQL / SOAP 定義から自動的にエンドポイント列挙
- **HUD（Heads-Up Display）**: ブラウザにオーバーレイを表示し、探索しながら結果を確認
- **CI 統合**: `zap-baseline.py` をDockerで実行し、GitHub Actions / Jenkins / GitLab に組み込む

## DAST としての位置づけ

[[SAST]] が「コードを読んで脆弱性パターンを探す」のに対し、ZAP は **実際にHTTPリクエストを投げて反応を見る**。`<script>` 注入が画面に反映されるか、`'OR'1'='1` で認証が外れるか、`/admin` に未認証アクセスできるか、を試す。**動いているアプリにしか効かない**点が SAST との大きな違い。

## CI/CD パイプラインに入れる

```yaml
- name: ZAP Baseline Scan
  uses: zaproxy/action-baseline@v0.10.0
  with:
    target: 'https://staging.example.com'
    cmd_options: '-a'  # アクティブスキャン有効
```

ステージング環境に対する **ベースラインスキャン**（受動的）を毎晩走らせ、新規脆弱性が見つかったら Slack 通知、というのが現実的な運用。本番に対するアクティブスキャンは負荷攻撃と区別がつかないので注意。

## Burp Suite との比較

| 観点 | OWASP ZAP | Burp Suite Pro |
|---|---|---|
| ライセンス | OSS（無料） | 商用（年契約） |
| 自動化 | スクリプト・CI連携が強い | Burp Suite Enterprise が別売 |
| 手動探索UX | やや癖がある | プロが使う標準 |
| プラグイン | Marketplace | BApp Store |

学習・自動化用途なら ZAP、ペンテスター個人の主力なら Burp、という棲み分けが一般的。

## 学習リソース

- [[OWASP Juice Shop]] を ZAP でスキャン → 各カテゴリの脆弱性を実機で観察、という流れが [[攻撃側視点とハンズオン学習]] の定番ルート。
- ZAP公式の Getting Started はステップごとの実践教材として優秀。

## 出典

- OWASP ZAP: https://www.zaproxy.org/
- GitHub: https://github.com/zaproxy/zaproxy
- ZAP Action: https://github.com/zaproxy/action-baseline

## 関連MOC

- [[MOC Security]]
- [[MOC DevSecOps]]

## 関連ノート

- [[DAST]]
- [[SAST]]
- [[OWASP Top 10]]
- [[OWASP Juice Shop]]
- [[OWASP]]
- [[攻撃側視点とハンズオン学習]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
