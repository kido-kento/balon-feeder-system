# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語設定

**重要**: このプロジェクトでは、Claude Codeとのやり取りは**日本語**で行ってください。コード内のコメント、ドキュメント、コミットメッセージ、およびClaude Codeとの会話はすべて日本語を使用します。

## プロジェクト概要

Next.js (フロントエンド) + Laravel (バックエンド) + Docker で構築する予約管理システム。

## 技術スタック

- **フロントエンド**: Next.js 14.2 (App Router), React 18, TypeScript, Tailwind CSS
- **バックエンド**: Laravel 12, PHP 8.3
- **インフラ**: Docker Compose, MySQL 8.0, Nginx, Mailhog

## アーキテクチャ

### Docker構成

このプロジェクトは完全にDockerコンテナ化されています：

- **frontend** (reservation-frontend): Next.js 開発サーバー (ポート 3000)
- **backend** (reservation-backend): Laravel アプリケーション
- **nginx** (reservation-nginx): Laravel へのリバースプロキシ (ポート 8000)
- **mysql** (reservation-mysql): MySQL 8.0 データベース (ポート 3307)
- **mailhog** (reservation-mailhog): 開発環境でのメール送信テスト用 (SMTP: 1025, UI: 8025)

すべてのサービスは `reservation-network` ブリッジネットワークで接続されています。

### API通信

フロントエンドは環境変数 `NEXT_PUBLIC_API_URL=http://localhost:8000/api` を使用してバックエンドAPIと通信します。

**重要な設定**:
- **APIルーティング**: `backend/routes/api.php` で定義されたルートは自動的に `/api` プレフィックスが付与される
- **CORS設定**: `backend/config/cors.php` でフロントエンド（localhost:3000）からのアクセスを許可
- **ヘルスチェック**: `/api/health` エンドポイントでバックエンドの動作確認が可能

## 開発コマンド

### 環境の起動と確認

```bash
# 1. コンテナ起動
docker compose up -d

# 2. バックエンドの動作確認（ヘルスチェック）
curl http://localhost:8000/api/health
# または、ブラウザで http://localhost:8000/api/health にアクセス

# 3. フロントエンドの確認
# ブラウザで http://localhost:3000 にアクセス

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
docker compose exec mysql mysql -u reservation_user -preservation_pass reservation_db

# データベース設定
# - データベース名: reservation_db
# - ユーザー名: reservation_user
# - パスワード: reservation_pass
# - ルートパスワード: root_password
```

### メール送信テスト

開発環境では Mailhog を使用してメール送信をテストできます：
- Web UI: http://localhost:8025
- SMTP: localhost:1025

## プロジェクト構造

```
reservation-system/
├── .claude/                    # Claude Code 関連ファイル
│   ├── config.json            # プロジェクト固有のパーミッション設定
│   ├── TODO.md                # 環境構築の改善TODO（優先度順）
│   ├── DEVELOPMENT_NOTES.md   # 開発中の重要な概念や質問への回答
│   ├── settings.json          # VS Code推奨設定（テンプレート）
│   ├── editorconfig           # EditorConfig設定（テンプレート）
│   └── prettierrc.json        # Prettier設定（テンプレート）
├── frontend/                  # Next.js App Router アプリケーション
│   ├── app/                  # App Router（ページとレイアウト）
│   ├── components/           # 共有Reactコンポーネント（現在は空）
│   └── Dockerfile
├── backend/                  # Laravel アプリケーション
│   ├── app/
│   │   ├── Models/           # Eloquent モデル
│   │   ├── Http/Controllers/
│   │   └── Providers/
│   ├── routes/
│   │   ├── api.php          # APIルート（/api プレフィックス）
│   │   └── web.php          # Webルート
│   ├── config/
│   │   └── cors.php         # CORS設定（localhost:3000を許可）
│   ├── bootstrap/
│   │   └── app.php          # アプリケーション設定（APIルーティング有効化）
│   ├── database/
│   │   └── migrations/      # データベースマイグレーション
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

- **ルートの `.env`**: Docker Compose用（存在する場合）
- **`backend/.env`**: Laravel設定（データベース接続、メール設定など）
- **`frontend/.env.local`**: Next.js環境変数（現在はdocker-compose.ymlで設定）

注: フロントエンドの環境変数は現在 `docker-compose.yml` に記載されています。Docker以外の環境で実行する場合は `frontend/.env.local.example` をコピーして使用してください。

### ポート構成

| サービス | ホストポート | 用途 |
|---------|-------------|------|
| frontend | 3000 | Next.js |
| nginx | 8000 | Laravel API |
| mysql | 3307 | MySQL |
| mailhog UI | 8025 | メール確認画面 |
| mailhog SMTP | 1025 | メール送信 |

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

## 開発参考資料

プロジェクト内の重要なドキュメント：

- **`.claude/TODO.md`**: 環境構築の改善TODO（優先度順）
- **`.claude/DEVELOPMENT_NOTES.md`**: 開発中の重要な概念や質問への回答（APIルーティング、CORSなど）
- **`.claude/config.json`**: プロジェクト固有のパーミッション設定

## トラブルシューティング

### APIが404エラーを返す

1. APIルーティングが正しく設定されているか確認: `backend/bootstrap/app.php`
2. ルートが定義されているか確認: `backend/routes/api.php`
3. キャッシュクリア: `docker compose exec backend php artisan route:clear`

### CORSエラーが発生する

1. CORS設定を確認: `backend/config/cors.php`
2. フロントエンドのオリジン（localhost:3000）が許可リストに含まれているか確認
3. CORSミドルウェアが有効化されているか確認: `backend/bootstrap/app.php`

### コンテナが起動しない

1. ポートの競合を確認: `docker compose ps`
2. ログを確認: `docker compose logs -f [service-name]`
3. コンテナを再ビルド: `docker compose down && docker compose build --no-cache && docker compose up -d`
