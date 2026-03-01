import type { BlogSummary } from '../api.js';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
