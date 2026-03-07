import { desc, eq, inArray, like, or } from 'drizzle-orm';
import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';
import { db } from '../db/client.js';
import { blogs, images } from '../db/schema.js';
import { parseId } from '../utils/parseId.js';
import { uploadsDir } from './images.js';

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

  // 関連画像を取得
  const blogImages = await db.select().from(images).where(eq(images.blogId, id));

  return c.json({
    ...item,
    images: blogImages.map((img) => ({ ...img, url: `/uploads/${img.storageKey}` })),
  });
});

blogsRouter.post('/blogs', async (c) => {
  const body = await c.req.json<{ title?: string; content?: string; imageIds?: number[] }>();
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

  // 画像を新規ブログに関連付け
  const imageIds = body.imageIds ?? [];
  if (imageIds.length > 0) {
    await db.update(images)
      .set({ blogId: created.id })
      .where(inArray(images.id, imageIds));
  }

  const blogImages = await db.select().from(images).where(eq(images.blogId, created.id));

  return c.json({
    ...created,
    images: blogImages.map((img) => ({ ...img, url: `/uploads/${img.storageKey}` })),
  }, 201);
});

blogsRouter.put('/blogs/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ message: 'invalid id' }, 400);

  const body = await c.req.json<{ title?: string; content?: string; imageIds?: number[] }>();
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

  // 画像の関連を更新
  if (body.imageIds !== undefined) {
    const newImageIds = body.imageIds;
    // 既存の関連画像のうち新リストにないものを切り離す
    const currentImages = await db.select({ id: images.id })
      .from(images)
      .where(eq(images.blogId, id));
    const removedIds = currentImages.map((img) => img.id).filter((imgId) => !newImageIds.includes(imgId));
    if (removedIds.length > 0) {
      await db.update(images).set({ blogId: null }).where(inArray(images.id, removedIds));
    }
    // 新リストの画像をこのブログに関連付け
    if (newImageIds.length > 0) {
      await db.update(images).set({ blogId: id }).where(inArray(images.id, newImageIds));
    }
  }

  const blogImages = await db.select().from(images).where(eq(images.blogId, id));

  return c.json({
    ...item,
    images: blogImages.map((img) => ({ ...img, url: `/uploads/${img.storageKey}` })),
  });
});

blogsRouter.delete('/blogs/:id', async (c) => {
  const id = parseId(c.req.param('id'));
  if (!id) return c.json({ message: 'invalid id' }, 400);

  // 関連画像を取得してファイルを削除
  const blogImages = await db.select().from(images).where(eq(images.blogId, id));
  for (const img of blogImages) {
    const filePath = path.join(uploadsDir, img.storageKey);
    await fs.unlink(filePath).catch(() => { /* ファイルが存在しない場合は無視 */ });
  }
  if (blogImages.length > 0) {
    await db.delete(images).where(inArray(images.id, blogImages.map((img) => img.id)));
  }

  const [removed] = await db.delete(blogs).where(eq(blogs.id, id)).returning({ id: blogs.id });
  if (!removed) return c.json({ message: 'not found' }, 404);

  return c.body(null, 204);
});
