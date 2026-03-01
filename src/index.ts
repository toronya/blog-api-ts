import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { initDatabase } from './db/init.js';
import { blogsRouter } from './routes/blogs.js';

const app = new Hono();

// データベース初期化
await initDatabase();

// ルート登録
app.route('/', blogsRouter);

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port
}, () => {
  console.log(`Blog API listening on http://localhost:${port}`);
});

export default app;
