import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recommendationsApi, type MovieSummary } from '../api';
import { MovieListItem } from '../components/MovieListItem';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export function RecommendationsPage() {
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await recommendationsApi.list();
      setMovies(data);
    } catch {
      setError('Не удалось загрузить рекомендации');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page">
      <h1>Рекомендации</h1>
      <p className="page-subtitle">
        Подборка на основе ваших высоких оценок
      </p>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && (
        movies.length === 0 ? (
          <div className="empty-state">
            <p>Пока нет рекомендаций</p>
            <p className="empty-state__hint">
              Оцените несколько фильмов на 4–5 звёзд — и мы подберём похожие.{' '}
              <Link to="/">Перейти в каталог</Link>
            </p>
          </div>
        ) : (
          <div className="movie-list">
            {movies.map((movie) => (
              <MovieListItem key={movie.id} movie={movie} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
