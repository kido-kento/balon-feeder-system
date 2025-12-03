# 予約システム

Next.js + Laravel + Docker で構築する予約管理システムの開発環境

## 技術スタック

### フロントエンド
- **Next.js 14.2** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**

### バックエンド
- **Laravel 12**
- **PHP 8.3**

### インフラ
- **Docker & Docker Compose**
- **MySQL 8.0**
- **Nginx**
- **Mailhog** (開発環境でのメール送信テスト用)

## プロジェクト構成

```
reservation-system/
├── frontend/              # Next.jsアプリケーション
│   ├── app/              # App Router
│   ├── components/       # Reactコンポーネント
│   ├── Dockerfile
│   └── package.json
├── backend/              # Laravelアプリケーション
│   ├── app/
│   ├── routes/
│   ├── database/
│   ├── Dockerfile
│   └── composer.json
├── docker/
│   └── nginx/           # Nginx設定ファイル
├── docker-compose.yml   # Docker構成
├── .env                 # 環境変数
└── README.md
```

## セットアップ手順

### 1. リポジトリのクローン（または既存プロジェクトへの移動）

```bash
cd reservation-system
```

### 2. 環境変数の設定

#### バックエンド（Laravel）

```bash
# .env.example を .env にコピー
cp backend/.env.example backend/.env

# Application Key を生成（重要！）
docker compose exec backend php artisan key:generate
```

**Application Key とは？**
Laravelがセッションやパスワードなどの重要なデータを暗号化するための秘密鍵です。この手順を忘れるとアプリケーションが正常に動作しません。

#### フロントエンド（Next.js）

```bash
# .env.local.example を .env.local にコピー
cp frontend/.env.local.example frontend/.env.local
```

**環境変数とは？**
アプリケーションの動作に必要な設定値（APIのURLなど）を、環境ごとに変更できるようにする仕組みです。

### 3. Docker環境の起動

```bash
docker compose up -d
```

初回起動時は、イメージのビルドに時間がかかります。

### 4. サービスの確認

起動後、以下のURLでアクセスできます：

- **フロントエンド (Next.js)**: http://localhost:3000
- **バックエンド (Laravel API)**: http://localhost:8000
- **Mailhog (メールUI)**: http://localhost:8025

### 5. データベースマイグレーション（必要な場合）

```bash
docker compose exec backend php artisan migrate
```

## 開発コマンド

### Docker環境の管理

```bash
# コンテナの起動
docker compose up -d

# コンテナの停止
docker compose down

# ログの確認
docker compose logs -f

# 特定のサービスのログ
docker compose logs -f frontend
docker compose logs -f backend
```

### フロントエンド開発

```bash
# Next.jsコンテナ内でコマンド実行
docker compose exec frontend npm run dev

# 依存関係の追加
docker compose exec frontend npm install [パッケージ名]
```

### バックエンド開発

```bash
# Laravelコンテナ内でコマンド実行
docker compose exec backend php artisan [コマンド]

# Composerパッケージの追加
docker compose exec backend composer require [パッケージ名]

# マイグレーションの実行
docker compose exec backend php artisan migrate

# Tinkerの起動
docker compose exec backend php artisan tinker
```

### データベース

```bash
# MySQLコンテナに接続
docker compose exec mysql mysql -u reservation_user -preservation_pass reservation_db
```

## 環境変数

### ルート `.env` ファイル
Docker Compose で使用する環境変数を定義

### `backend/.env` ファイル
Laravel アプリケーションの設定
- データベース接続設定（MySQL）
- メール設定（Mailhog）

## ポート構成

| サービス | ホストポート | コンテナポート | 用途 |
|---------|-------------|---------------|------|
| frontend | 3000 | 3000 | Next.js開発サーバー |
| nginx | 8000 | 80 | Laravel APIエンドポイント |
| mysql | 3307 | 3306 | MySQLデータベース |
| mailhog (SMTP) | 1025 | 1025 | メール送信 |
| mailhog (UI) | 8025 | 8025 | メール管理画面 |

## トラブルシューティング

### ポートが既に使用されている場合

他のアプリケーションがポートを使用している場合は、`docker-compose.yml` のポート設定を変更してください。

### コンテナのリビルド

変更が反映されない場合は、コンテナを再ビルドします：

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 依存関係の再インストール

```bash
# フロントエンド
docker compose exec frontend rm -rf node_modules package-lock.json
docker compose exec frontend npm install

# バックエンド
docker compose exec backend rm -rf vendor composer.lock
docker compose exec backend composer install
```

## 次のステップ

環境構築が完了したら、以下の開発を進めることができます：

1. データベース設計とマイグレーションファイルの作成
2. Laravel API エンドポイントの実装
3. Next.js でのページとコンポーネント作成
4. 認証システムの実装
5. 予約機能の実装

## ライセンス

未定
