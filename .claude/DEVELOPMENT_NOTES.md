# 開発ノート

このファイルは開発中の重要な概念、決定事項、よくある質問への回答を記録します。

---

## API開発

### `/api/health` エンドポイントについて

**作成日**: 2025-11-21

#### 目的
バックエンド（Laravel API）が正常に動作しているか確認するためのヘルスチェックエンドポイント。

#### 何を確認できるか
- Dockerコンテナが起動しているか
- PHPが動作しているか
- Laravelアプリケーションが正しく起動しているか
- APIルーティングが機能しているか

#### 使用方法

**1. コマンドラインから確認**
```bash
# Dockerコンテナ起動
docker compose up -d

# ヘルスチェック実行
curl http://localhost:8000/api/health
```

**2. ブラウザから確認**
```
http://localhost:8000/api/health
```

**3. フロントエンド（Next.js）から確認**
```typescript
async function checkBackendConnection() {
  try {
    const response = await fetch('http://localhost:8000/api/health');
    const data = await response.json();

    if (data.status === 'ok') {
      console.log('✅ バックエンド接続OK');
    }
  } catch (error) {
    console.error('❌ バックエンドに接続できません', error);
  }
}
```

#### 正常時のレスポンス
```json
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "2025-11-21T10:30:00+00:00"
}
```

#### トラブルシューティング

| 状態 | 原因 | 対処法 |
|---|---|---|
| ✅ 200 OK | 正常動作 | - |
| ❌ 404 Not Found | APIルーティング未設定 | `backend/bootstrap/app.php` を確認 |
| ❌ 500 Internal Server Error | Laravel内部エラー | `docker compose logs backend` でログ確認 |
| ❌ 接続不可 (Connection refused) | コンテナ未起動 | `docker compose up -d` でコンテナ起動 |
| ❌ CORS エラー | CORS設定不足 | Laravel の CORS 設定を追加（次のタスク） |

#### いつ使うか
- 開発開始時にバックエンドの起動確認
- フロントエンド開発時の接続テスト
- 問題発生時の切り分け診断
- CI/CDパイプラインでのヘルスチェック

---

## Docker環境

### コンテナ起動・停止の基本

**コンテナ起動**
```bash
docker compose up -d
```

**コンテナ停止**
```bash
docker compose down
```

**ログ確認**
```bash
# 全サービスのログ
docker compose logs -f

# 特定サービスのログ
docker compose logs -f backend
docker compose logs -f frontend
```

**コンテナの状態確認**
```bash
docker compose ps
```

---

## よくある質問と回答

### Q: 環境変数とは何か？なぜ必要なのか？

**作成日**: 2025-11-21

#### 環境変数の基本概念

**環境変数** = アプリケーションが動作する「環境」ごとに変わる設定値

#### 例え話

カフェの店舗のようなものです：

```
渋谷店（開発環境）:
- 住所: http://localhost:3000
- バックエンドAPI: http://localhost:8000/api

新宿店（本番環境）:
- 住所: https://www.example.com
- バックエンドAPI: https://api.example.com
```

同じアプリケーション（カフェチェーン）でも、**場所によって設定が違う**。

#### なぜ環境変数が必要なのか？

**問題: コードに直接書くと困る**

❌ **悪い例**（コードに直接書く = ハードコード）:
```typescript
// frontend/app/page.tsx
const API_URL = 'http://localhost:8000/api'; // ハードコード

fetch(API_URL + '/health')
```

**問題点**:
1. 本番環境にデプロイすると動かない（URLが違うから）
2. 他の開発者の環境で動かない可能性がある
3. URLを変更するたびにコードを修正する必要がある

---

✅ **良い例**（環境変数を使う）:
```typescript
// frontend/app/page.tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL; // 環境変数

fetch(API_URL + '/health')
```

**メリット**:
1. 環境ごとにURLを変更できる
2. コードを変更せずに設定を変えられる
3. チーム全員が同じコードを使える

#### Next.jsでの環境変数

**ファイル**: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**重要なルール**:

1. **`NEXT_PUBLIC_` プレフィックスが必要**
   - ブラウザからアクセスできる環境変数には `NEXT_PUBLIC_` を付ける
   - これがないとブラウザから読み取れない

2. **`.env.local` は `.gitignore` に含まれる**
   - 各開発者が自分の環境に合わせて設定できる
   - Gitにコミットされない

3. **`.env.local.example` をテンプレートとして用意**
   - 新しい開発者がコピーして使える
   - Gitにコミットされる

#### このプロジェクトでの使い方

**セットアップ時（初回のみ）**:
```bash
# .env.local.example を .env.local にコピー
cp frontend/.env.local.example frontend/.env.local
```

**コードから使う**:
```typescript
// 環境変数を取得
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// APIを呼び出す
const response = await fetch(`${apiUrl}/health`);
```

#### 開発環境と本番環境の違い

| 環境 | ファイル | API URL |
|---|---|---|
| 開発環境 | `.env.local` | `http://localhost:8000/api` |
| 本番環境 | `.env.production` | `https://api.example.com` |

#### 現在の問題と解決

**問題**:
現在、`NEXT_PUBLIC_API_URL` は `docker-compose.yml` にハードコードされている。

**解決**:
`.env.local` ファイルを作成して、Next.jsの標準的な方法で管理する。

#### 重要な注意事項

1. **秘密情報は環境変数に入れない**
   - APIキーやパスワードは別の方法で管理
   - `NEXT_PUBLIC_` は**ブラウザから見える**ので注意

2. **`.env.local` は Gitにコミットしない**
   - `.gitignore` に含まれている
   - 各開発者が個別に設定

3. **変更後は再起動が必要**
   - 環境変数を変更したら、開発サーバーを再起動

### Q: なぜヘルスチェックエンドポイントが必要なのか？

A: バックエンドが正常に動いているかを**簡単に確認**するため。開発中に「APIが動かない」という問題が起きたとき、まずヘルスチェックで「バックエンド自体が動いているか」を確認できる。これにより問題の切り分けが早くなる。

### Q: APIルーティングとは？

A: Laravelで `/api/*` のURLにアクセスがあったときに、どのコードを実行するかを定義する仕組み。`backend/routes/api.php` に定義されたルートは、自動的に `/api` プレフィックスが付く。

例:
- `routes/api.php` に `Route::get('/health', ...)` と書く
- 実際のURLは `http://localhost:8000/api/health` になる

### Q: Application Key（アプリケーションキー）とは何か？

**作成日**: 2025-11-21

#### Application Keyの基本概念

**Laravel Application Key** = Laravelがデータを暗号化するための「秘密の鍵」

#### 何に使われるのか？

Laravelは以下のような重要なデータを暗号化する際にこのキーを使います：

1. **セッションデータ**（ログイン情報など）
2. **Cookie**（ブラウザに保存される情報）
3. **パスワードのリセットトークン**
4. **暗号化が必要な個人情報**

#### 例え話

家の**鍵**のようなものです：

```
Application Key = 家の鍵
暗号化されたデータ = 鍵がかかった金庫

鍵がないと：
❌ 金庫を開けられない（データを復号化できない）
❌ セッションが動かない
❌ Laravelアプリケーションが正常に動作しない
```

#### どこに保存されるか？

`backend/.env` ファイルの中：

```env
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

この `xxxxx...` の部分がランダムに生成された秘密の鍵です。

#### なぜ生成する必要があるのか？

新しいプロジェクトをセットアップする際、`.env.example` には `APP_KEY=` が**空**になっています。

**鍵がない状態では、Laravelアプリケーションは動きません。**

#### 生成方法

```bash
# 1. .env.example を .env にコピー
cp backend/.env.example backend/.env

# 2. Application Key を生成
docker compose exec backend php artisan key:generate
```

#### 実行結果

コマンドを実行すると、`.env` ファイルの `APP_KEY=` に自動的にランダムな鍵が設定されます：

```
Application key set successfully.
```

#### 確認方法

```bash
# APP_KEYが設定されているか確認
docker compose exec backend grep "APP_KEY=" .env
```

正しく設定されていれば、以下のような出力が表示されます：

```
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### いつ実行するか？

- 新しいプロジェクトのセットアップ時（初回のみ）
- `.env` ファイルを削除して再作成した場合
- `APP_KEY=` が空の場合

#### 重要な注意事項

1. **本番環境では絶対に変更しない**
   - 一度設定したキーを変更すると、既存の暗号化データが復号化できなくなる
   - すべてのユーザーがログアウトされる

2. **絶対に公開しない**
   - `.env` ファイルは `.gitignore` に含まれている
   - Gitにコミットしてはいけない

3. **チーム開発では個別に生成**
   - 各開発者が自分の環境で `php artisan key:generate` を実行する

上記内容の詳細説明

  現在の状況

  今、あなたの環境では：

  APP_KEY=base64:AxZwg1EccM5rX2l0JqNmqjfc1PWkq8lItWsLFLrbku0=

  このように、Application Keyは既に設定されています。

  だから、あなたは何もする必要がありません。

  ---
  「新しいプロジェクトのセットアップ時」とは？

  具体的なシナリオ

  シナリオ1: 別の人がこのプロジェクトをクローンした場合

  # 田中さんがGitHubからクローン
  git clone https://github.com/your-repo/reservation-system.git
  cd reservation-system

  この時、田中さんのPCには backend/.env
  ファイルが存在しません（.gitignore に含まれているため）。

  だから田中さんは以下の手順を実行する必要があります：

  # 1. .env.example をコピー
  cp backend/.env.example backend/.env

  # 2. Application Key を生成
  docker compose exec backend php artisan key:generate

  シナリオ2: あなたが新しいプロジェクトを始める場合

  将来、別の新しいプロジェクト（例: blog-system）を作る時：

  # 新しいプロジェクトを作成
  laravel new blog-system

  この時も、最初は APP_KEY= が空なので、php artisan key:generate
  を実行する必要があります。

  ---
  なぜ今回は既に生成されているのか？

  おそらく、以下のいずれかが起きました：

  1. Laravelのインストール時に自動生成された
    - Laravel
  12では、プロジェクト作成時に自動的にキーが生成されることがある
  2. 誰かが既に php artisan key:generate を実行していた
    - このプロジェクトをセットアップした人が既に実行済み
  3. .env ファイルが既に存在していた
    - プロジェクト作成時に既に .env が用意されていた

  ---
  つまり

  - 今のあなた: 何もしなくてOK（既に生成済み）
  - 新しく参加する人: php artisan key:generate
  を実行する必要がある
  - 将来の別プロジェクト: php artisan key:generate
  を実行する必要がある

  今回README.mdに手順を追加したのは、将来このプロジェクトに参加す
  る人のためです。
  

### Q: CORSとは何か？なぜ必要なのか？

**作成日**: 2025-11-21

#### CORSの基本概念

**CORS (Cross-Origin Resource Sharing)** = 異なるドメイン・ポート間でのデータのやり取りを制御するブラウザのセキュリティ機能。

#### このプロジェクトでの具体例

- **フロントエンド**: `http://localhost:3000` (Next.js)
- **バックエンド**: `http://localhost:8000` (Laravel API)

この2つは**ポート番号が異なる**ため、ブラウザから見ると**別のドメイン（オリジン）**として扱われます。

#### なぜブロックされるのか？

**セキュリティのため**です。

悪意のあるサイト（例: `http://evil-site.com`）から、勝手にあなたのAPIにアクセスされないようにするためのブラウザの保護機能です。

#### CORSエラーの例

フロントエンドから以下のようなコードを書くと：

```typescript
// frontend/app/page.tsx
const response = await fetch('http://localhost:8000/api/health');
```

**CORS設定がない場合、以下のエラーが発生**：

```
Access to fetch at 'http://localhost:8000/api/health' from origin
'http://localhost:3000' has been blocked by CORS policy
```

#### CORS設定の仕組み

バックエンド側で「この場所（オリジン）からのアクセスは許可する」と明示的に宣言します。

```
1. フロントエンド（localhost:3000）: 「localhost:8000 にアクセスしたい」
2. ブラウザ: 「バックエンドに許可を確認します」（プリフライトリクエスト）
3. バックエンド（localhost:8000）: 「localhost:3000 からのアクセスは許可します」
4. ブラウザ: 「了解！アクセスを許可します」
```

#### このプロジェクトでの設定内容

**ファイル**: `backend/config/cors.php`

```php
'allowed_origins' => [
    'http://localhost:3000',  // Next.jsフロントエンド（開発環境）
],
```

この設定により、`localhost:3000` からのAPIリクエストが許可されます。

#### 設定項目の説明

| 設定項目 | 意味 | このプロジェクトの設定 |
|---|---|---|
| `paths` | CORS を適用するパス | `api/*` （すべてのAPIエンドポイント） |
| `allowed_origins` | 許可するオリジン（ドメイン） | `http://localhost:3000` |
| `allowed_methods` | 許可するHTTPメソッド | `*` （すべて：GET, POST, PUT, DELETE など） |
| `allowed_headers` | 許可するHTTPヘッダー | `*` （すべて） |
| `supports_credentials` | Cookie送信を許可するか | `true` |

#### 動作確認方法

1. **Dockerコンテナ起動**
   ```bash
   docker compose up -d
   ```

2. **ブラウザのコンソールで確認**（フロントエンドから）
   ```javascript
   fetch('http://localhost:8000/api/health')
     .then(res => res.json())
     .then(data => console.log(data))
     .catch(err => console.error('CORSエラー:', err));
   ```

3. **成功する場合**: レスポンスが返ってくる
4. **失敗する場合**: `blocked by CORS policy` エラーが表示される

#### 本番環境での注意

開発環境では `localhost:3000` を許可していますが、本番環境では以下のように変更する必要があります：

```php
'allowed_origins' => [
    'https://your-production-domain.com',  // 本番ドメイン
],
```

---

## 今後必要なアクション

最新の状況については `.claude/TODO.md` を参照してください。

---

## メモ

- このファイルは開発中の学習内容や重要な決定事項を記録するためのものです
- 新しい概念や技術を導入したら、このファイルに追記してください
- 質問や疑問点があった場合も、回答をここに記録しておくと後で役立ちます
