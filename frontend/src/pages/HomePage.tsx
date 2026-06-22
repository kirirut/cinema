import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { moviesApi, type Page, type MovieSummary } from '../api';
import { MovieListItem } from '../components/MovieListItem';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export function HomePage() {
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
    } catch {
      setError('Не удалось загрузить каталог');
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

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  }

  const title = q
    ? `Поиск: «${q}»`
    : genreId
      ? 'Фильмы по жанру'
      : countryId
        ? 'Фильмы по стране'
        : 'Каталог фильмов';

  return (
    <div className="page">
      <div className="page-header">
        <h1>{title}</h1>
        {data && (
          <span className="page-header__count">{data.totalElements} фильмов</span>
        )}
      </div>

      <div className="filters-bar">
        <label className="filters-bar__field">
          <span>Год от</span>
          <input
            type="number"
            min={1900}
            max={2100}
            placeholder="1900"
            value={yearFrom ?? ''}
            onChange={(e) => updateFilter('yearFrom', e.target.value)}
          />
        </label>
        <label className="filters-bar__field">
          <span>до</span>
          <input
            type="number"
            min={1900}
            max={2100}
            placeholder="2026"
            value={yearTo ?? ''}
            onChange={(e) => updateFilter('yearTo', e.target.value)}
          />
        </label>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && data && (
        <>
          {data.content.length === 0 ? (
            <div className="empty-state">
              <p>Фильмы не найдены</p>
              <p className="empty-state__hint">
                Попробуйте изменить фильтры или зарегистрируйтесь — администратор может добавить фильмы через API.
              </p>
            </div>
          ) : (
            <div className="movie-list">
              {data.content.map((movie) => (
                <MovieListItem key={movie.id} movie={movie} />
              ))}
            </div>
          )}
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
