import type { BlogSummary } from '../api.js';
import { escapeHtml } from '../utils.js';

export function renderBlogList(
  container: HTMLElement,
  blogs: BlogSummary[],
  onSelect: (id: number) => void,
): void {
  container.innerHTML = '';

  if (blogs.length === 0) {
    container.innerHTML = '<p>No posts found.</p>';
    return;
  }

  for (const blog of blogs) {
    const card = document.createElement('article');
    card.className = 'blog-card';
    card.innerHTML = `
      <h2>${escapeHtml(blog.title)}</h2>
      <p>${escapeHtml(blog.excerpt)}</p>
      <time datetime="${escapeHtml(blog.createdAt)}">${new Date(blog.createdAt).toLocaleDateString()}</time>
    `;
    card.addEventListener('click', () => onSelect(blog.id));
    container.appendChild(card);
  }
}
