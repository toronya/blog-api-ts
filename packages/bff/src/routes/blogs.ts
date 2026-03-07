import { Hono } from 'hono';
import { cache } from '../cache/memory.js';
import { type Blog, type BlogSummary, toDetail, toSummary } from '../types/blog.js';

const API_BASE = process.env.API_BASE ?? 'http://localhost:3000';

export const blogsRouter = new Hono();

blogsRouter.get('/blogs', async (c) => {
  try {
    const cached = cache.get<BlogSummary[]>('blogs:list');
    if (cached) return c.json(cached);

    const res = await fetch(`${API_BASE}/blogs`);
    if (!res.ok) return c.json({ message: 'upstream error' }, 502);

    const blogs: Blog[] = await res.json();
    const summaries = blogs.map(toSummary);
    cache.set('blogs:list', summaries, 30);
    return c.json(summaries);
  } catch {
    return c.json({ message: 'upstream unreachable' }, 502);
  }
});

blogsRouter.get('/blogs/search', async (c) => {
  try {
    const q = c.req.query('q');
    if (!q) return c.json({ message: 'query parameter "q" is required' }, 400);

    const res = await fetch(`${API_BASE}/blogs/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return c.json({ message: 'upstream error' }, 502);

    const blogs: Blog[] = await res.json();
    return c.json(blogs.map(toSummary));
  } catch {
    return c.json({ message: 'upstream unreachable' }, 502);
  }
});

blogsRouter.get('/blogs/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const cacheKey = `blogs:detail:${id}`;
    const cached = cache.get(cacheKey);
    if (cached) return c.json(cached);

    const res = await fetch(`${API_BASE}/blogs/${id}`);
    if (res.status === 404) return c.json({ message: 'not found' }, 404);
    if (!res.ok) return c.json({ message: 'upstream error' }, 502);

    const blog: Blog = await res.json();
    const detail = toDetail(blog);
    cache.set(cacheKey, detail, 60);
    return c.json(detail);
  } catch {
    return c.json({ message: 'upstream unreachable' }, 502);
  }
});

blogsRouter.post('/blogs', async (c) => {
  try {
    const body = await c.req.json();
    const res = await fetch(`${API_BASE}/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    cache.invalidate('blogs:');
    const data = await res.json();
    return c.json(data, res.status as Parameters<typeof c.json>[1]);
  } catch {
    return c.json({ message: 'upstream unreachable' }, 502);
  }
});

blogsRouter.put('/blogs/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const res = await fetch(`${API_BASE}/blogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    cache.invalidate('blogs:');
    const data = await res.json();
    return c.json(data, res.status as Parameters<typeof c.json>[1]);
  } catch {
    return c.json({ message: 'upstream unreachable' }, 502);
  }
});

blogsRouter.delete('/blogs/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const res = await fetch(`${API_BASE}/blogs/${id}`, { method: 'DELETE' });
    cache.invalidate('blogs:');
    if (res.status === 204) return c.body(null, 204);
    const data = await res.json();
    return c.json(data, res.status as Parameters<typeof c.json>[1]);
  } catch {
    return c.json({ message: 'upstream unreachable' }, 502);
  }
});
