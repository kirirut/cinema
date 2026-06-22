import { Link } from 'react-router-dom';
import type { MovieSummary } from '../api';
import { PosterWithFallback } from './Poster';
import { formatRating } from './StarRating';

interface MovieListItemProps {
  movie: MovieSummary;
}

export function MovieListItem({ movie }: MovieListItemProps) {
  const genres = movie.genres.map((g) => g.name).join(', ');

  return (
    <article className="movie-item">
      <Link to={`/movie/${movie.id}`} className="movie-item__poster-link">
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
        {genres && <p className="movie-item__genres">{genres}</p>}
      </div>
      <div className="movie-item__meta">
        {movie.ageRating && <span className="badge badge--age">{movie.ageRating}</span>}
        <span className="movie-item__rating" title="Средняя оценка">
          ★ {formatRating(movie.averageRating)}
        </span>
        {movie.ratingsCount != null && movie.ratingsCount > 0 && (
          <span className="movie-item__votes">{movie.ratingsCount} оц.</span>
        )}
      </div>
    </article>
  );
}
