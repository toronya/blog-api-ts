# Blog API

A lightweight TypeScript blog API with full CRUD operations and search functionality, built with Hono and SQLite.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- 🔍 Full-text search on title and content
- 📝 Type-safe with TypeScript
- ⚡ Lightweight and fast with Hono
- 💾 SQLite database with Drizzle ORM
- 🏗️ Well-organized file structure

## Tech Stack

- **Framework**: Hono
- **Language**: TypeScript
- **Database**: SQLite with Drizzle ORM
- **Server**: Node.js
- **Package Manager**: pnpm

## Installation

### Prerequisites

- Node.js (v18+)
- pnpm

### Setup

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

## API Endpoints

### Health Check

```bash
GET /health
```

Returns API status.

### Get All Blogs

```bash
GET /blogs
```

Returns all blog posts ordered by latest first.

### Get Blog by ID

```bash
GET /blogs/:id
```

Returns a specific blog post by ID.

### Search Blogs

```bash
GET /blogs/search?q=keyword
```

Search blog posts by title or content.

**Query Parameters:**
- `q` (required) - Search keyword

### Create Blog

```bash
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

### Update Blog

```bash
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

### Delete Blog

```bash
DELETE /blogs/:id
```

Delete a blog post.

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
src/
├── index.ts              # Application entry point
├── db/
│   ├── client.ts         # Database client setup
│   ├── schema.ts         # Database schema definition
│   └── init.ts           # Database initialization
├── routes/
│   └── blogs.ts          # Blog routes definition
└── utils/
    └── parseId.ts        # Utility functions
```

## License

MIT
