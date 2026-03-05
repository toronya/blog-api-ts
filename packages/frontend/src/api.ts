export interface BlogSummary {
  id: number;
  title: string;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogDetail {
  id: number;
  title: string;
  contentHtml: string;
  createdAt: string;
  updatedAt: string;
}

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  list(): Promise<BlogSummary[]> {
    return request<BlogSummary[]>('/blogs');
  },

  get(id: number): Promise<BlogDetail> {
    return request<BlogDetail>(`/blogs/${id}`);
  },

  search(q: string): Promise<BlogSummary[]> {
    return request<BlogSummary[]>(`/blogs/search?q=${encodeURIComponent(q)}`);
  },

  create(title: string, content: string): Promise<BlogDetail> {
    return request<BlogDetail>('/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
  },

  update(id: number, title: string, content: string): Promise<BlogDetail> {
    return request<BlogDetail>(`/blogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
  },

  delete(id: number): Promise<void> {
    return request<void>(`/blogs/${id}`, { method: 'DELETE' });
  },
};
