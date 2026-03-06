import { useRef } from 'preact/hooks';

interface SearchBarProps {
  onSearch: (q: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = (e: Event) => {
    const q = (e.target as HTMLInputElement).value.trim();
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(q), 300);
  };

  return (
    <div id="search-bar">
      <input
        type="search"
        placeholder="Search blogs…"
        aria-label="Search blogs"
        onInput={handleInput}
      />
    </div>
  );
}
