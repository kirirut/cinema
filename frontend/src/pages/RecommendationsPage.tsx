import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, recommendationsApi, type MovieSummary } from '../api';
import { MovieListItem } from '../components/MovieListItem';
import { MovieListSkeleton } from '../components/MovieListSkeleton';
import { ErrorMessage } from '../components/ErrorMessage';
import { Breadcrumbs } from '../components/Breadcrumbs';

function resolveError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Сессия истекла — войдите снова';
    if (err.status === 429) return 'Слишком много запросов. Подождите минуту и повторите';
    if (err.status >= 500) return 'Ошибка сервера при загрузке рекомендаций';
    return err.detail;
  }
  return 'Не удалось загрузить рекомендации. Проверьте, что бэкенд запущен на порту 8080.';
}

export function RecommendationsPage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await recommendationsApi.list();
      setMovies(data);
    } catch (err) {
      const message = resolveError(err);
      setError(message);
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login', { state: { from: '/recommendations' }, replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Главная', to: '/' }, { label: 'Рекомендации' }]} />
      <div className="page-header">
        <div className="page-header__main">
          <h1>Рекомендации</h1>
          <p className="page-subtitle">Подборка на основе ваших высоких оценок</p>
        </div>
        {!loading && movies.length > 0 && (
          <span className="page-header__count">{movies.length} фильмов</span>
        )}
      </div>

      {loading && <MovieListSkeleton count={5} />}
      {error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && (
        movies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon" aria-hidden>✦</div>
            <p className="empty-state__title">Пока нет рекомендаций</p>
            <p className="empty-state__hint">
              Оцените несколько фильмов на 4–5 звёзд — и мы подберём похожие
            </p>
            <Link to="/" className="btn btn--accent">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="movie-list">
            {movies.map((movie, i) => (
              <MovieListItem key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
