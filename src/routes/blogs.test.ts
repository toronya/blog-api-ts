import { Hono } from 'hono';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { db } from '../db/client.js';
import { initDatabase } from '../db/init.js';
import { blogs, images } from '../db/schema.js';
import { blogsRouter } from './blogs.js';

// テスト用アプリ（サーバーを起動せずに fetch() で直接テスト）
const app = new Hono();
app.route('/', blogsRouter);

// テスト開始前にインメモリ DB のテーブルを作成
beforeAll(async () => {
  await initDatabase();
});

// 各テスト後にデータをクリア
afterEach(async () => {
  await db.delete(images);
  await db.delete(blogs);
});

// ---- ヘルパー ----

async function createBlog(title = 'テストタイトル', content = 'テスト本文') {
  const res = await app.request('/blogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });
  return res.json<{ id: number; title: string; content: string }>();
}

// ---- GET /health ----

describe('GET /health', () => {
  it('200 OK を返す', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const json = await res.json<{ ok: boolean }>();
    expect(json.ok).toBe(true);
  });
});

// ---- GET /blogs ----

describe('GET /blogs', () => {
  it('ブログが 0 件のとき空配列を返す', async () => {
    const res = await app.request('/blogs');
    expect(res.status).toBe(200);
    const json = await res.json<unknown[]>();
    expect(json).toEqual([]);
  });

  it('作成したブログを全件返す', async () => {
    await createBlog('タイトル A', '本文 A');
    await createBlog('タイトル B', '本文 B');

    const res = await app.request('/blogs');
    expect(res.status).toBe(200);
    const json = await res.json<{ title: string }[]>();
    expect(json).toHaveLength(2);
    // 新しい順（DESC）
    expect(json[0].title).toBe('タイトル B');
    expect(json[1].title).toBe('タイトル A');
  });
});

// ---- GET /blogs/search ----

describe('GET /blogs/search', () => {
  it('q パラメータなしで 400 を返す', async () => {
    const res = await app.request('/blogs/search');
    expect(res.status).toBe(400);
    const json = await res.json<{ message: string }>();
    expect(json.message).toMatch(/q/);
  });

  it('タイトルで検索できる', async () => {
    await createBlog('Hono ガイド', '本文');
    await createBlog('Drizzle 入門', '本文');

    const res = await app.request('/blogs/search?q=Hono');
    expect(res.status).toBe(200);
    const json = await res.json<{ title: string }[]>();
    expect(json).toHaveLength(1);
    expect(json[0].title).toBe('Hono ガイド');
  });

  it('本文で検索できる', async () => {
    await createBlog('タイトル', 'SQLite の使い方');
    await createBlog('タイトル 2', '全く別の内容');

    const res = await app.request('/blogs/search?q=SQLite');
    expect(res.status).toBe(200);
    const json = await res.json<{ title: string }[]>();
    expect(json).toHaveLength(1);
    expect(json[0].title).toBe('タイトル');
  });

  it('ヒットしない場合は空配列を返す', async () => {
    await createBlog('タイトル', '本文');

    const res = await app.request('/blogs/search?q=存在しないキーワード');
    expect(res.status).toBe(200);
    const json = await res.json<unknown[]>();
    expect(json).toEqual([]);
  });
});

// ---- GET /blogs/:id ----

describe('GET /blogs/:id', () => {
  it('無効な id で 400 を返す', async () => {
    const res = await app.request('/blogs/abc');
    expect(res.status).toBe(400);
    const json = await res.json<{ message: string }>();
    expect(json.message).toBe('invalid id');
  });

  it('存在しない id で 404 を返す', async () => {
    const res = await app.request('/blogs/9999');
    expect(res.status).toBe(404);
    const json = await res.json<{ message: string }>();
    expect(json.message).toBe('not found');
  });

  it('存在するブログを返す', async () => {
    const created = await createBlog('詳細テスト', '詳細本文');

    const res = await app.request(`/blogs/${created.id}`);
    expect(res.status).toBe(200);
    const json = await res.json<{ id: number; title: string; content: string; images: unknown[] }>();
    expect(json.id).toBe(created.id);
    expect(json.title).toBe('詳細テスト');
    expect(json.content).toBe('詳細本文');
    expect(json.images).toEqual([]);
  });
});

// ---- POST /blogs ----

describe('POST /blogs', () => {
  it('title が空のとき 400 を返す', async () => {
    const res = await app.request('/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '', content: '本文' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json<{ message: string }>();
    expect(json.message).toMatch(/required/);
  });

  it('content が空のとき 400 を返す', async () => {
    const res = await app.request('/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'タイトル', content: '' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json<{ message: string }>();
    expect(json.message).toMatch(/required/);
  });

  it('正常にブログを作成して 201 を返す', async () => {
    const res = await app.request('/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '新規ブログ', content: 'コンテンツ' }),
    });
    expect(res.status).toBe(201);
    const json = await res.json<{ id: number; title: string; content: string; images: unknown[] }>();
    expect(json.id).toBeTypeOf('number');
    expect(json.title).toBe('新規ブログ');
    expect(json.content).toBe('コンテンツ');
    expect(json.images).toEqual([]);
  });

  it('title と content の前後の空白をトリムする', async () => {
    const res = await app.request('/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '  スペース  ', content: '  本文  ' }),
    });
    expect(res.status).toBe(201);
    const json = await res.json<{ title: string; content: string }>();
    expect(json.title).toBe('スペース');
    expect(json.content).toBe('本文');
  });
});

// ---- PUT /blogs/:id ----

describe('PUT /blogs/:id', () => {
  it('無効な id で 400 を返す', async () => {
    const res = await app.request('/blogs/abc', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'タイトル', content: '本文' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json<{ message: string }>();
    expect(json.message).toBe('invalid id');
  });

  it('title が空のとき 400 を返す', async () => {
    const created = await createBlog();
    const res = await app.request(`/blogs/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '', content: '本文' }),
    });
    expect(res.status).toBe(400);
  });

  it('存在しない id で 404 を返す', async () => {
    const res = await app.request('/blogs/9999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'タイトル', content: '本文' }),
    });
    expect(res.status).toBe(404);
    const json = await res.json<{ message: string }>();
    expect(json.message).toBe('not found');
  });

  it('正常にブログを更新して 200 を返す', async () => {
    const created = await createBlog('元タイトル', '元本文');

    const res = await app.request(`/blogs/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '更新タイトル', content: '更新本文' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json<{ id: number; title: string; content: string }>();
    expect(json.id).toBe(created.id);
    expect(json.title).toBe('更新タイトル');
    expect(json.content).toBe('更新本文');
  });
});

// ---- DELETE /blogs/:id ----

describe('DELETE /blogs/:id', () => {
  it('無効な id で 400 を返す', async () => {
    const res = await app.request('/blogs/abc', { method: 'DELETE' });
    expect(res.status).toBe(400);
    const json = await res.json<{ message: string }>();
    expect(json.message).toBe('invalid id');
  });

  it('存在しない id で 404 を返す', async () => {
    const res = await app.request('/blogs/9999', { method: 'DELETE' });
    expect(res.status).toBe(404);
    const json = await res.json<{ message: string }>();
    expect(json.message).toBe('not found');
  });

  it('正常にブログを削除して 204 を返す', async () => {
    const created = await createBlog();

    const res = await app.request(`/blogs/${created.id}`, { method: 'DELETE' });
    expect(res.status).toBe(204);

    // 削除後は 404 になることを確認
    const getRes = await app.request(`/blogs/${created.id}`);
    expect(getRes.status).toBe(404);
  });
});
