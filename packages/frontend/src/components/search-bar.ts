export function mountSearchBar(
  container: HTMLElement,
  onSearch: (q: string) => void,
): void {
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Search blogs…';
  input.setAttribute('aria-label', 'Search blogs');

  let timer: ReturnType<typeof setTimeout>;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => onSearch(input.value.trim()), 300);
  });

  container.appendChild(input);
}
