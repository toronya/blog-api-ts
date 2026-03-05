# Blog API

🇬🇧 [English version](README.md)

軽量なTypeScript ブログAPI。Honoと SQLiteで構築された、 CRUD操作と検索機能を完備しています。

## 機能

- ✅ CRUD操作（Create、Read、Update、Delete）
- 🔍 タイトルと本文の全文検索
- 📝 TypeScriptによる型安全性
- ⚡ Honoによる軽量で高速な実装
- 💾 libSQL (SQLite) と Drizzle ORM
- 🏗️ よく整理されたファイル構造
- 🐳 DevContainer / GitHub Codespaces 対応

## 技術スタック

- **フレームワーク**: Hono v4
- **言語**: TypeScript v5
- **データベース**: libSQL (SQLite) with Drizzle ORM
- **ランタイム**: Node.js (v18+) via `@hono/node-server`
- **パッケージマネージャー**: pnpm

## インストール

### 必要環境

- Node.js (v18+)
- pnpm

### ローカルセットアップ

```bash
# 依存パッケージをインストール
pnpm install

# データベーススキーマを生成
pnpm db:generate

# マイグレーションを実行
pnpm db:migrate

# 開発サーバーを起動
pnpm dev
```

### GitHub Codespaces / DevContainer

このリポジトリにはDevContainer設定が含まれています。ローカル環境のセットアップなしに、GitHub CodespacesやDevContainer対応エディタ（VS Code + Dev Containers拡張機能など）で直接開発を始めることができます。

1. GitHubで **Code → Open with Codespaces** をクリックするか、VS Codeでリポジトリを開き **Reopen in Container** を選択します。
2. コンテナが起動したら、依存パッケージをインストールしてサーバーを起動します：

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

## 開発

```bash
# 開発サーバーを起動（ホットリロード機能付き）
pnpm dev

# 開発サーバーを停止
pnpm dev:stop

# 本番用ビルド
pnpm build

# 本番サーバーを起動
pnpm start
```

## 環境変数

| 変数名   | デフォルト | 説明 |
|---------|-----------|------|
| `PORT`  | `3000`    | HTTPサーバーがリッスンするポート番号 |

## API エンドポイント

### ヘルスチェック

```
GET /health
```

APIのステータスを返します。

**レスポンス `200 OK`:**

```json
{ "ok": true }
```

### すべてのブログ記事を取得

```
GET /blogs
```

すべてのブログ記事を最新順で返します。

**レスポンス `200 OK`:**

```json
[
  {
    "id": 1,
    "title": "Hello World",
    "content": "最初の投稿",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### IDでブログ記事を取得

```
GET /blogs/:id
```

指定されたIDのブログ記事を1件返します。

**レスポンス `200 OK`:**

```json
{
  "id": 1,
  "title": "Hello World",
  "content": "最初の投稿",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**レスポンス `404 Not Found`:**

```json
{ "message": "not found" }
```

### ブログ記事を検索

```
GET /blogs/search?q=keyword
```

タイトルまたは本文でブログ記事を検索します。

**クエリパラメータ:**
- `q` (必須) - 検索キーワード

**レスポンス `200 OK`:** 条件に一致するブログ記事の配列（「すべてのブログ記事を取得」と同じ形式）

**レスポンス `400 Bad Request`:**

```json
{ "message": "query parameter \"q\" is required" }
```

### ブログ記事を作成

```
POST /blogs
```

新しいブログ記事を作成します。

**リクエストボディ:**

```json
{
  "title": "ブログタイトル",
  "content": "ブログの内容"
}
```

**レスポンス `201 Created`:**

```json
{
  "id": 1,
  "title": "ブログタイトル",
  "content": "ブログの内容",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**レスポンス `400 Bad Request`:**

```json
{ "message": "title and content are required" }
```

### ブログ記事を更新

```
PUT /blogs/:id
```

既存のブログ記事を更新します。

**リクエストボディ:**

```json
{
  "title": "更新されたタイトル",
  "content": "更新された内容"
}
```

**レスポンス `200 OK`:**

```json
{
  "id": 1,
  "title": "更新されたタイトル",
  "content": "更新された内容",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**レスポンス `404 Not Found`:**

```json
{ "message": "not found" }
```

### ブログ記事を削除

```
DELETE /blogs/:id
```

ブログ記事を削除します。

**レスポンス `204 No Content`:** 成功時はボディなし。

**レスポンス `404 Not Found`:**

```json
{ "message": "not found" }
```

## 使用例

```bash
# ブログ記事を作成
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -d '{"title":"TypeScript入門","content":"TypeScriptは型安全なJavaScriptです"}'

# すべてのブログ記事を取得
curl http://localhost:3000/blogs | jq

# ブログ記事を検索
curl "http://localhost:3000/blogs/search?q=TypeScript" | jq

# 特定のブログ記事を取得
curl http://localhost:3000/blogs/1 | jq

# ブログ記事を更新
curl -X PUT http://localhost:3000/blogs/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"更新されたタイトル","content":"更新された内容"}'

# ブログ記事を削除
curl -X DELETE http://localhost:3000/blogs/1
```

## プロジェクト構造

```
.devcontainer/            # DevContainer設定
src/
├── index.ts              # アプリケーションのエントリーポイント（@hono/node-server、PORT環境変数対応）
├── db/
│   ├── client.ts         # データベースクライアント設定（@libsql/client、drizzle-orm/libsql）
│   ├── schema.ts         # データベーススキーマ定義
│   └── init.ts           # データベース初期化
├── routes/
│   └── blogs.ts          # ブログルート定義
└── utils/
    └── parseId.ts        # ユーティリティ関数
data/
└── blog.db               # SQLiteデータベースファイル（自動生成）
drizzle.config.ts         # Drizzle ORM設定
tsconfig.json             # TypeScript設定
pnpm-workspace.yaml       # pnpmワークスペース設定
```

## ライセンス

MIT
