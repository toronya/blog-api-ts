export interface Blog {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

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

export function toSummary(blog: Blog): BlogSummary {
  return {
    id: blog.id,
    title: blog.title,
    excerpt: blog.content.length > 120
      ? blog.content.slice(0, 120) + '…'
      : blog.content,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function toDetail(blog: Blog): BlogDetail {
  return {
    id: blog.id,
    title: blog.title,
    contentHtml: escapeHtml(blog.content).replace(/\n/g, '<br>'),
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
}
