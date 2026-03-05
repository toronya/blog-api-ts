export function mountBlogForm(
  container: HTMLElement,
  onSubmit: (title: string, content: string) => void | Promise<void>,
): void {
  container.innerHTML = `
    <div class="blog-form">
      <h2>New Post</h2>
      <input type="text" id="form-title" placeholder="Title" />
      <textarea id="form-content" placeholder="Content"></textarea>
      <button type="button" id="form-submit">Post</button>
    </div>
  `;

  const titleInput = container.querySelector<HTMLInputElement>('#form-title')!;
  const contentInput = container.querySelector<HTMLTextAreaElement>('#form-content')!;
  const submitBtn = container.querySelector<HTMLButtonElement>('#form-submit')!;

  submitBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    if (!title || !content) {
      alert('Title and content are required.');
      return;
    }
    Promise.resolve(onSubmit(title, content)).catch((e) => {
      alert(`Error: ${(e as Error).message}`);
    });
    titleInput.value = '';
    contentInput.value = '';
  });
}
