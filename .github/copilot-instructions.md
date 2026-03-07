# Blog API - Copilot Instructions

## プロジェクト概要

Hono + TypeScript + SQLite (Drizzle ORM) で構築された pnpm モノレポ。
API (port 3000)、BFF (port 3001)、Preact Frontend (port 5173) の3パッケージ構成。

### アーキテクチャ

```
Frontend (port 5173) → BFF (port 3001) → API (port 3000) → SQLite
```

- **API** (`src/`): Hono + Drizzle ORM によるブログ CRUD API
- **BFF** (`packages/bff/`): キャッシュ付きプロキシ層（インメモリ TTL キャッシュ、データ変換、CORS）
- **フロントエンド** (`packages/frontend/`): Preact SPA（Vite、クライアントサイドルーティング）

## コーディングルール

- 言語: TypeScript (strict モード)
- ランタイム: Node.js (ESM, `"type": "module"`)
- インポートには `.js` 拡張子を付けること（例: `import { db } from './db/client.js'`）
- コメントは日本語で記述
- パッケージマネージャーは pnpm を使用（npm や yarn は使わない）

## 主要な技術スタック

- **Webフレームワーク**: Hono v4
- **ORM**: Drizzle ORM (SQLite / libSQL)
- **フロントエンド**: Preact v10 + Vite v6
- **言語**: TypeScript v5

## 開発コマンド

- `pnpm install` - 依存パッケージのインストール
- `pnpm dev` - 全サービス起動（API + BFF + Frontend）
- `pnpm db:generate` - Drizzle スキーマ生成
- `pnpm db:migrate` - マイグレーション実行
- `pnpm build` - 本番ビルド

## ファイル構成の方針

- API ルートは `src/routes/` に配置
- データベース関連は `src/db/` に配置（client.ts, schema.ts, init.ts）
- BFF のキャッシュは `packages/bff/src/cache/` に配置
- フロントエンドのコンポーネントは `packages/frontend/src/components/` に配置

## 環境変数

- `PORT` (デフォルト: 3000) - API サーバーポート
- `BFF_PORT` (デフォルト: 3001) - BFF サーバーポート
- `API_BASE` (デフォルト: http://localhost:3000) - API ベース URL
- `CORS_ORIGIN` (デフォルト: http://localhost:5173) - CORS 許可オリジン
