import { useCallback, useEffect, useState } from 'react';
import { favoritesApi, type Favorite } from '../api';
import { MovieListItem } from '../components/MovieListItem';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await favoritesApi.list();
      setFavorites(data);
    } catch {
      setError('Не удалось загрузить избранное');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page">
      <h1>Избранное</h1>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && (
        favorites.length === 0 ? (
          <div className="empty-state">
            <p>Список избранного пуст</p>
            <p className="empty-state__hint">Добавляйте фильмы со страницы просмотра</p>
          </div>
        ) : (
          <div className="movie-list">
            {favorites.map((f) => (
              <MovieListItem key={f.movieId} movie={f.movie} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
