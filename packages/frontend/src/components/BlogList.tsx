import { useState, useEffect, useCallback } from 'preact/hooks';
import { route } from 'preact-router';
import { api } from '../api.js';
import type { BlogSummary } from '../api.js';
import { BlogCard } from './BlogCard.js';
import { BlogForm } from './BlogForm.js';
import { SearchBar } from './SearchBar.js';
import { Toast } from './Toast.js';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

interface BlogListProps {
  path?: string;
}

export function BlogList(_props: BlogListProps) {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);

  const loadBlogs = useCallback(async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = q ? await api.search(q) : await api.list();
      setBlogs(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount and when query changes
  useEffect(() => {
    void loadBlogs(query || undefined);
  }, [query, loadBlogs]);

  const handleSearch = (q: string) => {
    setQuery(q);
  };

  const handleSelect = (id: number) => {
    route(`/blogs/${id}`);
  };

  const handleCreated = () => {
    setToast({ message: 'Post created!', type: 'success' });
    void loadBlogs(query || undefined);
  };

  const handleCreateError = (message: string) => {
    setToast({ message, type: 'error' });
  };

  const handleToastClose = useCallback(() => setToast(null), []);

  return (
    <div>
      <header>
        <h1>Blog</h1>
        <SearchBar onSearch={handleSearch} />
      </header>
      <main>
        <BlogForm onCreated={handleCreated} onError={handleCreateError} />
        {loading && <p class="status-text">Loading…</p>}
        {error && <p class="status-text error-text">Error: {error}</p>}
        {!loading && !error && blogs.length === 0 && (
          <p class="status-text">No posts found.</p>
        )}
        {!loading && !error && blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} onSelect={handleSelect} />
        ))}
      </main>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleToastClose}
        />
      )}
    </div>
  );
}
