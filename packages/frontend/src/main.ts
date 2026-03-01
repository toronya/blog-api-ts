import { api } from './api.js';
import { renderBlogList } from './components/blog-list.js';
import { mountBlogForm } from './components/blog-form.js';
import { mountSearchBar } from './components/search-bar.js';

const listEl = document.getElementById('blog-list')!;
const detailEl = document.getElementById('blog-detail')!;
const formEl = document.getElementById('blog-form')!;
const searchEl = document.getElementById('search-bar')!;

async function showList(query?: string): Promise<void> {
  detailEl.innerHTML = '';
  detailEl.hidden = true;
  listEl.hidden = false;
  formEl.hidden = false;

  try {
    const blogs = query ? await api.search(query) : await api.list();
    renderBlogList(listEl, blogs, showDetail);
  } catch (e) {
    listEl.innerHTML = `<p>Error: ${(e as Error).message}</p>`;
  }
}

async function showDetail(id: number): Promise<void> {
  listEl.hidden = true;
  formEl.hidden = true;
  detailEl.hidden = false;
  detailEl.innerHTML = '<p>Loading…</p>';

  try {
    const blog = await api.get(id);
    const date = new Date(blog.createdAt).toLocaleDateString();

    detailEl.innerHTML = `
      <div class="blog-detail">
        <button class="btn-back" id="btn-back">← Back</button>
        <button class="btn-danger" id="btn-delete">Delete</button>
        <h2>${escapeHtml(blog.title)}</h2>
        <time datetime="${escapeHtml(blog.createdAt)}">${escapeHtml(date)}</time>
        <div class="content">${blog.contentHtml}</div>
      </div>
    `;

    detailEl.querySelector('#btn-back')!.addEventListener('click', () => showList());
    detailEl.querySelector('#btn-delete')!.addEventListener('click', async () => {
      if (!confirm('Delete this post?')) return;
      await api.delete(id);
      showList();
    });
  } catch (e) {
    detailEl.innerHTML = `<p>Error: ${(e as Error).message}</p>`;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Mount search bar
mountSearchBar(searchEl, (q) => showList(q || undefined));

// Mount create form
mountBlogForm(formEl, async (title, content) => {
  try {
    await api.create(title, content);
    showList();
  } catch (e) {
    alert(`Error: ${(e as Error).message}`);
  }
});

// Initial load
showList();
