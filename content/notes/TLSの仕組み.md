---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - TLS Handshake
  - TLSハンドシェイク
---

# TLSの仕組み

> [!summary]
> 本ノートは [[TLS]] のハンドシェイクと鍵導出を中心に、**1パケットずつ何が起きているか** を整理する。TLS 1.3 を主にして、必要に応じて TLS 1.2 と比較する。**TLS 1.3 の正味のハンドシェイクは 1-RTT**（接続開始から最初のアプリデータ送信まで1往復）で、レイテンシを大幅に削った。

## TLS 1.3 ハンドシェイクの流れ

```
Client                                          Server
  | ----- ClientHello ----------------------->  |
  |       supported_versions: TLS 1.3           |
  |       cipher_suites: [TLS_AES_128_GCM_..]   |
  |       key_share: ECDHE public_key_C         |
  |       random_C                              |
  |                                             |
  | <---- ServerHello -----------------------   |
  |       key_share: ECDHE public_key_S         |
  |       random_S                              |
  | <---- {EncryptedExtensions}                 |
  | <---- {Certificate}                         |
  | <---- {CertificateVerify}                   |
  | <---- {Finished}                            |
  |                                             |
  | ----- {Finished} ------------------------>  |
  |                                             |
  | ----- [Application Data] -----------------> |
  | <---- [Application Data] ------------------ |
```

`{}` は **handshake key** で暗号化、`[]` は **application key** で暗号化される。

## 鍵導出 (HKDF)

ECDHE で共有秘密 `Z` を生成 → HKDF-Extract で `Early Secret` → `Handshake Secret` → `Master Secret` と階段状に鍵を引き出す。各段階で `client_handshake_traffic_secret` / `server_handshake_traffic_secret` / `client_application_traffic_secret` / `server_application_traffic_secret` が導出される。

## 認証

- **ECDSA / RSA 署名**: サーバーは秘密鍵で `CertificateVerify` を作り、自分が証明書の正当な持ち主であることを証明
- **証明書チェーン検証**: クライアントは中間CAとルートCAまで遡って信頼を確認
- **SNI (Server Name Indication)**: 一つのIPに複数サイト同居 → ClientHelloでホスト名を明示

## 0-RTT

過去にハンドシェイク済みの相手には、`session_ticket` を使った 0-RTT 接続が可能（クライアントは再開時点でアプリデータを最初の ClientHello に乗せて送る）。ただし **リプレイ攻撃**のリスクがあり、副作用のないリクエスト (GET) にのみ使うのが原則。

## TLS 1.2 との違い

| 観点 | TLS 1.2 | TLS 1.3 |
|---|---|---|
| ハンドシェイクRTT | 2-RTT | 1-RTT (0-RTT再開可) |
| 暗号スイート | 多数（弱いものも含む） | 削減（強いものだけ） |
| PFS | オプション | 必須 |
| 静的RSA鍵交換 | 可 | 廃止 |
| Compression | あり (CRIME脆弱性) | 廃止 |
| Renegotiation | あり | 廃止 (post-handshake) |

## デバッグツール

- `openssl s_client -connect example.com:443 -tls1_3 -trace`
- `tshark -i any -Y "tls.handshake"`
- SSL Labs: 公開サーバーの設定診断

## 出典

- RFC 8446: https://datatracker.ietf.org/doc/html/rfc8446
- Cloudflare TLS 1.3 解説: https://blog.cloudflare.com/tls-1-3-explained/
- Mozilla TLS Recommendations: https://wiki.mozilla.org/Security/Server_Side_TLS

## 関連MOC

- [[MOC Security]]

## 関連ノート

- [[TLS]]
- [[暗号の基礎]]
- [[A02 Cryptographic Failures]]
- [[OWASP Top 10]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
