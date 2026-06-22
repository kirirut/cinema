interface StarRatingProps {
  value: number;
  max?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md';
}

export function StarRating({ value, max = 5, interactive, onChange, size = 'md' }: StarRatingProps) {
  return (
    <div
      className={`stars stars--${size}${interactive ? ' stars--interactive' : ''}`}
      role={interactive ? 'slider' : 'img'}
      aria-label={`Оценка ${value} из ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const filled = star <= Math.round(value);
        return (
          <button
            key={star}
            type="button"
            className={`stars__star${filled ? ' stars__star--filled' : ''}`}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            aria-label={`${star} звёзд`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export function formatRating(value: number | null | undefined): string {
  if (value == null) return '—';
  return value.toFixed(1);
}
