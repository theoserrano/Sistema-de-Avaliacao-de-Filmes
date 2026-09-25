interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      className="search-input"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Buscar por título"
      aria-label="Buscar filmes"
    />
  );
}
