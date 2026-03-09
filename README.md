# Blog API

🇯🇵 [日本語版はこちら](README.ja.md)

A pnpm monorepo containing three packages: a TypeScript Blog API, a BFF (Backend For Frontend) layer, and a Preact Frontend SPA. Built with Hono and SQLite.

## Features

### API
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- 🔍 Full-text search on title and content
- 📝 Type-safe with TypeScript
- ⚡ Lightweight and fast with Hono
- 💾 libSQL (SQLite) with Drizzle ORM
- 🖼️ Image attachment support (upload, validate, serve)
- 🏗️ Well-organized file structure
- 🐳 DevContainer / GitHub Codespaces ready

### BFF (Backend For Frontend)
- 🔀 Proxy layer between frontend and API
- ⚡ In-memory caching (30s for list, 60s for detail)
- 🔄 Data transformation (summary/detail)
- 🖼️ Multipart image upload proxy
- 🌐 CORS support

### Frontend
- ⚛️ Preact SPA (component-based)
- ⚡ Vite-powered development
- 🔀 Client-side routing with preact-router
- 📝 Blog CRUD UI
- 🖼️ Image attachment UI (multi-select, preview list)
- 🔍 Search functionality with debounce
- 🔔 Toast notifications (replaces alert())
- 🌙 Dark mode support

## Tech Stack

### API
- **Framework**: Hono v4
- **Language**: TypeScript v5
- **Database**: libSQL (SQLite) with Drizzle ORM
- **Runtime**: Node.js (v18+) via `@hono/node-server`
- **Package Manager**: pnpm

### BFF
- **Framework**: Hono v4
- **Language**: TypeScript
- **Runtime**: Node.js via `@hono/node-server`

### Frontend
- **Build Tool**: Vite v6
- **Framework**: Preact v10
- **Router**: preact-router v4
- **Language**: TypeScript
- **Styling**: CSS (with dark mode)

## Architecture

```
Frontend (port 5173) → BFF (port 3001) → API (port 3000) → SQLite
```

- **API** (`src/`): Direct database access, full CRUD with Drizzle ORM
- **BFF** (`packages/bff/`): Proxy between frontend and API, provides caching (in-memory with TTL), data transformation (raw content → excerpt for list, HTML-escaped content for detail), CORS handling, error normalization (502 for upstream failures)
- **Frontend** (`packages/frontend/`): Preact SPA with component-based architecture, uses Vite dev proxy (`/api` → `localhost:3001`), client-side routing, renders blog list/detail/create/search with toast notifications

## Installation

### Prerequisites

- Node.js (v18+)
- pnpm

### Local Setup

```bash
# Install all dependencies
pnpm install

# Generate database schema
pnpm db:generate

# Run migrations
pnpm db:migrate

# Start all services (API + BFF + Frontend)
pnpm dev
```

### GitHub Codespaces / DevContainer

This repository includes a DevContainer configuration. You can open it directly in GitHub Codespaces or any DevContainer-compatible editor (e.g., VS Code with the Dev Containers extension) without any local setup.

1. Click **Code → Open with Codespaces** on GitHub, or open the repository in VS Code and select **Reopen in Container**.
2. Once the container is running, install dependencies and start the server:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

#### Using Podman

The DevContainer configuration in this repository works with both Docker and Podman. No changes to repository files are needed.

If you use Podman, add the following to your VS Code user settings (`settings.json`):

```json
{
  "dev.containers.dockerPath": "podman"
}
```

If you also use `docker-compose.yml`, add:

```json
{
  "dev.containers.dockerComposePath": "podman-compose"
}
```

> **Note**: These are per-developer local settings (e.g., `~/.config/Code/User/settings.json`), not repository settings. They do not affect developers using Docker.

## Development

```bash
# Install all dependencies
pnpm install

# Start all services (API + BFF + Frontend)
pnpm dev

# Or start individually:
cd packages/bff && pnpm dev      # BFF on port 3001
cd packages/frontend && pnpm dev # Frontend on port 5173

# Stop dev server
pnpm dev:stop

# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `3000`  | API server port |
| `BFF_PORT` | `3001` | BFF server port |
| `API_BASE` | `http://localhost:3000` | API base URL (used by BFF) |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin (used by BFF) |

## API Endpoints

### Health Check

```
GET /health
```

Returns API status.

**Response `200 OK`:**

```json
{ "ok": true }
```

### Get All Blogs

```
GET /blogs
```

Returns all blog posts ordered by latest first.

**Response `200 OK`:**

```json
[
  {
    "id": 1,
    "title": "Hello World",
    "content": "My first post",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Blog by ID

```
GET /blogs/:id
```

Returns a specific blog post by ID, including attached images.

**Response `200 OK`:**

```json
{
  "id": 1,
  "title": "Hello World",
  "content": "My first post",
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

**Response `404 Not Found`:**

```json
{ "message": "not found" }
```

### Search Blogs

```
GET /blogs/search?q=keyword
```

Search blog posts by title or content.

**Query Parameters:**
- `q` (required) - Search keyword

**Response `200 OK`:** Array of matching blog posts (same shape as Get All Blogs)

**Response `400 Bad Request`:**

```json
{ "message": "query parameter \"q\" is required" }
```

### Create Blog

```
POST /blogs
```

Create a new blog post. Optionally attach previously uploaded images by providing their IDs.

**Request Body:**

```json
{
  "title": "Blog Title",
  "content": "Blog content",
  "imageIds": [1, 2]
}
```

**Response `201 Created`:**

```json
{
  "id": 1,
  "title": "Blog Title",
  "content": "Blog content",
  "images": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Response `400 Bad Request`:**

```json
{ "message": "title and content are required" }
```

### Update Blog

```
PUT /blogs/:id
```

Update an existing blog post. Provide `imageIds` to update image associations (replaces current associations).

**Request Body:**

```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "imageIds": [1]
}
```

**Response `200 OK`:**

```json
{
  "id": 1,
  "title": "Updated Title",
  "content": "Updated content",
  "images": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**Response `404 Not Found`:**

```json
{ "message": "not found" }
```

### Delete Blog

```
DELETE /blogs/:id
```

Delete a blog post and its associated image files.

**Response `204 No Content`:** Empty body on success.

**Response `404 Not Found`:**

```json
{ "message": "not found" }
```

### Upload Image

```
POST /images
```

Upload an image file. The image is stored in `data/uploads/` with a UUID-based filename. Returns image metadata including a `url` for serving.

**Request:** `multipart/form-data` with a `file` field.

**Allowed MIME types:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`

**Max file size:** 5 MB

**Response `201 Created`:**

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

**Response `400 Bad Request`:** Invalid MIME type or file too large.

### Serve Image

```
GET /uploads/:storageKey
```

Serve a stored image file. Use this URL directly in `<img src>` tags (prepend `/api` when using via BFF/Vite proxy).

**Response `200 OK`:** Binary image data with appropriate `Content-Type`.

**Response `404 Not Found`:** Image not found.

## Example Usage

```bash
# Create a blog post
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -d '{"title":"TypeScript入門","content":"TypeScriptは型安全なJavaScriptです"}'

# Upload an image
curl -X POST http://localhost:3000/images \
  -F "file=@/path/to/photo.png"

# Create a blog post with attached image (use the id from upload response)
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -d '{"title":"Photo Blog","content":"ブログに画像を添付","imageIds":[1]}'

# Get all blogs
curl http://localhost:3000/blogs | jq

# Search blogs
curl "http://localhost:3000/blogs/search?q=TypeScript" | jq

# Get a specific blog (includes images)
curl http://localhost:3000/blogs/1 | jq

# Serve an image
curl http://localhost:3000/uploads/<storageKey> --output photo.png

# Update a blog
curl -X PUT http://localhost:3000/blogs/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","content":"Updated content"}'

# Delete a blog (also deletes associated image files)
curl -X DELETE http://localhost:3000/blogs/1
```

## BFF Endpoints

The BFF (`packages/bff/`) exposes the same routes as the API but with transformed responses.

### Health Check

```
GET /health
```

**Response `200 OK`:**

```json
{ "ok": true }
```

### Get All Blogs (Summary)

```
GET /blogs
```

Returns `BlogSummary[]` ordered by latest first. Cached for 30 seconds.

**Response `200 OK`:**

```json
[
  {
    "id": 1,
    "title": "Hello World",
    "excerpt": "My first post",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Search Blogs

```
GET /blogs/search?q=keyword
```

Returns `BlogSummary[]` matching the search keyword.

### Get Blog by ID (Detail)

```
GET /blogs/:id
```

Returns a `BlogDetail` with HTML-escaped content and attached images. Cached for 60 seconds.

**Response `200 OK`:**

```json
{
  "id": 1,
  "title": "Hello World",
  "contentHtml": "My first post",
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

### Create / Update / Delete

```
POST /blogs
PUT /blogs/:id
DELETE /blogs/:id
```

Proxies directly to the API and invalidates the cache on success.

### Upload Image

```
POST /images
```

Proxies `multipart/form-data` to the upstream API. Same validation and response as the API endpoint.

### Serve Image

```
GET /uploads/:storageKey
```

Proxies image binary from the upstream API. Use `/api/uploads/:storageKey` from the frontend (via Vite `/api` proxy).

### Error Responses

- `502 Bad Gateway`: Returned when the upstream API is unreachable.

### BFF Response Types

```typescript
interface BlogImage {
  id: number;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  url: string;          // e.g. "/uploads/uuid.png"
}

interface BlogSummary {
  id: number;
  title: string;
  excerpt: string;      // first 120 chars of content
  createdAt: string;
  updatedAt: string;
}

interface BlogDetail {
  id: number;
  title: string;
  contentHtml: string;  // HTML-escaped content
  images: BlogImage[];
  createdAt: string;
  updatedAt: string;
}
```

## Project Structure

```
.devcontainer/                  # DevContainer configuration
src/                            # Blog API (port 3000)
├── index.ts                    # API entry point
├── db/
│   ├── client.ts               # Database client setup
│   ├── schema.ts               # Database schema definition (blogs + images)
│   └── init.ts                 # Database initialization
├── routes/
│   ├── blogs.ts                # Blog API routes
│   └── images.ts               # Image upload & static serving routes
└── utils/
    └── parseId.ts              # Utility functions
packages/
├── bff/                        # BFF - Backend For Frontend (port 3001)
│   ├── src/
│   │   ├── index.ts            # BFF entry point (Hono + CORS + logger)
│   │   ├── routes/
│   │   │   ├── blogs.ts        # Proxy routes with caching
│   │   │   └── images.ts       # Image upload & serving proxy routes
│   │   ├── cache/
│   │   │   └── memory.ts       # In-memory cache with TTL
│   │   └── types/
│   │       └── blog.ts         # BlogSummary/BlogDetail/BlogImage types & transformers
│   ├── package.json
│   └── tsconfig.json
└── frontend/                   # Frontend SPA (port 5173)
    ├── src/
    │   ├── main.tsx            # App entry point (render only)
    │   ├── app.tsx             # App component (routing)
    │   ├── api.ts              # API client (fetch wrapper, image upload)
    │   ├── style.css           # Styles (with dark mode)
    │   └── components/
    │       ├── BlogCard.tsx    # Blog card (list item)
    │       ├── BlogList.tsx    # Blog list page (list + form + search)
    │       ├── BlogDetail.tsx  # Blog detail page (with image gallery)
    │       ├── BlogForm.tsx    # Blog create form (with image selector)
    │       ├── SearchBar.tsx   # Search bar with debounce
    │       └── Toast.tsx       # Toast notification component
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts          # Vite config with Preact plugin and /api proxy
data/
├── blog.db                     # SQLite database file (auto-created)
└── uploads/                    # Uploaded image files (auto-created)
drizzle.config.ts               # Drizzle ORM configuration
tsconfig.json                   # TypeScript configuration
pnpm-workspace.yaml             # pnpm workspace configuration
```

## License

MIT
