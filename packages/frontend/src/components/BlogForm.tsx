import { useRef, useState } from 'preact/hooks';
import { api } from '../api.js';
import type { BlogImage } from '../api.js';

interface BlogFormProps {
  onCreated: () => void;
  onError: (message: string) => void;
}

export function BlogForm({ onCreated, onError }: BlogFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      setSelectedFiles(Array.from(input.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // すべてのファイルが削除された場合のみ input をリセット
      if (updated.length === 0 && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      onError('Title and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      // 画像を先にアップロードして ID を収集
      const uploadedImages: BlogImage[] = [];
      for (const file of selectedFiles) {
        const img = await api.uploadImage(file);
        uploadedImages.push(img);
      }

      await api.create(title.trim(), content.trim(), uploadedImages.map((img) => img.id));
      setTitle('');
      setContent('');
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      <div class="blog-form-images">
        <label class="blog-form-file-label">
          <span>📎 画像を選択</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleFileChange}
            disabled={submitting}
          />
        </label>
        {selectedFiles.length > 0 && (
          <ul class="blog-form-file-list">
            {selectedFiles.map((file, i) => (
              <li key={i}>
                <span>{file.name}</span>
                <button
                  type="button"
                  class="btn-remove-file"
                  onClick={() => handleRemoveFile(i)}
                  disabled={submitting}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="button" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Posting…' : 'Post'}
      </button>
    </div>
  );
}
