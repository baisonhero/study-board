---
tags: [inbox, learning, security]
created: 2026-05-14
auto-generated: 2026-05-14
aliases:
  - Transport Layer Security
  - SSL
---

# TLS

> [!summary]
> **TLS (Transport Layer Security)** は TCP 上で動く暗号通信プロトコル。1999年 SSL 3.0 の後継として TLS 1.0 が定義され、現在の主流は **TLS 1.2** (RFC 5246) と **TLS 1.3** (RFC 8446)。HTTP/HTTPS の "S" の中身であり、現代のインターネットの機密性・完全性・認証を支える基盤。TLS なしには Web アプリ・モバイルアプリ・APIどれも成立しない。

## 提供する3つのプロパティ

- **機密性 (Confidentiality)**: 通信中の盗聴を防ぐ
- **完全性 (Integrity)**: 中間で改ざんされたら検知できる
- **認証 (Authentication)**: 接続先サーバーが本物だと証明書で確認（mTLS なら相手側も）

## TLS 1.3 の改善点

- **ハンドシェイク 1-RTT**（0-RTT も可能）: 体感速度の向上
- **古い暗号スイートを大量削除**: RC4, MD5, SHA-1, 静的RSA鍵交換などを排除
- **PFS (Perfect Forward Secrecy) 必須**: 過去通信を遡って復号できない
- **HKDF ベースの鍵導出**: 鍵スケジュールを明確化

## ハンドシェイクの概要

1. **ClientHello**: 対応する暗号スイート・拡張・乱数を送信
2. **ServerHello + Certificate + KeyShare**: サーバー証明書、鍵交換素材
3. **Finished**: 双方が鍵を確定し、以降は対称鍵で暗号化

詳細は [[TLSの仕組み]] 参照。

## 証明書

- **CA (Certificate Authority)** が発行する X.509 証明書をサーバーに配備
- **公開鍵基盤 (PKI)** の信頼チェーン: ルートCA → 中間CA → サーバー証明書
- **Let's Encrypt** がACMEで自動化したことで、TLS化が一般化
- **mTLS (Mutual TLS)**: クライアント側も証明書を提示する強い認証。サービスメッシュ (Istio/Linkerd) で多用

## 攻撃と対策

- **Heartbleed (CVE-2014-0160)**: OpenSSL 実装バグ → 全クライアントが影響
- **POODLE (SSL 3.0)**: 旧仕様の脆弱性
- **BEAST/CRIME/BREACH**: 圧縮・CBCモードの問題 → TLS 1.3 で大半が解決
- **ダウングレード攻撃**: 古いプロトコルへの引き戻し → TLS 1.3 + HSTS で防ぐ
- **証明書ピン留め (HPKP/Certificate Pinning)**: アプリ側で証明書を固定して中間者を防ぐ

## モダンな構成 (2026年現在)

- **最小プロトコル**: TLS 1.2 (1.3 推奨、TLS 1.0/1.1 は廃止)
- **暗号スイート**: ECDHE + AES-GCM / ChaCha20-Poly1305
- **HSTS**: 1年以上の `max-age`、`includeSubDomains`、`preload`
- **OCSP Stapling**: 失効確認の高速化
- **証明書透明性 (CT)**: 不正発行の検出

## OWASP との関係

[[A02 Cryptographic Failures]] に直結。HTTP通信、古いTLS、自己署名証明書の無検査、混在コンテンツなどがアプリ脆弱性として頻出。

## 出典

- RFC 8446 (TLS 1.3): https://datatracker.ietf.org/doc/html/rfc8446
- Mozilla SSL Configuration Generator: https://ssl-config.mozilla.org/
- SSL Labs: https://www.ssllabs.com/ssltest/

## 関連MOC

- [[MOC Security]]

## 関連ノート

- [[TLSの仕組み]]
- [[A02 Cryptographic Failures]]
- [[暗号の基礎]]
- [[認証と認可]]
- [[OWASP Top 10]]

---

> [!info] このノートは empty-note-filler により自動生成されました（2026-05-14）。レビュー・加筆・修正をお願いします。出典の確認も推奨。
