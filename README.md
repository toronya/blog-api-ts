# Blog API

🇯🇵 [日本語版はこちら](README.ja.md)

A lightweight TypeScript blog API with full CRUD operations and search functionality, built with Hono and SQLite.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- 🔍 Full-text search on title and content
- 📝 Type-safe with TypeScript
- ⚡ Lightweight and fast with Hono
- 💾 libSQL (SQLite) with Drizzle ORM
- 🏗️ Well-organized file structure
- 🐳 DevContainer / GitHub Codespaces ready

## Tech Stack

- **Framework**: Hono v4
- **Language**: TypeScript v5
- **Database**: libSQL (SQLite) with Drizzle ORM
- **Runtime**: Node.js (v18+) via `@hono/node-server`
- **Package Manager**: pnpm

## Installation

### Prerequisites

- Node.js (v18+)
- pnpm

### Local Setup

```bash
# Install dependencies
pnpm install

# Generate database schema
pnpm db:generate

# Run migrations
pnpm db:migrate

# Start development server
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

## Development

```bash
# Start dev server (with hot reload)
pnpm dev

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
| `PORT`   | `3000`  | Port the HTTP server listens on |

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

Returns a specific blog post by ID.

**Response `200 OK`:**

```json
{
  "id": 1,
  "title": "Hello World",
  "content": "My first post",
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

Create a new blog post.

**Request Body:**

```json
{
  "title": "Blog Title",
  "content": "Blog content"
}
```

**Response `201 Created`:**

```json
{
  "id": 1,
  "title": "Blog Title",
  "content": "Blog content",
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

Update an existing blog post.

**Request Body:**

```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Response `200 OK`:**

```json
{
  "id": 1,
  "title": "Updated Title",
  "content": "Updated content",
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

Delete a blog post.

**Response `204 No Content`:** Empty body on success.

**Response `404 Not Found`:**

```json
{ "message": "not found" }
```

## Example Usage

```bash
# Create a blog post
curl -X POST http://localhost:3000/blogs \
  -H "Content-Type: application/json" \
  -d '{"title":"TypeScript入門","content":"TypeScriptは型安全なJavaScriptです"}'

# Get all blogs
curl http://localhost:3000/blogs | jq

# Search blogs
curl "http://localhost:3000/blogs/search?q=TypeScript" | jq

# Get a specific blog
curl http://localhost:3000/blogs/1 | jq

# Update a blog
curl -X PUT http://localhost:3000/blogs/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","content":"Updated content"}'

# Delete a blog
curl -X DELETE http://localhost:3000/blogs/1
```

## Project Structure

```
.devcontainer/            # DevContainer configuration
src/
├── index.ts              # Application entry point (@hono/node-server, PORT env support)
├── db/
│   ├── client.ts         # Database client setup (@libsql/client, drizzle-orm/libsql)
│   ├── schema.ts         # Database schema definition
│   └── init.ts           # Database initialization
├── routes/
│   └── blogs.ts          # Blog routes definition
└── utils/
    └── parseId.ts        # Utility functions
data/
└── blog.db               # SQLite database file (auto-created)
drizzle.config.ts         # Drizzle ORM configuration
tsconfig.json             # TypeScript configuration
pnpm-workspace.yaml       # pnpm workspace configuration
```

## License

MIT
