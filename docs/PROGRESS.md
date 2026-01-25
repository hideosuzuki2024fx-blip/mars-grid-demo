# 開発進捗（実装済み / 動作確認ベース）

## 実装済みページ（/v1）
- Join：参加（Handle作成）
- Map：全グリッド表示・選択パネル・出品中表示
- My Grids：自分の区画表示・命名（Save）
- Market：出品（List）・購入（Buy）
- Admin：Allocate（配布）などの管理系

## 実装済みAPI（/api/v1）
- GET /api/v1/me：ユーザー情報 + 所持区画
- GET /api/v1/grids：全グリッド取得（owner/name/locked）
- PATCH /api/v1/grids/[gridId]/name：命名保存
- GET /api/v1/market：出品一覧
- POST /api/v1/market/list：出品（出品中ロック）
- POST /api/v1/market/buy：購入（所有権移動）

## UX改善（実装済み）
- Mapセルの大型化、ズーム切替（1x/1.5x/2x）
- 自分の区画を別色＆★で強調
- 出品中区画をマップ上で強調（枠＋ラベル表示）
- クリックした区画の「売値/売主」をSelectedに表示
- MapからそのままBuy可能（Selected内）
- 常設ステータス表示（Handle / Balance / Grids）
  - 10秒ごとの自動更新
  - iframe埋め込み用に embed=1 で非表示対応

## 既知の制約（現状）
- 取得価格（購入原価）は保存していないため表示できない
  - 取得価格を出すには「取引履歴テーブル」等が必要
## 2026-01-25 23:37:24
- commit: ca3850c
- change: /v1 配下のナビを layout に集約し、Map の gridParamId 未定義エラーを解消（useGridParam 呼び出しを補正）
- note: terminal_log.txt はローカルログとして保持（Git 管理外）
