export function MovieListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="movie-list movie-list--skeleton" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="movie-item movie-item--skeleton">
          <div className="skeleton skeleton--poster" />
          <div className="movie-item__body">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--text" />
            <div className="skeleton skeleton--text skeleton--short" />
          </div>
          <div className="skeleton skeleton--rating" />
        </div>
      ))}
    </div>
  );
}
