import type { BlogSummary } from '../api.js';

interface BlogCardProps {
  blog: BlogSummary;
  onSelect: (id: number) => void;
}

export function BlogCard({ blog, onSelect }: BlogCardProps) {
  return (
    <article class="blog-card" onClick={() => onSelect(blog.id)}>
      <h2>{blog.title}</h2>
      <p>{blog.excerpt}</p>
      <time dateTime={blog.createdAt}>{new Date(blog.createdAt).toLocaleDateString()}</time>
    </article>
  );
}
