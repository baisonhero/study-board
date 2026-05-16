---
tags: [inbox, learning, networking]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Stunnel
---

# stunnel

> [!summary]
> **stunnel** はTCPベースの任意プロトコル通信を **TLSでラップ** するOSSのトンネリングデーモン。たとえばTLS非対応のレガシーアプリケーション (POP3, IMAP, SMTP, MySQL, PostgreSQL) を変更せずに、stunnel経由で暗号化通信に乗せ替える、というユースケースで広く使われた。現代ではアプリ自体がTLS対応するのが普通だが、ZTNA / SOAR / DBプロキシ用途で今も現役。

## 動作モード

### クライアント側（accept → TLS wrap → connect）

```
[App] --TCP--> [stunnel client :11433] --TLS--> [stunnel server :1433]  --TCP--> [SQL Server]
                            ↓                                                      ↑
                      ローカルアプリ用                                             サーバー側で復号
```

`stunnel.conf` クライアント側：
```
[mssql]
client = yes
accept = 127.0.0.1:11433
connect = sql.example.com:1433
```

アプリは `127.0.0.1:11433` に普通のTCPで繋ぐだけで、外向きはTLSで暗号化される。

### サーバー側

```
[client TLS]:443 --> [stunnel server] --TCP--> [legacy app] :8080
```

`accept = 443`, `connect = 127.0.0.1:8080`, `cert = /etc/ssl/cert.pem` で受け側にTLS終端を生やせる。

## 似ているもの

- **TLS逆向き（リバプロ）**: Nginx / Envoy / Caddy が標準的に行う。stunnel は HTTP に限らない汎用版
- **[[SSHトンネル]]**: SSH接続の上に TCPトンネルを運ぶ。stunnel は TLS版
- **WireGuard / IPsec**: L3全体を運ぶ。stunnel は1つのTCPサービス専用

## 現代の主なユースケース

- **レガシーDB** (古いMSSQL, MySQL, PostgreSQLでTLS強制したい) を暗号化
- **メールプロトコル** (POP3S / IMAPS / SMTPS) を別ポート用意せず透過暗号化
- **クライアント証明書認証**: stunnel が mTLS を担当、後段は無認証のアプリへ
- **特殊な経路設計**: SASE製品のサイドカーとして

## 設定パターン例

mTLS で社内ツールを保護：

```
[secure-tool]
accept = 0.0.0.0:8443
connect = 127.0.0.1:8080
cert = /etc/stunnel/server.pem
CAfile = /etc/stunnel/ca.pem
verify = 2  # クライアント証明書の検証必須
```

## 出典

- stunnel: https://www.stunnel.org/
- GitHub: https://github.com/stunnel/stunnel

## 関連MOC

- [[MOC Networking]]
- [[MOC DevSecOps]]

## 関連ノート

- [[トンネルの分類と定義]]
- [[TLS]]
- [[TLSの仕組み]]
- [[SSHトンネル]]
- [[プロキシとリバースプロキシ]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
