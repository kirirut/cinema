import { useState } from 'react';

interface StarRatingProps {
  value: number;
  max?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export function StarRating({
  value,
  max = 5,
  interactive,
  onChange,
  size = 'md',
  showValue,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="stars-wrap">
      <div
        className={`stars stars--${size}${interactive ? ' stars--interactive' : ''}`}
        role={interactive ? 'group' : 'img'}
        aria-label={`Оценка ${value} из ${max}`}
        onMouseLeave={() => interactive && setHover(0)}
      >
        {Array.from({ length: max }, (_, i) => {
          const star = i + 1;
          const filled = star <= Math.round(display);
          return (
            <button
              key={star}
              type="button"
              className={`stars__star${filled ? ' stars__star--filled' : ''}`}
              disabled={!interactive}
              onMouseEnter={() => interactive && setHover(star)}
              onClick={() => interactive && onChange?.(star)}
              aria-label={`${star} из ${max}`}
              aria-pressed={interactive ? star === value : undefined}
            >
              ★
            </button>
          );
        })}
      </div>
      {showValue && value > 0 && (
        <span className="stars-wrap__value">{value}/{max}</span>
      )}
    </div>
  );
}

export function formatRating(value: number | null | undefined): string {
  if (value == null || value === 0) return '—';
  return value.toFixed(1);
}

export function ratingLabel(value: number | null | undefined, count: number | null | undefined): string {
  if (value == null || !count) return 'Нет оценок';
  return `${value.toFixed(1)} · ${count} ${pluralVotes(count)}`;
}

function pluralVotes(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'оценка';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'оценки';
  return 'оценок';
}
