import { useState } from 'react';

interface PosterProps {
  url: string | null | undefined;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  featured?: boolean;
}

export function Poster({ url, title, size = 'md' }: PosterProps) {
  if (url) {
    return (
      <img
        src={url}
        alt={title}
        className={`poster poster--${size}`}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('poster-fallback--hidden');
        }}
      />
    );
  }

  return (
    <div className={`poster-fallback poster-fallback--${size}`} aria-hidden>
      <span>{title.charAt(0).toUpperCase()}</span>
    </div>
  );
}

export function PosterWithFallback({ url, title, size = 'md', featured = false }: PosterProps) {
  const [failed, setFailed] = useState(false);
  const letter = title.charAt(0).toUpperCase();
  const showFallback = !url || failed;

  const wrapClass = [
    'poster-wrap',
    `poster-wrap--${size}`,
    featured ? 'poster-wrap--featured' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapClass}>
      {showFallback ? (
        <div className={`poster-fallback poster-fallback--${size}`} aria-hidden>
          <span>{letter}</span>
        </div>
      ) : (
        <img
          src={url}
          alt={title}
          className={`poster poster--${size}`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
