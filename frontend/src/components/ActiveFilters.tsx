import { Link } from 'react-router-dom';

export interface ActiveFilter {
  key: string;
  label: string;
  removeUrl: string;
}

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onClearAll?: () => void;
}

export function ActiveFilters({ filters, onClearAll }: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="active-filters">
      <span className="active-filters__label">Фильтры:</span>
      <ul className="active-filters__list">
        {filters.map((f) => (
          <li key={f.key}>
            <Link to={f.removeUrl} className="active-filters__chip" title="Убрать фильтр">
              {f.label}
              <span className="active-filters__remove" aria-hidden>×</span>
            </Link>
          </li>
        ))}
      </ul>
      {filters.length > 1 && onClearAll && (
        <button type="button" className="active-filters__clear" onClick={onClearAll}>
          Сбросить все
        </button>
      )}
    </div>
  );
}
