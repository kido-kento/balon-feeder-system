# 🐾 バロンご飯管理システム（Balon Feeder System）

**バロン（飼い猫）** の給餌記録を一瞬で登録・確認できるミニシステム。

- **ワンタップ給餌記録**: iPhoneショートカットから瞬時に記録
- **AM 4:00起点カウント**: 深夜4時を境に「今日」をカウント（生活リズムに合わせた設計）
- **リアルタイム表示**: 今日の給餌回数と最新給餌時刻を即座に確認
- **履歴保存**: MySQLデータベースで全記録を永続化
- **リセット機能**: 誤記録時に今日分をまとめてリセット可能

実生活で"すぐ使える"ことを最優先にデザインしたシステムです。

---

## 🚀 技術スタック

### フロントエンド
- **Next.js 14.2** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**

### バックエンド
- **Laravel 12**
- **PHP 8.3**
- **MySQL 8.0**

### インフラ
- **Docker / Docker Compose**
- **Nginx** (Laravelへのリバースプロキシ)
- **Mailhog** (開発用メールテスト)

---

## 📁 プロジェクト構成

```
balon-feeder-system/
├── frontend/              # Next.js (給餌記録UI)
│   ├── app/
│   │   └── feeding/      # 給餌記録画面 (/feeding)
│   ├── Dockerfile
│   └── package.json
├── backend/               # Laravel (給餌記録API)
│   ├── app/
│   │   └── Http/Controllers/
│   │       └── FeedingController.php
│   ├── database/
│   │   └── migrations/
│   │       └── 2025_12_01_*_create_feedings_table.php
│   ├── routes/
│   │   └── api.php
│   ├── Dockerfile
│   └── composer.json
├── docker/
│   └── nginx/
│       └── default.conf
├── docker-compose.yml
├── README.md
└── CLAUDE.md
```

---

## ⚙️ セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/kido-kento/balon-feeder-system.git
cd balon-feeder-system
```

### 2. 環境変数をセット

#### バックエンド（Laravel）

```bash
cp backend/.env.example backend/.env
```

**`.env`の重要な設定値（すでにdocker-compose.ymlと同期済み）**:
- `DB_DATABASE=balon_db`
- `DB_USERNAME=balon_user`
- `DB_PASSWORD=balon_pass`
- `DB_HOST=mysql`

#### Laravelアプリケーションキーの生成

```bash
docker compose up -d
docker compose exec backend php artisan key:generate
```

#### フロントエンド（Next.js）

現在はdocker-compose.ymlに環境変数を直接記載しています。
Docker以外の環境で実行する場合は以下を作成：

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8100/api
```

### 3. Docker起動

```bash
docker compose up -d
```

### 4. データベースマイグレーション

```bash
docker compose exec backend php artisan migrate
```

### 5. 動作確認

#### APIヘルスチェック

```bash
curl http://localhost:8100/api/health
```

または、ブラウザで `http://localhost:8100/api/health` にアクセス。

#### フロントエンド（給餌記録画面）

ブラウザで以下にアクセス:
**http://localhost:3100/feeding**

---

## 📝 API仕様

### 1. 今日の給餌状況を取得

```
GET http://localhost:8100/api/feeding/today
```

**レスポンス例**:
```json
{
  "count": 4,
  "latest": "2025-12-01 22:28:32",
  "limit": 6
}
```

- `count`: 今日の給餌回数（AM 4:00起点）
- `latest`: 最新の給餌時刻
- `limit`: 1日の推奨上限回数

### 2. 給餌記録を追加

```
POST http://localhost:8100/api/feeding
```

**レスポンス例**:
```json
{
  "message": "Feeding recorded successfully",
  "count": 5,
  "latest": "2025-12-01 23:15:10",
  "limit": 6
}
```

### 3. 今日の記録をリセット

```
GET http://localhost:8100/api/feeding/reset-today
```

**レスポンス例**:
```json
{
  "message": "Today feedings reset successfully"
}
```

---

## 🧪 開発コマンド一覧

### Docker

```bash
# コンテナ起動
docker compose up -d

# コンテナ停止
docker compose down

# ログ確認
docker compose logs -f

# 特定のサービスのログ
docker compose logs -f frontend
docker compose logs -f backend
```

### フロントエンド（Next.js）

```bash
# 開発サーバー起動（自動起動されるが手動実行も可能）
docker compose exec frontend npm run dev

# ビルド
docker compose exec frontend npm run build

# Lint実行
docker compose exec frontend npm run lint

# パッケージ追加
docker compose exec frontend npm install パッケージ名

# 依存関係再インストール
docker compose exec frontend rm -rf node_modules package-lock.json
docker compose exec frontend npm install
```

### バックエンド（Laravel）

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
docker compose exec backend composer require パッケージ名

# キャッシュクリア
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:clear
```

### データベース

```bash
# MySQL接続
docker compose exec mysql mysql -u balon_user -pbalon_pass balon_db
```

**データベース設定**:
- データベース名: `balon_db`
- ユーザー名: `balon_user`
- パスワード: `balon_pass`
- ルートパスワード: `root_password`

---

## 📌 ポート構成（バロン専用）

| サービス | ホストポート | コンテナポート | 説明 |
|---------|-------------|---------------|------|
| frontend | 3100 | 3000 | Next.js（給餌UI） |
| nginx | 8100 | 80 | Laravel API |
| mysql | 3338 | 3306 | MySQL |
| mailhog UI | 8125 | 8025 | メール確認画面 |
| mailhog SMTP | 1125 | 1025 | SMTP |

**注**: 他の予約システムプロジェクト（ポート 3000, 8000, 3307 など）との衝突を避けるため、バロン専用のポート番号を使用しています。

---

## 🔧 トラブルシューティング

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

### APIが404エラーを返す

1. APIルーティングが設定されているか確認: `backend/bootstrap/app.php`
2. ルートが定義されているか確認: `backend/routes/api.php`
3. キャッシュクリア: `docker compose exec backend php artisan route:clear`

### CORSエラーが発生する

1. CORS設定を確認: `backend/config/cors.php`
2. フロントエンドのオリジン（`localhost:3100`）が許可リストに含まれているか確認

---

## 📱 iPhoneショートカット連携

このシステムは、iPhoneの「ショートカット」アプリから以下のようなHTTPリクエストを送信することで、ワンタップで給餌記録が可能です。

### ショートカット設定例

1. ショートカットアプリで「新規ショートカット」を作成
2. 「URLの内容を取得」アクションを追加
3. 以下を設定:
   - **URL**: `http://あなたのサーバーIP:8100/api/feeding`
   - **メソッド**: POST
4. 「結果を通知」アクションを追加（任意）

ホーム画面にウィジェットとして配置すれば、ワンタップで給餌記録完了です。

---

## 🎯 次のステップ

- [ ] iPhoneショートカットの実装とテスト
- [ ] 給餌履歴を表示するページの追加
- [ ] グラフで給餌傾向を可視化
- [ ] 通知機能（給餌忘れアラート）
- [ ] バロンの写真ギャラリー機能

---

## 📄 ライセンス

MIT License

---

## 🐱 バロンについて

バロンは我が家の大切な飼い猫です。このシステムは彼の健康管理のために作られました。
