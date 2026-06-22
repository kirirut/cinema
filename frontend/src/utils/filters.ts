import type { Catalog } from '../api';
import type { ActiveFilter } from '../components/ActiveFilters';

function filterUrl(params: URLSearchParams): string {
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

export function buildActiveFilters(
  params: URLSearchParams,
  catalog: Catalog | null,
): ActiveFilter[] {
  const filters: ActiveFilter[] = [];

  const q = params.get('q');
  if (q) {
    const p = new URLSearchParams(params);
    p.delete('q');
    p.delete('page');
    filters.push({ key: 'q', label: `«${q}»`, removeUrl: filterUrl(p) });
  }

  const genreId = params.get('genreId');
  if (genreId) {
    const name = catalog?.genres.find((g) => g.id === Number(genreId))?.name ?? `Жанр #${genreId}`;
    const p = new URLSearchParams(params);
    p.delete('genreId');
    p.delete('page');
    filters.push({ key: 'genreId', label: name, removeUrl: filterUrl(p) });
  }

  const countryId = params.get('countryId');
  if (countryId) {
    const name = catalog?.countries.find((c) => c.id === Number(countryId))?.name ?? `Страна #${countryId}`;
    const p = new URLSearchParams(params);
    p.delete('countryId');
    p.delete('page');
    filters.push({ key: 'countryId', label: name, removeUrl: filterUrl(p) });
  }

  const tagId = params.get('tagId');
  if (tagId) {
    const name = catalog?.tags.find((t) => t.id === Number(tagId))?.name ?? `Тег #${tagId}`;
    const p = new URLSearchParams(params);
    p.delete('tagId');
    p.delete('page');
    filters.push({ key: 'tagId', label: name, removeUrl: filterUrl(p) });
  }

  const yearFrom = params.get('yearFrom');
  const yearTo = params.get('yearTo');
  if (yearFrom || yearTo) {
    const p = new URLSearchParams(params);
    p.delete('yearFrom');
    p.delete('yearTo');
    p.delete('page');
    const label = yearFrom && yearTo ? `${yearFrom}–${yearTo}` : yearFrom ? `с ${yearFrom}` : `до ${yearTo}`;
    filters.push({ key: 'year', label: `Год: ${label}`, removeUrl: filterUrl(p) });
  }

  return filters;
}

export function formatDuration(minutes: number | null | undefined): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} мин.`;
  return m > 0 ? `${h} ч ${m} мин.` : `${h} ч.`;
}
