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
- 🖼️ 画像添付サポート（アップロード・バリデーション・配信）
- 🏗️ よく整理されたファイル構造
- 🐳 DevContainer / GitHub Codespaces 対応

### BFF（Backend For Frontend）
- 🔀 フロントエンドとAPIの間のプロキシ層
- ⚡ インメモリキャッシュ（一覧は30秒、詳細は60秒）
- 🔄 データ変換（サマリー/詳細）
- 🖼️ multipart/form-data 画像アップロードプロキシ
- 🌐 CORSサポート

### フロントエンド
- ⚛️ Preact SPA（コンポーネントベース）
- ⚡ Viteによる高速な開発環境
- 🔀 preact-routerによるクライアントサイドルーティング
- 📝 ブログのCRUD UI
- 🖼️ 画像添付UI（複数選択・ファイルリスト表示）
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

#### Podman を使う場合

このリポジトリの DevContainer 設定は Docker と Podman の両方で動作します。リポジトリ内のファイルを変更する必要はありません。

Podman を使用する場合は、VS Code のユーザー設定（`settings.json`）に以下を追加してください：

```json
{
  "dev.containers.dockerPath": "podman"
}
```

`docker-compose.yml` を使用する場合は、あわせて以下も追加してください：

```json
{
  "dev.containers.dockerComposePath": "podman-compose"
}
```

> **注意**: これらはリポジトリの設定ではなく、各開発者のローカル設定（`~/.config/Code/User/settings.json` など）に追加してください。Docker を使う開発者には影響しません。

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

指定されたIDのブログ記事を1件返します。添付画像も含まれます。

**レスポンス `200 OK`:**

```json
{
  "id": 1,
  "title": "Hello World",
  "content": "最初の投稿",
  "images": [
    {
      "id": 1,
      "blogId": 1,
      "storageKey": "uuid.png",
      "originalName": "photo.png",
      "mimeType": "image/png",
      "size": 12345,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "url": "/uploads/uuid.png"
    }
  ],
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

新しいブログ記事を作成します。`imageIds` に事前にアップロードした画像のIDを渡すことで画像を添付できます。

**リクエストボディ:**

```json
{
  "title": "ブログタイトル",
  "content": "ブログの内容",
  "imageIds": [1, 2]
}
```

**レスポンス `201 Created`:**

```json
{
  "id": 1,
  "title": "ブログタイトル",
  "content": "ブログの内容",
  "images": [...],
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

既存のブログ記事を更新します。`imageIds` を指定すると画像の関連が更新されます（既存の関連を置き換え）。

**リクエストボディ:**

```json
{
  "title": "更新されたタイトル",
  "content": "更新された内容",
  "imageIds": [1]
}
```

**レスポンス `200 OK`:**

```json
{
  "id": 1,
  "title": "更新されたタイトル",
  "content": "更新された内容",
  "images": [...],
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

ブログ記事と関連する画像ファイルを削除します。

**レスポンス `204 No Content`:** 成功時はボディなし。

**レスポンス `404 Not Found`:**

```json
{ "message": "not found" }
```

### 画像をアップロード

```
POST /images
```

画像ファイルをアップロードします。`data/uploads/` にUUIDベースのファイル名で保存されます。メタデータと配信用 `url` を返します。

**リクエスト:** `file` フィールドを含む `multipart/form-data`

**許可するMIMEタイプ:** `image/jpeg`、`image/png`、`image/gif`、`image/webp`

**最大ファイルサイズ:** 5 MB

**レスポンス `201 Created`:**

```json
{
  "id": 1,
  "blogId": null,
  "storageKey": "uuid.png",
  "originalName": "photo.png",
  "mimeType": "image/png",
  "size": 12345,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "url": "/uploads/uuid.png"
}
```

**レスポンス `400 Bad Request`:** 対応していないMIMEタイプまたはファイルサイズ超過。

### 画像を配信

```
GET /uploads/:storageKey
```

保存された画像ファイルを配信します。フロントエンドから使用する場合は `/api/uploads/:storageKey` を使います（Viteの `/api` プロキシ経由）。

**レスポンス `200 OK`:** 適切な `Content-Type` を持つバイナリ画像データ。

**レスポンス `404 Not Found`:** 画像が見つからない場合。

## 使用例

```bash
# ブログ記事を作成
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -d '{"title":"TypeScript入門","content":"TypeScriptは型安全なJavaScriptです"}'

# 画像をアップロード
curl -X POST http://localhost:3000/images \
  -F "file=@/path/to/photo.png"

# 画像付きでブログ記事を作成（アップロードレスポンスの id を使用）
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -d '{"title":"フォトブログ","content":"ブログに画像を添付","imageIds":[1]}'

# すべてのブログ記事を取得
curl http://localhost:3000/blogs | jq

# ブログ記事を検索
curl "http://localhost:3000/blogs/search?q=TypeScript" | jq

# 特定のブログ記事を取得（画像情報を含む）
curl http://localhost:3000/blogs/1 | jq

# 画像を配信
curl http://localhost:3000/uploads/<storageKey> --output photo.png

# ブログ記事を更新
curl -X PUT http://localhost:3000/blogs/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"更新されたタイトル","content":"更新された内容"}'

# ブログ記事を削除（関連画像ファイルも削除）
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

HTMLエスケープされたコンテンツと添付画像を含む `BlogDetail` を返します。60秒間キャッシュされます。

**レスポンス `200 OK`:**

```json
{
  "id": 1,
  "title": "Hello World",
  "contentHtml": "最初の投稿",
  "images": [
    {
      "id": 1,
      "storageKey": "uuid.png",
      "originalName": "photo.png",
      "mimeType": "image/png",
      "size": 12345,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "url": "/uploads/uuid.png"
    }
  ],
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

### 画像アップロード

```
POST /images
```

`multipart/form-data` を上流APIに転送します。バリデーションとレスポンスはAPI側と同じです。

### 画像配信

```
GET /uploads/:storageKey
```

上流APIから画像バイナリをプロキシします。フロントエンドからは `/api/uploads/:storageKey` を使います（Viteの `/api` プロキシ経由）。

### エラーレスポンス

- `502 Bad Gateway`: 上流のAPIに接続できない場合に返されます。

### BFF レスポンス型

```typescript
interface BlogImage {
  id: number;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  url: string;          // 例: "/uploads/uuid.png"
}

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
  images: BlogImage[];
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
│   ├── schema.ts               # データベーススキーマ定義（blogs + images）
│   └── init.ts                 # データベース初期化
├── routes/
│   ├── blogs.ts                # ブログAPIルート
│   └── images.ts               # 画像アップロード・配信ルート
└── utils/
    └── parseId.ts              # ユーティリティ関数
packages/
├── bff/                        # BFF - Backend For Frontend（ポート3001）
│   ├── src/
│   │   ├── index.ts            # BFFエントリーポイント（Hono + CORS + ロガー）
│   │   ├── routes/
│   │   │   ├── blogs.ts        # キャッシュ付きプロキシルート
│   │   │   └── images.ts       # 画像アップロード・配信プロキシルート
│   │   ├── cache/
│   │   │   └── memory.ts       # TTL付きインメモリキャッシュ
│   │   └── types/
│   │       └── blog.ts         # BlogSummary/BlogDetail/BlogImage型とトランスフォーマー
│   ├── package.json
│   └── tsconfig.json
└── frontend/                   # フロントエンドSPA（ポート5173）
    ├── src/
    │   ├── main.tsx            # アプリエントリーポイント（renderのみ）
    │   ├── app.tsx             # Appコンポーネント（ルーティング定義）
    │   ├── api.ts              # APIクライアント（fetchラッパー・画像アップロード）
    │   ├── style.css           # スタイル（ダークモード対応）
    │   └── components/
    │       ├── BlogCard.tsx    # ブログカード（一覧の各アイテム）
    │       ├── BlogList.tsx    # ブログ一覧画面（一覧＋フォーム＋検索）
    │       ├── BlogDetail.tsx  # ブログ詳細画面（画像ギャラリー付き）
    │       ├── BlogForm.tsx    # ブログ作成フォーム（画像選択付き）
    │       ├── SearchBar.tsx   # デバウンス付き検索バー
    │       └── Toast.tsx       # トースト通知コンポーネント
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts          # Preactプラグインと/apiプロキシを含むVite設定
data/
├── blog.db                     # SQLiteデータベースファイル（自動生成）
└── uploads/                    # アップロードされた画像ファイル（自動生成）
drizzle.config.ts               # Drizzle ORM設定
tsconfig.json                   # TypeScript設定
pnpm-workspace.yaml             # pnpmワークスペース設定
```

## ライセンス

MIT
