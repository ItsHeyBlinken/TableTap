import { CARD_SPORTS } from "../lib/stockOptions";

interface SearchFiltersProps {
  search: string;
  sport: string;
  status: string;
  graded: string;
  onSearchChange: (v: string) => void;
  onSportChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onGradedChange: (v: string) => void;
}

export function SearchFilters({
  search,
  sport,
  status,
  graded,
  onSearchChange,
  onSportChange,
  onStatusChange,
  onGradedChange,
}: SearchFiltersProps) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input
        type="search"
        placeholder="Search player, brand, team..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="input-mobile"
      />
      <select value={sport} onChange={(e) => onSportChange(e.target.value)} className="input-mobile">
        <option value="">All sports</option>
        {CARD_SPORTS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="input-mobile"
      >
        <option value="">All status</option>
        <option value="active">Unsold</option>
        <option value="sold">Sold</option>
      </select>
      <select
        value={graded}
        onChange={(e) => onGradedChange(e.target.value)}
        className="input-mobile"
      >
        <option value="">Graded & raw</option>
        <option value="true">Graded only</option>
        <option value="false">Raw only</option>
      </select>
    </div>
  );
}
