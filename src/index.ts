import { serve } from '@hono/node-server';
import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db, sqlite } from './db/client.js';
import { blogs } from './db/schema.js';

const app = new Hono();

await sqlite.execute(`
  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`);

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

app.get('/health', (c) => c.json({ ok: true }));

app.get('/blogs', async (c) => {
  const items = await db.select().from(blogs).orderBy(desc(blogs.id));
  return c.json(items);
});

app.get('/blogs/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ message: 'invalid id' }, 400);

  const [item] = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
  if (!item) return c.json({ message: 'not found' }, 404);

  return c.json(item);
});

app.post('/blogs', async (c) => {
  const body = await c.req.json<{ title?: string; content?: string }>();
  const title = body.title?.trim();
  const content = body.content?.trim();

  if (!title || !content) {
    return c.json({ message: 'title and content are required' }, 400);
  }

  const now = Date.now();
  const [created] = await db.insert(blogs).values({
    title,
    content,
    createdAt: new Date(now),
    updatedAt: new Date(now)
  }).returning();

  return c.json(created, 201);
});

app.put('/blogs/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ message: 'invalid id' }, 400);

  const body = await c.req.json<{ title?: string; content?: string }>();
  const title = body.title?.trim();
  const content = body.content?.trim();

  if (!title || !content) {
    return c.json({ message: 'title and content are required' }, 400);
  }

  const [item] = await db.update(blogs)
    .set({ title, content, updatedAt: new Date() })
    .where(eq(blogs.id, id))
    .returning();

  if (!item) return c.json({ message: 'not found' }, 404);

  return c.json(item);
});

app.delete('/blogs/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ message: 'invalid id' }, 400);

  const [removed] = await db.delete(blogs).where(eq(blogs.id, id)).returning({ id: blogs.id });
  if (!removed) return c.json({ message: 'not found' }, 404);

  return c.body(null, 204);
});

const port = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port
}, () => {
  console.log(`Blog API listening on http://localhost:${port}`);
});

export default app;
