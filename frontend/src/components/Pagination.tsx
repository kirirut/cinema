interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="pagination" aria-label="Страницы">
      <button
        type="button"
        className="pagination__btn"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        ←
      </button>
      {start > 0 && (
        <>
          <button type="button" className="pagination__btn" onClick={() => onPageChange(0)}>
            1
          </button>
          {start > 1 && <span className="pagination__dots">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination__btn${p === page ? ' pagination__btn--active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p + 1}
        </button>
      ))}
      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && <span className="pagination__dots">…</span>}
          <button type="button" className="pagination__btn" onClick={() => onPageChange(totalPages - 1)}>
            {totalPages}
          </button>
        </>
      )}
      <button
        type="button"
        className="pagination__btn"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
      >
        →
      </button>
    </nav>
  );
}
