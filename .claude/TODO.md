# 環境構築の改善TODO

環境構築レビューで特定された問題点と対応順序をまとめたメモです。

## 🔴 最優先（これがないと開発できない）

### 1. APIルーティングの設定
**状態**: ✅ 完了
**問題**: LaravelのAPIルーティングが登録されていないため、フロントエンドからAPIを呼び出しても404エラーになる

**対応内容**:
- [x] `backend/routes/api.php` ファイルを作成
- [x] `backend/bootstrap/app.php` にAPIルーティングを追加
  ```php
  ->withRouting(
      web: __DIR__.'/../routes/web.php',
      api: __DIR__.'/../routes/api.php',  // ← 追加
      commands: __DIR__.'/../routes/console.php',
      health: '/up',
  )
  ```

**補足**: `/api/health` エンドポイントも追加済み（TODO #10 も部分的に完了）

### 2. CORS設定
**状態**: ✅ 完了
**問題**: フロントエンド (localhost:3000) からバックエンド (localhost:8000) へのAPIリクエストがCORSエラーで失敗する

**対応内容**:
- [x] `backend/config/cors.php` の設定を確認・更新
- [x] Laravel のCORSミドルウェアを有効化
- [x] 開発環境用に `localhost:3000` を許可リストに追加

**補足**: CORS の詳細な説明は `.claude/DEVELOPMENT_NOTES.md` に記載

### 3. `.gitignore` の作成
**状態**: ✅ 完了
**問題**: node_modules、vendor、.envなどがGitにコミットされる危険性

**対応内容**:
- [x] プロジェクトルートに `.gitignore` を作成

---

## 🟡 早急に対応すべき

### 4. `.env.example` の修正
**状態**: ✅ 完了
**問題**: `.env.example` がSQLite想定だが、実際の環境はMySQL

**対応内容**:
- [x] `backend/.env.example` をDocker環境に合わせて更新
  - DB_CONNECTION=mysql
  - DB_HOST=mysql
  - DB_PORT=3306
  - DB_DATABASE=reservation_db
  - DB_USERNAME=reservation_user
  - DB_PASSWORD=reservation_pass
- [x] MAIL設定もMailhog用に更新
  - MAIL_MAILER=smtp
  - MAIL_HOST=mailhog
  - MAIL_PORT=1025
  - MAIL_ENCRYPTION=null

### 5. Application Key の生成手順の明確化
**状態**: ✅ 完了
**問題**: 初回起動時に `php artisan key:generate` が必要だが、手順が不明確

**対応内容**:
- [x] README.mdにセットアップ手順として明記
- [x] Application Keyの概念説明を `.claude/DEVELOPMENT_NOTES.md` に追加

**補足**: 現在の環境では Application Key は既に生成済み。新規セットアップ時の手順を明確化しました。

### 6. フロントエンド環境変数ファイルの作成
**状態**: ✅ 完了
**問題**: `NEXT_PUBLIC_API_URL` が `docker-compose.yml` にハードコードされている

**対応内容**:
- [x] `frontend/.env.local.example` を作成
  ```
  NEXT_PUBLIC_API_URL=http://localhost:8000/api
  ```
- [x] README.mdにコピー手順を追加
- [x] 環境変数の概念説明を `.claude/DEVELOPMENT_NOTES.md` に追加

**補足**: Next.jsの標準的な環境変数管理方法を導入しました。

---

## 🟢 余裕があれば対応

### 7. entrypointスクリプトによる自動化
**状態**: 未対応
**問題**: Laravelコンテナ起動時の手動作業が多い

**対応内容**:
- [ ] `backend/docker-entrypoint.sh` を作成
  - composer install の自動実行
  - php artisan key:generate の自動実行
  - php artisan migrate の自動実行（オプション）
- [ ] `backend/Dockerfile` でentrypointを設定

### 8. Lintとtypeチェックの強化
**状態**: 未対応
**問題**: TypeScript の厳格性が不明、Next.js設定が空

**対応内容**:
- [ ] `frontend/tsconfig.json` で strict mode を有効化
- [ ] `frontend/next.config.mjs` に適切な設定を追加
  - reactStrictMode
  - swcMinify など

### 9. テスト環境の整備
**状態**: 未対応
**問題**: フロントエンドのテストフレームワークが未設定

**対応内容**:
- [ ] フロントエンド: Jest または Vitest のセットアップ
- [ ] バックエンド: PHPUnit のテスト用データベース設定
- [ ] テスト実行用のDockerコマンドをドキュメント化

### 10. ヘルスチェックエンドポイント
**状態**: 🔄 部分的に完了
**問題**: フロントエンドからバックエンドへの接続確認手段がない

**対応内容**:
- [x] `backend/routes/api.php` に `/api/health` エンドポイントを追加
- [ ] フロントエンドに接続確認用のユーティリティを追加

---

## メモ

- このファイルは `.claude/` ディレクトリに保存されており、Gitにコミットされます
- 作業完了したら、各チェックボックスに [x] をマークしてください
- 優先度は変更される可能性があるため、適宜見直してください
