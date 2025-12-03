# 🐾 バロンご飯回数システム（Balon Feeder System）

**Balon（バロン）** の給餌記録を  
**一瞬で登録・確認できる** ミニシステムです。

Next.js（フロント） + Laravel（API） + Docker で構築。

- iPhone ショートカットで「ワンタップ給餌」
- 今日の給餌回数を AM 2:00 起点で自動カウント
- 最新給餌時刻が UI にリアルタイム反映
- DB で履歴を保存し、どこからでも確認可能

実生活で“すぐ使える”ことを最優先にデザインしたシステム。

---

## 🚀 技術スタック

### フロントエンド
- Next.js 14.2（App Router）
- React 18
- TypeScript
- Tailwind CSS

### バックエンド
- Laravel 12
- PHP 8.3

### インフラ
- Docker / Docker Compose
- MySQL 8.0
- Nginx
- Mailhog（開発用メールUI）

---

## 📁 プロジェクト構成

```
balon-feeder-system/
├── frontend/              # Next.js（UI）
│   ├── app/
│   ├── Dockerfile
│   └── package.json
├── backend/               # Laravel（API）
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── Dockerfile
│   └── composer.json
├── docker/
│   └── nginx/
├── docker-compose.yml
└── README.md
```

---

## ⚙️ セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/kido-kento/balon-feeder-system.git
cd balon-feeder-system

2. 環境変数をセット

バックエンド（Laravel）

cp backend/.env.example backend/.env
docker compose exec backend php artisan key:generate

フロントエンド（Next.js）

cp frontend/.env.local.example frontend/.env.local
```
NEXT_PUBLIC_API_URL の例：
http://localhost:8100/api

🐬 Docker 起動
docker compose up -d

🌐 動作確認

フロント（給餌 UI）

http://localhost:3100/feeding

API（Laravel）
	•	今日の集計
GET http://localhost:8100/api/feeding/today
	•	給餌記録
POST http://localhost:8100/api/feeding

Mailhog（開発用メールUI）

http://localhost:8125

📝 API レスポンス例
{
  "count": 4,
  "latest": "2025-12-01 22:28:32",
  "limit": 6
}

🧪 開発コマンド一覧
Docker

docker compose up -d
docker compose down
docker compose logs -f

フロント（Next.js）

docker compose exec frontend npm run dev
docker compose exec frontend npm install

バックエンド（Laravel）

docker compose exec backend php artisan migrate
docker compose exec backend php artisan tinker
docker compose exec backend composer require package/name

📌 ポート構成（バロン専用）
サービス
ホスト
コンテナ
説明
frontend
3100
3000
Next.js（UI）
API（nginx）
8100
80
Laravel API
mysql
3338
3306
MySQL
mailhog UI
8125
8025
メール確認
mailhog SMTP
1125
1025
SMTP



--------------------------------------------------------------------


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
