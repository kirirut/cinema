import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { favoritesApi, type Favorite } from '../api';
import { MovieListItem } from '../components/MovieListItem';
import { MovieListSkeleton } from '../components/MovieListSkeleton';
import { ErrorMessage } from '../components/ErrorMessage';
import { Breadcrumbs } from '../components/Breadcrumbs';

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
      <Breadcrumbs items={[{ label: 'Главная', to: '/' }, { label: 'Избранное' }]} />
      <div className="page-header">
        <h1>Избранное</h1>
        {!loading && favorites.length > 0 && (
          <span className="page-header__count">{favorites.length} фильмов</span>
        )}
      </div>

      {loading && <MovieListSkeleton count={4} />}
      {error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && (
        favorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon" aria-hidden>☆</div>
            <p className="empty-state__title">Список избранного пуст</p>
            <p className="empty-state__hint">
              Нажмите «В избранное» на странице любого фильма
            </p>
            <Link to="/" className="btn btn--accent">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="movie-list">
            {favorites.map((f, i) => (
              <MovieListItem key={f.movieId} movie={f.movie} index={i} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
