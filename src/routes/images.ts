import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { db } from '../db/client.js';
import { images } from '../db/schema.js';

// 許可する MIME タイプ
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// 最大ファイルサイズ: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadsDir = path.resolve(process.cwd(), 'data', 'uploads');

// アップロードディレクトリを自動作成
await fs.mkdir(uploadsDir, { recursive: true });

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
  };
  return map[mimeType] ?? '.bin';
}

export const imagesRouter = new Hono();

// 画像アップロード: POST /images
imagesRouter.post('/images', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];

  if (!file || typeof file === 'string') {
    return c.json({ message: 'file フィールドが必要です' }, 400);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return c.json(
      { message: `対応していない画像形式です: ${file.type}。対応形式: ${ALLOWED_MIME_TYPES.join(', ')}` },
      400,
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ message: `ファイルサイズが大きすぎます。上限: ${MAX_FILE_SIZE / 1024 / 1024}MB` }, 400);
  }

  const ext = getExtension(file.type);
  const storageKey = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(uploadsDir, storageKey);

  const buffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(buffer));

  const [created] = await db.insert(images).values({
    storageKey,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    createdAt: new Date(),
  }).returning();

  return c.json({ ...created, url: `/uploads/${storageKey}` }, 201);
});

// 画像静的配信: GET /uploads/:storageKey
imagesRouter.get('/uploads/:storageKey', async (c) => {
  const storageKey = c.req.param('storageKey');

  // パストラバーサルを防ぐためにファイル名のみを使用
  const safeName = path.basename(storageKey);
  const filePath = path.join(uploadsDir, safeName);

  try {
    const data = await fs.readFile(filePath);
    const [image] = await db.select({ mimeType: images.mimeType })
      .from(images)
      .where(eq(images.storageKey, safeName))
      .limit(1);

    const contentType = image?.mimeType ?? 'application/octet-stream';
    return new Response(data, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch {
    return c.json({ message: 'not found' }, 404);
  }
});
