# Blog API

🇬🇧 [English version](README.md)

TypeScript製ブログAPIを含むpnpmモノレポ。API、BFF（Backend For Frontend）、PreactフロントエンドSPAの3パッケージで構成されています。HonoとSQLiteで構築されています。

## 機能

### API
- ✅ CRUD操作（Create、Read、Update、Delete）
- 🔍 タイトルと本文の全文検索
- 📝 TypeScriptによる型安全性
- ⚡ Honoによる軽量で高速な実装
- 💾 libSQL (SQLite) と Drizzle ORM
- 🏗️ よく整理されたファイル構造
- 🐳 DevContainer / GitHub Codespaces 対応

### BFF（Backend For Frontend）
- 🔀 フロントエンドとAPIの間のプロキシ層
- ⚡ インメモリキャッシュ（一覧は30秒、詳細は60秒）
- 🔄 データ変換（サマリー/詳細）
- 🌐 CORSサポート

### フロントエンド
- ⚛️ Preact SPA（コンポーネントベース）
- ⚡ Viteによる高速な開発環境
- 🔀 preact-routerによるクライアントサイドルーティング
- 📝 ブログのCRUD UI
- 🔍 デバウンス付き検索機能
- 🔔 トースト通知（alert()の代替）
- 🌙 ダークモード対応

## 技術スタック

### API
- **フレームワーク**: Hono v4
- **言語**: TypeScript v5
- **データベース**: libSQL (SQLite) with Drizzle ORM
- **ランタイム**: Node.js (v18+) via `@hono/node-server`
- **パッケージマネージャー**: pnpm

### BFF
- **フレームワーク**: Hono v4
- **言語**: TypeScript
- **ランタイム**: Node.js via `@hono/node-server`

### フロントエンド
- **ビルドツール**: Vite v6
- **フレームワーク**: Preact v10
- **ルーター**: preact-router v4
- **言語**: TypeScript
- **スタイル**: CSS（ダークモード対応）

## アーキテクチャ

```
Frontend (port 5173) → BFF (port 3001) → API (port 3000) → SQLite
```

- **API** (`src/`): データベースへの直接アクセス、Drizzle ORMによるフルCRUD
- **BFF** (`packages/bff/`): フロントエンドとAPIの仲介役。インメモリキャッシュ（TTL付き）、データ変換（rawコンテンツ → 一覧用抜粋、詳細用HTMLエスケープ）、CORSハンドリング、エラー正規化（上流障害時に502を返却）
- **フロントエンド** (`packages/frontend/`): PreactベースのSPA。コンポーネント構成、Vite devプロキシ（`/api` → `localhost:3001`）を使用。クライアントサイドルーティング、ブログ一覧/詳細/作成/検索をトースト通知付きで描画

## インストール

### 必要環境

- Node.js (v18+)
- pnpm

### ローカルセットアップ

```bash
# すべての依存パッケージをインストール
pnpm install

# データベーススキーマを生成
pnpm db:generate

# マイグレーションを実行
pnpm db:migrate

# すべてのサービスを起動（API + BFF + フロントエンド）
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
# すべての依存パッケージをインストール
pnpm install

# すべてのサービスを起動（API + BFF + フロントエンド）
pnpm dev

# 個別に起動する場合：
cd packages/bff && pnpm dev      # BFF（ポート3001）
cd packages/frontend && pnpm dev # フロントエンド（ポート5173）

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
| `PORT`  | `3000`    | APIサーバーのポート番号 |
| `BFF_PORT` | `3001` | BFFサーバーのポート番号 |
| `API_BASE` | `http://localhost:3000` | APIのベースURL（BFFで使用） |
| `CORS_ORIGIN` | `http://localhost:5173` | 許可するCORSオリジン（BFFで使用） |

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

## BFF エンドポイント

BFF（`packages/bff/`）はAPIと同じルートを公開しますが、レスポンスを変換して返します。

### ヘルスチェック

```
GET /health
```

**レスポンス `200 OK`:**

```json
{ "ok": true }
```

### すべてのブログ記事を取得（サマリー）

```
GET /blogs
```

`BlogSummary[]` を最新順で返します。30秒間キャッシュされます。

**レスポンス `200 OK`:**

```json
[
  {
    "id": 1,
    "title": "Hello World",
    "excerpt": "最初の投稿",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### ブログ記事を検索

```
GET /blogs/search?q=keyword
```

検索キーワードに一致する `BlogSummary[]` を返します。

### IDでブログ記事を取得（詳細）

```
GET /blogs/:id
```

HTMLエスケープされたコンテンツを含む `BlogDetail` を返します。60秒間キャッシュされます。

**レスポンス `200 OK`:**

```json
{
  "id": 1,
  "title": "Hello World",
  "contentHtml": "最初の投稿",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 作成 / 更新 / 削除

```
POST /blogs
PUT /blogs/:id
DELETE /blogs/:id
```

APIに直接プロキシし、成功時にキャッシュを無効化します。

### エラーレスポンス

- `502 Bad Gateway`: 上流のAPIに接続できない場合に返されます。

### BFF レスポンス型

```typescript
interface BlogSummary {
  id: number;
  title: string;
  excerpt: string;      // コンテンツの最初の120文字
  createdAt: string;
  updatedAt: string;
}

interface BlogDetail {
  id: number;
  title: string;
  contentHtml: string;  // HTMLエスケープされたコンテンツ
  createdAt: string;
  updatedAt: string;
}
```

## プロジェクト構造

```
.devcontainer/                  # DevContainer設定
src/                            # Blog API（ポート3000）
├── index.ts                    # APIエントリーポイント
├── db/
│   ├── client.ts               # データベースクライアント設定
│   ├── schema.ts               # データベーススキーマ定義
│   └── init.ts                 # データベース初期化
├── routes/
│   └── blogs.ts                # ブログAPIルート
└── utils/
    └── parseId.ts              # ユーティリティ関数
packages/
├── bff/                        # BFF - Backend For Frontend（ポート3001）
│   ├── src/
│   │   ├── index.ts            # BFFエントリーポイント（Hono + CORS + ロガー）
│   │   ├── routes/
│   │   │   └── blogs.ts        # キャッシュ付きプロキシルート
│   │   ├── cache/
│   │   │   └── memory.ts       # TTL付きインメモリキャッシュ
│   │   └── types/
│   │       └── blog.ts         # BlogSummary/BlogDetail型とトランスフォーマー
│   ├── package.json
│   └── tsconfig.json
└── frontend/                   # フロントエンドSPA（ポート5173）
    ├── src/
    │   ├── main.tsx            # アプリエントリーポイント（renderのみ）
    │   ├── app.tsx             # Appコンポーネント（ルーティング定義）
    │   ├── api.ts              # APIクライアント（fetchラッパー）
    │   ├── style.css           # スタイル（ダークモード対応）
    │   └── components/
    │       ├── BlogCard.tsx    # ブログカード（一覧の各アイテム）
    │       ├── BlogList.tsx    # ブログ一覧画面（一覧＋フォーム＋検索）
    │       ├── BlogDetail.tsx  # ブログ詳細画面
    │       ├── BlogForm.tsx    # ブログ作成フォームコンポーネント
    │       ├── SearchBar.tsx   # デバウンス付き検索バー
    │       └── Toast.tsx       # トースト通知コンポーネント
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts          # Preactプラグインと/apiプロキシを含むVite設定
data/
└── blog.db                     # SQLiteデータベースファイル（自動生成）
drizzle.config.ts               # Drizzle ORM設定
tsconfig.json                   # TypeScript設定
pnpm-workspace.yaml             # pnpmワークスペース設定
```

## ライセンス

MIT
