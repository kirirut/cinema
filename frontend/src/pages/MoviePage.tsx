import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ApiError,
  favoritesApi,
  moviesApi,
  ratingsApi,
  reviewsApi,
  type MovieDetail,
  type Rating,
  type Review,
} from '../api';
import { useAuth } from '../context/AuthContext';
import { PosterWithFallback } from '../components/Poster';
import { StarRating, formatRating } from '../components/StarRating';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState<Rating | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const load = useCallback(async () => {
    if (!movieId || Number.isNaN(movieId)) return;
    setLoading(true);
    setError('');
    try {
      const [detail, revs] = await Promise.all([
        moviesApi.getById(movieId),
        reviewsApi.list(movieId),
      ]);
      setMovie(detail);
      setReviews(revs);

      if (isAuthenticated) {
        const [rating, favs] = await Promise.all([
          ratingsApi.myRating(movieId),
          favoritesApi.list().catch(() => []),
        ]);
        setMyRating(rating);
        setIsFavorite(favs.some((f) => f.movieId === movieId));
      }
    } catch {
      setError('Фильм не найден');
    } finally {
      setLoading(false);
    }
  }, [movieId, isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRate(score: number) {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/movie/${movieId}` } });
      return;
    }
    try {
      const rating = await ratingsApi.rate(movieId, score);
      setMyRating(rating);
      const updated = await moviesApi.getById(movieId);
      setMovie(updated);
      flash('Оценка сохранена');
    } catch (err) {
      flash(err instanceof ApiError ? err.detail : 'Ошибка', true);
    }
  }

  async function toggleFavorite() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/movie/${movieId}` } });
      return;
    }
    try {
      if (isFavorite) {
        await favoritesApi.remove(movieId);
        setIsFavorite(false);
        flash('Удалено из избранного');
      } else {
        await favoritesApi.add(movieId);
        setIsFavorite(true);
        flash('Добавлено в избранное');
      }
    } catch (err) {
      flash(err instanceof ApiError ? err.detail : 'Ошибка', true);
    }
  }

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/movie/${movieId}` } });
      return;
    }
    setReviewError('');
    try {
      const existing = reviews.find((r) => r.userId === user?.id);
      if (existing) {
        const updated = await reviewsApi.update(existing.id, reviewTitle, reviewBody);
        setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        const created = await reviewsApi.create(movieId, reviewTitle, reviewBody);
        setReviews((prev) => [created, ...prev]);
      }
      setReviewTitle('');
      setReviewBody('');
      flash('Отзыв сохранён');
    } catch (err) {
      setReviewError(err instanceof ApiError ? err.detail : 'Ошибка сохранения');
    }
  }

  async function deleteReview(reviewId: number) {
    try {
      await reviewsApi.remove(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      flash('Отзыв удалён');
    } catch (err) {
      flash(err instanceof ApiError ? err.detail : 'Ошибка', true);
    }
  }

  function flash(msg: string, isError = false) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
    if (isError) console.error(msg);
  }

  const myReview = reviews.find((r) => r.userId === user?.id);

  useEffect(() => {
    if (myReview) {
      setReviewTitle(myReview.title ?? '');
      setReviewBody(myReview.body);
    }
  }, [myReview]);

  if (loading) return <LoadingSpinner />;
  if (error || !movie) return <ErrorMessage message={error || 'Не найдено'} />;

  return (
    <div className="page movie-detail">
      {actionMsg && <div className="toast">{actionMsg}</div>}

      <div className="movie-detail__hero">
        <PosterWithFallback url={movie.posterUrl} title={movie.title} size="lg" />
        <div className="movie-detail__info">
          <h1>{movie.title}</h1>
          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="movie-detail__original">{movie.originalTitle}</p>
          )}

          <div className="movie-detail__stats">
            {movie.releaseYear && <span>{movie.releaseYear} г.</span>}
            {movie.durationMinutes && <span>{movie.durationMinutes} мин.</span>}
            {movie.ageRating && <span className="badge badge--age">{movie.ageRating}</span>}
            <span className="movie-detail__rating">
              ★ {formatRating(movie.averageRating)}
              {movie.ratingsCount != null && movie.ratingsCount > 0 && (
                <small> ({movie.ratingsCount})</small>
              )}
            </span>
          </div>

          {movie.genres.length > 0 && (
            <p className="movie-detail__tags">
              {movie.genres.map((g) => (
                <Link key={g.id} to={`/?genreId=${g.id}`} className="chip">
                  {g.name}
                </Link>
              ))}
            </p>
          )}

          {movie.countries.length > 0 && (
            <p className="movie-detail__meta-line">
              <strong>Страна:</strong> {movie.countries.map((c) => c.name).join(', ')}
            </p>
          )}

          {movie.directors.length > 0 && (
            <p className="movie-detail__meta-line">
              <strong>Режиссёр:</strong> {movie.directors.map((d) => d.name).join(', ')}
            </p>
          )}

          {movie.cast.length > 0 && (
            <p className="movie-detail__meta-line">
              <strong>В ролях:</strong>{' '}
              {movie.cast.slice(0, 8).map((c) => c.actorName).join(', ')}
              {movie.cast.length > 8 && '…'}
            </p>
          )}

          <div className="movie-detail__actions">
            <button
              type="button"
              className={`btn ${isFavorite ? 'btn--ghost' : 'btn--accent'}`}
              onClick={toggleFavorite}
            >
              {isFavorite ? '★ В избранном' : '☆ В избранное'}
            </button>
            {movie.trailerUrl && (
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost"
              >
                Трейлер ↗
              </a>
            )}
          </div>

          <div className="movie-detail__rate">
            <span>Ваша оценка:</span>
            <StarRating
              value={myRating?.score ?? 0}
              interactive
              onChange={handleRate}
            />
          </div>
        </div>
      </div>

      {movie.description && (
        <section className="movie-detail__section">
          <h2>Описание</h2>
          <p className="movie-detail__description">{movie.description}</p>
        </section>
      )}

      <section className="movie-detail__section">
        <h2>Отзывы ({reviews.length})</h2>

        {isAuthenticated ? (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            {reviewError && <div className="form-error">{reviewError}</div>}
            <label className="form-field">
              <span>Заголовок</span>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Необязательно"
              />
            </label>
            <label className="form-field">
              <span>Текст отзыва *</span>
              <textarea
                required
                rows={4}
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn--accent">
              {myReview ? 'Обновить отзыв' : 'Оставить отзыв'}
            </button>
          </form>
        ) : (
          <p className="hint">
            <Link to="/login" state={{ from: `/movie/${movieId}` }}>Войдите</Link>, чтобы оставить отзыв
          </p>
        )}

        <div className="reviews-list">
          {reviews.length === 0 && <p className="hint">Пока нет отзывов</p>}
          {reviews.map((review) => (
            <article key={review.id} className="review-card">
              <header className="review-card__header">
                <strong>{review.username}</strong>
                <time dateTime={review.createdAt}>
                  {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                </time>
              </header>
              {review.title && <h3 className="review-card__title">{review.title}</h3>}
              <p>{review.body}</p>
              {user?.id === review.userId && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => deleteReview(review.id)}
                >
                  Удалить
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
