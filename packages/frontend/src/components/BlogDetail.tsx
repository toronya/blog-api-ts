import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { api } from '../api.js';
import type { BlogDetail as BlogDetailType } from '../api.js';

interface BlogDetailProps {
  path?: string;
  id?: string;
}

export function BlogDetail({ id }: BlogDetailProps) {
  const [blog, setBlog] = useState<BlogDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const numId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (isNaN(numId)) {
      setError('Invalid blog ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .get(numId)
      .then((data) => {
        setBlog(data);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, [numId]);

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      await api.delete(numId);
      route('/');
    } catch (e) {
      alert(`Error: ${(e as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div>
        <header>
          <h1>Blog</h1>
        </header>
        <main>
          <p class="status-text">Loading…</p>
        </main>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div>
        <header>
          <h1>Blog</h1>
        </header>
        <main>
          <p class="status-text error-text">Error: {error ?? 'Not found'}</p>
          <button class="btn-back" onClick={() => route('/')}>← Back</button>
        </main>
      </div>
    );
  }

  const date = new Date(blog.createdAt).toLocaleDateString();

  return (
    <div>
      <header>
        <h1>Blog</h1>
      </header>
      <main>
        <div class="blog-detail">
          <div class="blog-detail-actions">
            <button class="btn-back" onClick={() => route('/')}>← Back</button>
            <button class="btn-danger" onClick={handleDelete}>Delete</button>
          </div>
          <h2>{blog.title}</h2>
          <time dateTime={blog.createdAt}>{date}</time>
          <div
            class="content"
            dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
          />
          {blog.images && blog.images.length > 0 && (
            <div class="blog-detail-images">
              {blog.images.map((img) => (
                <figure key={img.id} class="blog-detail-image">
                  <img
                    src={`/api${img.url}`}
                    alt={img.originalName}
                    loading="lazy"
                  />
                  <figcaption>{img.originalName}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
