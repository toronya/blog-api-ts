import { useState } from 'preact/hooks';
import { api } from '../api.js';

interface BlogFormProps {
  onCreated: () => void;
  onError: (message: string) => void;
}

export function BlogForm({ onCreated, onError }: BlogFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      onError('Title and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.create(title.trim(), content.trim());
      setTitle('');
      setContent('');
      onCreated();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div class="blog-form">
      <h2>New Post</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
        disabled={submitting}
      />
      <textarea
        placeholder="Content"
        value={content}
        onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
        disabled={submitting}
      />
      <button type="button" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Posting…' : 'Post'}
      </button>
    </div>
  );
}
