import { desc, eq, like, or } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/client.js';
import { blogs } from '../db/schema.js';
import { parseId } from '../utils/parseId.js';

export const blogsRouter = new Hono();

blogsRouter.get('/health', (c) => c.json({ ok: true }));

blogsRouter.get('/blogs', async (c) => {
  const items = await db.select().from(blogs).orderBy(desc(blogs.id));
  return c.json(items);
});

blogsRouter.get('/blogs/search', async (c) => {
  const q = c.req.query('q')?.trim();
  if (!q) {
    return c.json({ message: 'query parameter "q" is required' }, 400);
  }

  const searchPattern = `%${q}%`;
  const items = await db.select().from(blogs)
    .where(or(
      like(blogs.title, searchPattern),
      like(blogs.content, searchPattern)
    ))
    .orderBy(desc(blogs.id));

  return c.json(items);
});

blogsRouter.get('/blogs/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ message: 'invalid id' }, 400);

  const [item] = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
  if (!item) return c.json({ message: 'not found' }, 404);

  return c.json(item);
});

blogsRouter.post('/blogs', async (c) => {
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

blogsRouter.put('/blogs/:id', async (c) => {
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

blogsRouter.delete('/blogs/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ message: 'invalid id' }, 400);

  const [removed] = await db.delete(blogs).where(eq(blogs.id, id)).returning({ id: blogs.id });
  if (!removed) return c.json({ message: 'not found' }, 404);

  return c.body(null, 204);
});
