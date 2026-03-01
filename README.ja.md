# Blog API

軽量なTypeScript ブログAPI。Honoと SQLiteで構築された、 CRUD操作と検索機能を完備しています。

## 機能

- ✅ CRUD操作（Create、Read、Update、Delete）
- 🔍 タイトルと本文の全文検索
- 📝 TypeScriptによる型安全性
- ⚡ Honoによる軽量で高速な実装
- 💾 Drizzle ORMを使用したSQLiteデータベース
- 🏗️ よく整理されたファイル構造

## 技術スタック

- **フレームワーク**: Hono
- **言語**: TypeScript
- **データベース**: SQLite（Drizzle ORM）
- **サーバー**: Node.js
- **パッケージマネージャー**: pnpm

## インストール

### 必要環境

- Node.js (v18+)
- pnpm

### セットアップ

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

## API エンドポイント

### ヘルスチェック

```bash
GET /health
```

APIのステータスを返します。

### すべてのブログ記事を取得

```bash
GET /blogs
```

すべてのブログ記事を最新順で返します。

### IDでブログ記事を取得

```bash
GET /blogs/:id
```

指定されたIDのブログ記事を1件返します。

### ブログ記事を検索

```bash
GET /blogs/search?q=keyword
```

タイトルまたは本文でブログ記事を検索します。

**クエリパラメータ:**
- `q` (必須) - 検索キーワード

### ブログ記事を作成

```bash
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

### ブログ記事を更新

```bash
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

### ブログ記事を削除

```bash
DELETE /blogs/:id
```

ブログ記事を削除します。

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
src/
├── index.ts              # アプリケーションのエントリーポイント
├── db/
│   ├── client.ts         # データベースクライアント設定
│   ├── schema.ts         # データベーススキーマ定義
│   └── init.ts           # データベース初期化
├── routes/
│   └── blogs.ts          # ブログルート定義
└── utils/
    └── parseId.ts        # ユーティリティ関数
```

## ライセンス

MIT
