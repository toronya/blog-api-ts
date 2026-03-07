import { Hono } from 'hono';

const API_BASE = process.env.API_BASE ?? 'http://localhost:3000';

export const imagesRouter = new Hono();

// 画像アップロードプロキシ: POST /images
// multipart/form-data をそのまま上流 API に転送
imagesRouter.post('/images', async (c) => {
  try {
    const contentType = c.req.header('content-type') ?? '';
    // ボディをバッファに読み込んでから転送する
    const bodyBuffer = await c.req.arrayBuffer();
    const res = await fetch(`${API_BASE}/images`, {
      method: 'POST',
      headers: { 'content-type': contentType },
      body: bodyBuffer,
    });
    const data = await res.json();
    return c.json(data, res.status as Parameters<typeof c.json>[1]);
  } catch {
    return c.json({ message: 'upstream unreachable' }, 502);
  }
});

// 画像配信プロキシ: GET /uploads/:storageKey
imagesRouter.get('/uploads/:storageKey', async (c) => {
  try {
    const key = c.req.param('storageKey');
    const res = await fetch(`${API_BASE}/uploads/${encodeURIComponent(key)}`);
    if (!res.ok) return c.json({ message: 'not found' }, 404);
    return new Response(res.body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') ?? 'application/octet-stream',
      },
    });
  } catch {
    return c.json({ message: 'upstream unreachable' }, 502);
  }
});
