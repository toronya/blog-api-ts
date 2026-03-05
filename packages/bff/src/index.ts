import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { blogsRouter } from './routes/blogs.js';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));

app.get('/health', (c) => c.json({ ok: true }));
app.route('/', blogsRouter);

const port = Number(process.env.BFF_PORT ?? 3001);

serve({ fetch: app.fetch, port }, () => {
  console.log(`BFF running on http://localhost:${port}`);
});
