# .claude ディレクトリ

このディレクトリには、開発環境の推奨設定ファイルが含まれています。

## 使用方法

### 1. VS Code設定

```bash
# プロジェクトルートに .vscode ディレクトリを作成
mkdir -p .vscode

# settings.jsonをコピー
cp .claude/settings.json .vscode/settings.json
```

### 2. EditorConfig

```bash
# プロジェクトルートにコピー
cp .claude/editorconfig .editorconfig
```

### 3. Prettier設定（オプション）

```bash
# プロジェクトルートにコピー
cp .claude/prettierrc.json .prettierrc.json
```

## VS Code 推奨拡張機能

settings.jsonを使用する場合、以下の拡張機能のインストールを推奨します：

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **PHP Intelephense** (`bmewburn.vscode-intelephense-client`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Docker** (`ms-azuretools.vscode-docker`)

## 注意事項

- これらの設定ファイルは `.gitignore` に含めるかどうかチーム内で決定してください
- 個人の好みに応じてカスタマイズ可能です
- EditorConfigはほとんどのエディタで自動的に読み込まれます
