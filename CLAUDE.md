# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語設定

**重要**: このプロジェクトでは、Claude Codeとのやり取りは**日本語**で行ってください。コード内のコメント、ドキュメント、コミットメッセージ、およびClaude Codeとの会話はすべて日本語を使用します。

## プロジェクト概要

**バロン（飼い猫）のご飯管理システム** - Next.js (フロントエンド) + Laravel (バックエンド) + Docker で構築。

### システムの特徴

- **ワンタップ給餌記録**: iPhoneショートカットから瞬時に記録
- **AM 4:00起点カウント**: 深夜4時を境に「今日」をカウント（生活リズムに合わせた設計）
- **リアルタイム表示**: 今日の給餌回数と最新給餌時刻を即座に確認
- **履歴保存**: MySQLデータベースで全記録を永続化
- **リセット機能**: 誤記録時に今日分をまとめてリセット可能

### 開発背景

このプロジェクトは予約システムの環境を丸コピーして作成されました。そのため、一部のコメントやファイル名に「reservation（予約）」という文言が残っている場合がありますが、**実際はバロン（飼い猫）のご飯管理システム**です。

## 技術スタック

- **フロントエンド**: Next.js 14.2 (App Router), React 18, TypeScript, Tailwind CSS
- **バックエンド**: Laravel 12, PHP 8.3
- **インフラ**: Docker Compose, MySQL 8.0, Nginx, Mailhog

## アーキテクチャ

### Docker構成

このプロジェクトは完全にDockerコンテナ化されています：

- **nginx** (balon-nginx): **すべてのアクセスの入り口** (ホストポート: 8100)
  - `/` → フロントエンド（Next.js）にプロキシ
  - `/api/` → バックエンド（Laravel）にプロキシ
- **frontend** (balon-frontend): Next.js 開発サーバー (コンテナ内ポート: 3000)
- **backend** (balon-backend): Laravel アプリケーション (コンテナ内ポート: 9000)
- **mysql** (balon-mysql): MySQL 8.0 データベース (ホストポート: 3338)
- **mailhog** (balon-mailhog): 開発環境でのメール送信テスト用 (SMTP: 1125, UI: 8125)

すべてのサービスは `balon-network` ブリッジネットワークで接続されています。

**重要**:
- **アクセスURLは http://localhost:8100/ のみ**
- フロントエンド・バックエンドの両方がNginx経由で提供されます
- ポート3100は使用しません（予約システムとの衝突回避のため設定されていますが、実際には使用していません）

### Nginxのルーティング

`docker/nginx/default.conf` で以下のように設定：

1. **`/`** → Next.jsフロントエンド（`frontend:3000`）
2. **`/api/`** → Laravelバックエンド（`backend:9000`）

この構成により、**http://localhost:8100/** で全機能にアクセスできます。

### API通信

フロントエンドは **相対パス `/api`** を使用してバックエンドAPIと通信します（同じNginx経由のため）。

**重要な設定**:
- **APIルーティング**: `backend/routes/api.php` で定義されたルートは自動的に `/api` プレフィックスが付与される
- **CORS設定**: Nginx で全面許可（iPhone Safari対策）
- **ヘルスチェック**: http://localhost:8100/api/health でバックエンドの動作確認が可能

### 給餌システムの実装詳細

#### データベーステーブル

`feedings` テーブル（`backend/database/migrations/2025_12_01_*_create_feedings_table.php`）:
- `id`: 主キー
- `feeding_time`: 給餌時刻（DateTime）
- `amount`: 給餌量（デフォルト10g）
- `created_at` / `updated_at`: タイムスタンプ

#### APIエンドポイント

実装場所: `backend/app/Http/Controllers/FeedingController.php`

1. **`GET /api/feeding/today`**: 今日の給餌状況を取得（AM 4:00起点）
   ```json
   {
     "count": 4,
     "latest": "2025-12-01 22:28:32",
     "limit": 6
   }
   ```

2. **`POST /api/feeding`**: 給餌記録を追加
   - 現在時刻で1件レコードを追加
   - 今日分の集計を返す

3. **`GET /api/feeding/reset-today`**: 今日の記録をリセット
   - AM 4:00起点で今日分のレコードを全削除

#### フロントエンド実装

給餌記録画面: `frontend/app/feeding/page.tsx`
- 今日の給餌回数と最新給餌時刻をリアルタイム表示
- 「ご飯あげた！」ボタンで即座に記録
- 「今日の記録をリセット」ボタンで誤記録を修正

#### AM 4:00起点の実装ロジック

`FeedingController::getTodayStart()` メソッド:
```php
// 今日の 4:00
$start = Carbon::today()->addHours(4);

// 今が 4:00 より前なら「前日の4:00」からを今日扱い
if ($now->hour < 4) {
    $start = Carbon::yesterday()->addHours(4);
}
```

このロジックにより、深夜0時〜4時の給餌は「前日分」として扱われます。

## 開発コマンド

### 環境の起動と確認

```bash
# 1. コンテナ起動
docker compose up -d

# 2. 動作確認
# ブラウザで http://localhost:8100/ にアクセス

# バックエンドAPIのヘルスチェック
curl http://localhost:8100/api/health

# 給餌記録画面
# http://localhost:8100/feeding

# ログ確認
docker compose logs -f [service-name]

# コンテナ停止
docker compose down

# コンテナ再ビルド（変更が反映されない場合）
docker compose down
docker compose build --no-cache
docker compose up -d
```

### フロントエンド開発

```bash
# 開発サーバーは自動起動（docker composeでコンテナ起動時）
# 手動で起動する場合:
docker compose exec frontend npm run dev

# ビルド
docker compose exec frontend npm run build

# Lint実行
docker compose exec frontend npm run lint

# パッケージ追加
docker compose exec frontend npm install [パッケージ名]

# 依存関係再インストール
docker compose exec frontend rm -rf node_modules package-lock.json
docker compose exec frontend npm install
```

注: `package.json` の `dev` スクリプトは `WATCHPACK_POLLING=true` を使用して、Dockerボリューム内でのホットリロードを有効にしています。

### バックエンド開発

```bash
# マイグレーション実行
docker compose exec backend php artisan migrate

# マイグレーションロールバック
docker compose exec backend php artisan migrate:rollback

# Tinker起動（Laravel REPL）
docker compose exec backend php artisan tinker

# テスト実行（PHPUnit）
docker compose exec backend php artisan test

# コードフォーマット（Laravel Pint）
docker compose exec backend ./vendor/bin/pint

# Composerパッケージ追加
docker compose exec backend composer require [パッケージ名]

# 依存関係再インストール
docker compose exec backend rm -rf vendor composer.lock
docker compose exec backend composer install

# キャッシュクリア
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:clear
docker compose exec backend php artisan view:clear
```

### データベース操作

```bash
# MySQL接続
docker compose exec mysql mysql -u balon_user -pbalon_pass balon_db

# データベース設定
# - データベース名: balon_db
# - ユーザー名: balon_user
# - パスワード: balon_pass
# - ルートパスワード: root_password
```

### メール送信テスト

開発環境では Mailhog を使用してメール送信をテストできます：
- Web UI: http://localhost:8125
- SMTP: localhost:1125

## プロジェクト構造

```
balon-feeder-system/
├── .claude/                    # Claude Code 関連ファイル
│   ├── config.json            # プロジェクト固有のパーミッション設定
│   ├── TODO.md                # 環境構築の改善TODO（優先度順）
│   ├── DEVELOPMENT_NOTES.md   # 開発中の重要な概念や質問への回答
│   ├── settings.json          # VS Code推奨設定（テンプレート）
│   ├── editorconfig           # EditorConfig設定（テンプレート）
│   └── prettierrc.json        # Prettier設定（テンプレート）
├── frontend/                  # Next.js App Router アプリケーション
│   ├── app/
│   │   ├── feeding/          # 給餌記録画面 (/feeding)
│   │   │   └── page.tsx     # メイン給餌記録UI
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── Dockerfile
├── backend/                  # Laravel アプリケーション
│   ├── app/
│   │   ├── Models/           # Eloquent モデル
│   │   ├── Http/Controllers/
│   │   │   └── FeedingController.php  # 給餌記録API（重要）
│   │   └── Providers/
│   ├── routes/
│   │   ├── api.php          # APIルート（/api プレフィックス）
│   │   └── web.php          # Webルート
│   ├── config/
│   │   └── cors.php         # CORS設定（localhost:3100を許可）
│   ├── bootstrap/
│   │   └── app.php          # アプリケーション設定（APIルーティング有効化）
│   ├── database/
│   │   └── migrations/      # データベースマイグレーション
│   │       └── 2025_12_01_*_create_feedings_table.php  # feedingsテーブル
│   ├── tests/               # PHPUnit テスト
│   └── Dockerfile
└── docker/
    └── nginx/               # Nginx設定ファイル
```

## コーディング規約

### フロントエンド（Next.js + TypeScript）

- App Router を使用
- TypeScript で厳格な型定義を実施
- Tailwind CSS でスタイリング
- ESLint（Next.js標準設定）に準拠

### バックエンド（Laravel）

- Laravel 12 の規約に従う
- PSR-4 オートローディング
- Laravel Pint でコードフォーマット
- PHPUnit でテスト作成

## 重要な設定

### 環境変数

- **`backend/.env`**: Laravel設定（データベース接続、メール設定など）
  - データベース: balon_db / balon_user / balon_pass
- **フロントエンド環境変数**: 現在は `docker-compose.yml` に直接記載
  - `NEXT_PUBLIC_API_URL=http://localhost:8100/api`

注: Docker以外の環境で実行する場合は `frontend/.env.local` を作成してください（現在はexampleファイルは未作成）。

### ポート構成

| サービス | ホストポート | コンテナポート | 用途 |
|---------|-------------|---------------|------|
| frontend | 3100 | 3000 | Next.js（給餌UI） |
| nginx | 8100 | 80 | Laravel API |
| mysql | 3338 | 3306 | MySQL |
| mailhog UI | 8125 | 8025 | メール確認画面 |
| mailhog SMTP | 1125 | 1025 | メール送信 |

**注**: 他の予約システムプロジェクト（ポート 3000, 8000, 3307 など）との衝突を避けるため、バロン専用のポート番号を使用しています。

## テスト実行

### フロントエンド

現在、テストフレームワークは未設定です。

### バックエンド

```bash
# すべてのテスト実行
docker compose exec backend php artisan test

# 特定のテストファイル実行
docker compose exec backend php artisan test --filter=ExampleTest

# コードカバレッジ付きで実行
docker compose exec backend php artisan test --coverage
```

## 開発時の注意事項

### 予約システムの名残について

このプロジェクトは予約システムの環境を丸コピーして作成されたため、以下のような名残があります：

- `backend/routes/api.php` のコメントに「予約システムのAPIルート」という記述
- 一部のコメントやドキュメントに「reservation」という単語

これらは**給餌管理システムとしての動作には影響しません**が、コードをクリーンアップする際は適宜修正してください。

### AM 4:00起点の理由

バロンの飼い主の生活リズムに合わせて、深夜4時を「1日の区切り」としています。これにより、深夜0時〜4時に給餌しても「前日分」として記録され、実際の生活感覚と一致します。

## トラブルシューティング

### APIが404エラーを返す

1. APIルーティングが正しく設定されているか確認: `backend/bootstrap/app.php`
2. ルートが定義されているか確認: `backend/routes/api.php`
3. キャッシュクリア: `docker compose exec backend php artisan route:clear`

### CORSエラーが発生する

1. CORS設定を確認: `backend/config/cors.php`
2. フロントエンドのオリジン（localhost:3100）が許可リストに含まれているか確認
3. CORSミドルウェアが有効化されているか確認: `backend/bootstrap/app.php`

### コンテナが起動しない

1. ポートの競合を確認: `docker compose ps`
2. ログを確認: `docker compose logs -f [service-name]`
3. コンテナを再ビルド: `docker compose down && docker compose build --no-cache && docker compose up -d`

### データベース接続エラー

1. MySQL コンテナが起動しているか確認: `docker compose ps`
2. `.env` のデータベース設定を確認（balon_db / balon_user / balon_pass）
3. マイグレーションが実行されているか確認: `docker compose exec backend php artisan migrate`

## 今後の開発方向性

- **iPhoneショートカット連携**: Siriから「バロンにご飯」で記録完了
- **給餌履歴画面**: 過去の給餌記録を一覧表示
- **グラフ機能**: 給餌傾向を可視化（Chart.js等）
- **通知機能**: 給餌忘れアラート
- **バロンの写真ギャラリー**: かわいい写真を記録

## 参考資料

プロジェクト内の重要なドキュメント：

- **`README.md`**: プロジェクト全体のセットアップガイド
- **`.claude/TODO.md`**: 環境構築の改善TODO（優先度順）
- **`.claude/DEVELOPMENT_NOTES.md`**: 開発中の重要な概念や質問への回答（APIルーティング、CORSなど）
- **`.claude/config.json`**: プロジェクト固有のパーミッション設定
