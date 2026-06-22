import { Link } from 'react-router-dom';
import type { MovieSummary } from '../api';
import { PosterWithFallback } from './Poster';
import { formatRating, ratingLabel } from './StarRating';

interface MovieListItemProps {
  movie: MovieSummary;
  index?: number;
}

export function MovieListItem({ movie, index }: MovieListItemProps) {
  const hasRating = movie.ratingsCount != null && movie.ratingsCount > 0;

  return (
    <article className="movie-item">
      {index != null && (
        <span className="movie-item__index" aria-hidden>
          {index + 1}
        </span>
      )}
      <Link to={`/movie/${movie.id}`} className="movie-item__poster-link" tabIndex={-1} aria-hidden>
        <PosterWithFallback url={movie.posterUrl} title={movie.title} size="sm" />
      </Link>
      <div className="movie-item__body">
        <h2 className="movie-item__title">
          <Link to={`/movie/${movie.id}`}>{movie.title}</Link>
          {movie.releaseYear && <span className="movie-item__year"> ({movie.releaseYear})</span>}
        </h2>
        {movie.originalTitle && movie.originalTitle !== movie.title && (
          <p className="movie-item__original">{movie.originalTitle}</p>
        )}
        {movie.genres.length > 0 && (
          <div className="movie-item__genres">
            {movie.genres.map((g) => (
              <Link key={g.id} to={`/?genreId=${g.id}`} className="chip chip--sm">
                {g.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="movie-item__meta">
        {movie.ageRating && <span className="badge badge--age">{movie.ageRating}</span>}
        <span
          className={`movie-item__rating${hasRating ? '' : ' movie-item__rating--empty'}`}
          title={ratingLabel(movie.averageRating, movie.ratingsCount)}
        >
          ★ {formatRating(movie.averageRating)}
        </span>
        {hasRating && (
          <span className="movie-item__votes">{movie.ratingsCount} оц.</span>
        )}
      </div>
    </article>
  );
}
