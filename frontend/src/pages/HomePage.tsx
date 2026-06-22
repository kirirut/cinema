import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ApiError, moviesApi, type Page, type MovieSummary } from '../api';
import type { LayoutContext } from '../components/Layout';
import { MovieListItem } from '../components/MovieListItem';
import { MovieListSkeleton } from '../components/MovieListSkeleton';
import { Pagination } from '../components/Pagination';
import { ErrorMessage } from '../components/ErrorMessage';
import { ActiveFilters } from '../components/ActiveFilters';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { buildActiveFilters } from '../utils/filters';

export function HomePage() {
  const { catalog } = useOutletContext<LayoutContext>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<Page<MovieSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const q = searchParams.get('q') ?? undefined;
  const genreId = searchParams.get('genreId');
  const countryId = searchParams.get('countryId');
  const tagId = searchParams.get('tagId');
  const page = Number(searchParams.get('page') ?? '0');
  const yearFrom = searchParams.get('yearFrom');
  const yearTo = searchParams.get('yearTo');

  const activeFilters = useMemo(
    () => buildActiveFilters(searchParams, catalog),
    [searchParams, catalog],
  );

  const pageTitle = useMemo(() => {
    if (q) return `Поиск: «${q}»`;
    if (genreId) return catalog?.genres.find((g) => g.id === Number(genreId))?.name ?? 'Жанр';
    if (countryId) return catalog?.countries.find((c) => c.id === Number(countryId))?.name ?? 'Страна';
    if (tagId) return catalog?.tags.find((t) => t.id === Number(tagId))?.name ?? 'Подборка';
    return 'Каталог фильмов';
  }, [q, genreId, countryId, tagId, catalog]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await moviesApi.search({
        q,
        genreId: genreId ? Number(genreId) : undefined,
        countryId: countryId ? Number(countryId) : undefined,
        tagId: tagId ? Number(tagId) : undefined,
        yearFrom: yearFrom ? Number(yearFrom) : undefined,
        yearTo: yearTo ? Number(yearTo) : undefined,
        page,
        size: 20,
      });
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Не удалось загрузить каталог. Убедитесь, что бэкенд запущен на порту 8080.');
      }
    } finally {
      setLoading(false);
    }
  }, [q, genreId, countryId, tagId, page, yearFrom, yearTo]);

  useEffect(() => {
    load();
  }, [load]);

  function setPage(newPage: number) {
    const params = new URLSearchParams(searchParams);
    if (newPage === 0) params.delete('page');
    else params.set('page', String(newPage));
    setSearchParams(params);
  }

  function applyYearFilter() {
    const fromEl = document.getElementById('year-from') as HTMLInputElement | null;
    const toEl = document.getElementById('year-to') as HTMLInputElement | null;
    const params = new URLSearchParams(searchParams);
    const from = fromEl?.value.trim();
    const to = toEl?.value.trim();
    if (from) params.set('yearFrom', from);
    else params.delete('yearFrom');
    if (to) params.set('yearTo', to);
    else params.delete('yearTo');
    params.delete('page');
    setSearchParams(params);
  }

  function clearAllFilters() {
    setSearchParams({});
  }

  const startIndex = data ? data.page * data.size + 1 : 0;
  const endIndex = data ? Math.min((data.page + 1) * data.size, data.totalElements) : 0;

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Главная', to: '/' }, { label: pageTitle }]} />

      <div className="page-header">
        <div className="page-header__main">
          <h1>{pageTitle}</h1>
          {data && data.totalElements > 0 && (
            <p className="page-header__range">
              Показано {startIndex}–{endIndex} из {data.totalElements}
            </p>
          )}
        </div>
        {data && (
          <span className="page-header__count">{data.totalElements} фильмов</span>
        )}
      </div>

      <ActiveFilters filters={activeFilters} onClearAll={clearAllFilters} />

      <div className="filters-bar">
        <span className="filters-bar__label">Год выпуска</span>
        <label className="filters-bar__field">
          <span className="visually-hidden">От</span>
          <input
            id="year-from"
            type="number"
            min={1900}
            max={2100}
            placeholder="от"
            defaultValue={yearFrom ?? ''}
            key={`from-${yearFrom}`}
          />
        </label>
        <span className="filters-bar__dash">—</span>
        <label className="filters-bar__field">
          <span className="visually-hidden">До</span>
          <input
            id="year-to"
            type="number"
            min={1900}
            max={2100}
            placeholder="до"
            defaultValue={yearTo ?? ''}
            key={`to-${yearTo}`}
          />
        </label>
        <button type="button" className="btn btn--ghost btn--sm" onClick={applyYearFilter}>
          Применить
        </button>
      </div>

      {loading && <MovieListSkeleton />}
      {error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && data && (
        <>
          {data.content.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon" aria-hidden>🎬</div>
              <p className="empty-state__title">Фильмы не найдены</p>
              <p className="empty-state__hint">
                Попробуйте изменить фильтры или сбросить поиск.
              </p>
              {activeFilters.length > 0 && (
                <button type="button" className="btn btn--accent" onClick={clearAllFilters}>
                  Сбросить фильтры
                </button>
              )}
            </div>
          ) : (
            <div className="movie-list">
              {data.content.map((movie, i) => (
                <MovieListItem
                  key={movie.id}
                  movie={movie}
                  index={data.page * data.size + i}
                />
              ))}
            </div>
          )}
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
