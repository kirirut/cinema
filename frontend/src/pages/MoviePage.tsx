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
import { StarRating, formatRating, ratingLabel } from '../components/StarRating';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Toast } from '../components/Toast';
import { formatDuration } from '../utils/filters';

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
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; variant: 'success' | 'error' } | null>(null);

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
      } else {
        setMyRating(null);
        setIsFavorite(false);
      }
    } catch {
      setError('Фильм не найден или сервер недоступен');
    } finally {
      setLoading(false);
    }
  }, [movieId, isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const myReview = reviews.find((r) => r.userId === user?.id);

  useEffect(() => {
    if (myReview) {
      setReviewTitle(myReview.title ?? '');
      setReviewBody(myReview.body);
    }
  }, [myReview]);

  function showToast(msg: string, variant: 'success' | 'error' = 'success') {
    setToast({ msg, variant });
    setTimeout(() => setToast(null), 3500);
  }

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
      showToast('Оценка сохранена');
    } catch (err) {
      showToast(err instanceof ApiError ? err.detail : 'Не удалось сохранить оценку', 'error');
    }
  }

  async function toggleFavorite() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/movie/${movieId}` } });
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoritesApi.remove(movieId);
        setIsFavorite(false);
        showToast('Удалено из избранного');
      } else {
        await favoritesApi.add(movieId);
        setIsFavorite(true);
        showToast('Добавлено в избранное');
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.detail : 'Ошибка', 'error');
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handleReviewSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/movie/${movieId}` } });
      return;
    }
    setReviewError('');
    setReviewSubmitting(true);
    try {
      if (myReview) {
        const updated = await reviewsApi.update(myReview.id, reviewTitle, reviewBody);
        setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        showToast('Отзыв обновлён');
      } else {
        const created = await reviewsApi.create(movieId, reviewTitle, reviewBody);
        setReviews((prev) => [created, ...prev]);
        setReviewTitle('');
        setReviewBody('');
        showToast('Отзыв опубликован');
      }
    } catch (err) {
      setReviewError(err instanceof ApiError ? err.detail : 'Ошибка сохранения');
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function deleteReview(reviewId: number) {
    if (!window.confirm('Удалить ваш отзыв?')) return;
    try {
      await reviewsApi.remove(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setReviewTitle('');
      setReviewBody('');
      showToast('Отзыв удалён');
    } catch (err) {
      showToast(err instanceof ApiError ? err.detail : 'Ошибка', 'error');
    }
  }

  if (loading) return <LoadingSpinner fullPage />;
  if (error || !movie) return <ErrorMessage message={error || 'Не найдено'} onRetry={load} />;

  const duration = formatDuration(movie.durationMinutes);

  return (
    <div className="page movie-detail">
      {toast && (
        <Toast
          message={toast.msg}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}

      {movie.posterUrl && (
        <div
          className="movie-detail__backdrop"
          style={{ backgroundImage: `url(${movie.posterUrl})` }}
          aria-hidden
        />
      )}

      <Breadcrumbs
        items={[
          { label: 'Главная', to: '/' },
          ...(movie.genres[0]
            ? [{ label: movie.genres[0].name, to: `/?genreId=${movie.genres[0].id}` }]
            : []),
          { label: movie.title },
        ]}
      />

      <div className="movie-detail__hero">
        <div className="movie-detail__poster-wrap">
          <PosterWithFallback url={movie.posterUrl} title={movie.title} size="lg" />
        </div>
        <div className="movie-detail__info">
          <h1>{movie.title}</h1>
          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="movie-detail__original">{movie.originalTitle}</p>
          )}

          <div className="movie-detail__rating-block">
            <div className="movie-detail__score">
              <span className="movie-detail__score-value">
                {formatRating(movie.averageRating)}
              </span>
              <StarRating value={movie.averageRating ?? 0} size="sm" />
              <span className="movie-detail__score-label">
                {ratingLabel(movie.averageRating, movie.ratingsCount)}
              </span>
            </div>
          </div>

          <dl className="meta-grid">
            {movie.releaseYear && (
              <>
                <dt>Год</dt>
                <dd>{movie.releaseYear}</dd>
              </>
            )}
            {duration && (
              <>
                <dt>Длительность</dt>
                <dd>{duration}</dd>
              </>
            )}
            {movie.ageRating && (
              <>
                <dt>Возраст</dt>
                <dd><span className="badge badge--age">{movie.ageRating}</span></dd>
              </>
            )}
            {movie.countries.length > 0 && (
              <>
                <dt>Страна</dt>
                <dd className="meta-grid__links">
                  {movie.countries.map((c, i) => (
                    <span key={c.id}>
                      {i > 0 && ', '}
                      <Link to={`/?countryId=${c.id}`} className="meta-grid__link">
                        {c.name}
                      </Link>
                    </span>
                  ))}
                </dd>
              </>
            )}
            {movie.directors.length > 0 && (
              <>
                <dt>Режиссёр</dt>
                <dd>{movie.directors.map((d) => d.fullName).join(', ')}</dd>
              </>
            )}
          </dl>

          {movie.genres.length > 0 && (
            <div className="movie-detail__tags">
              {movie.genres.map((g) => (
                <Link key={g.id} to={`/?genreId=${g.id}`} className="chip">
                  {g.name}
                </Link>
              ))}
            </div>
          )}

          {movie.tags.length > 0 && (
            <div className="movie-detail__tags movie-detail__tags--secondary">
              {movie.tags.map((t) => (
                <Link key={t.id} to={`/?tagId=${t.id}`} className="chip chip--outline">
                  {t.name}
                </Link>
              ))}
            </div>
          )}

          <div className="movie-detail__actions">
            <button
              type="button"
              className={`btn ${isFavorite ? 'btn--ghost' : 'btn--accent'}`}
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              aria-pressed={isFavorite}
            >
              {favoriteLoading ? '…' : isFavorite ? '★ В избранном' : '☆ В избранное'}
            </button>
            {movie.trailerUrl && (
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--ghost"
              >
                ▶ Трейлер
              </a>
            )}
          </div>

          <div className="movie-detail__rate">
            <span className="movie-detail__rate-label">Ваша оценка</span>
            <StarRating
              value={myRating?.score ?? 0}
              interactive
              onChange={handleRate}
              showValue
            />
            {!isAuthenticated && (
              <Link to="/login" state={{ from: `/movie/${movieId}` }} className="movie-detail__rate-hint">
                Войдите, чтобы оценить
              </Link>
            )}
          </div>
        </div>
      </div>

      {movie.description && (
        <section className="movie-detail__section">
          <h2>Описание</h2>
          <p className="movie-detail__description">{movie.description}</p>
        </section>
      )}

      {movie.cast.length > 0 && (
        <section className="movie-detail__section">
          <h2>В ролях</h2>
          <ul className="cast-list">
            {movie.cast.map((c) => (
              <li key={c.actorId} className="cast-list__item">
                <span className="cast-list__actor">{c.actorName}</span>
                {c.roleName && <span className="cast-list__role">{c.roleName}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="movie-detail__section">
        <h2>Отзывы <span className="section-count">{reviews.length}</span></h2>

        {isAuthenticated ? (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            {reviewError && <div className="form-error">{reviewError}</div>}
            <label className="form-field">
              <span>Заголовок</span>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Кратко о впечатлении"
                maxLength={200}
              />
            </label>
            <label className="form-field">
              <span>Текст отзыва *</span>
              <textarea
                required
                rows={4}
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                placeholder="Поделитесь мнением о фильме…"
              />
            </label>
            <div className="review-form__actions">
              <button type="submit" className="btn btn--accent" disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Сохранение…' : myReview ? 'Обновить отзыв' : 'Опубликовать'}
              </button>
              {myReview && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => deleteReview(myReview.id)}
                >
                  Удалить
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="auth-prompt">
            <Link to="/login" state={{ from: `/movie/${movieId}` }} className="btn btn--accent btn--sm">
              Войти
            </Link>
            <span>чтобы оставить отзыв и оценку</span>
          </div>
        )}

        <div className="reviews-list">
          {reviews.length === 0 && (
            <p className="empty-inline">Пока нет отзывов — будьте первым!</p>
          )}
          {reviews.map((review) => (
            <article key={review.id} className="review-card">
              <header className="review-card__header">
                <div className="review-card__author">
                  <span className="review-card__avatar" aria-hidden>
                    {review.username.charAt(0).toUpperCase()}
                  </span>
                  <strong>{review.username}</strong>
                </div>
                <time dateTime={review.createdAt}>
                  {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              </header>
              {review.title && <h3 className="review-card__title">{review.title}</h3>}
              <p className="review-card__body">{review.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
