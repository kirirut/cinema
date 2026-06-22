interface PosterProps {
  url: string | null | undefined;
  title: string;
  size?: 'sm' | 'md' | 'lg';
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

export function PosterWithFallback({ url, title, size = 'md' }: PosterProps) {
  return (
    <div className="poster-wrap">
      {url ? (
        <>
          <img
            src={url}
            alt={title}
            className={`poster poster--${size}`}
            loading="lazy"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              const fb = img.parentElement?.querySelector('.poster-fallback');
              fb?.classList.remove('poster-fallback--hidden');
            }}
          />
          <div className={`poster-fallback poster-fallback--${size} poster-fallback--hidden`} aria-hidden>
            <span>{title.charAt(0).toUpperCase()}</span>
          </div>
        </>
      ) : (
        <div className={`poster-fallback poster-fallback--${size}`} aria-hidden>
          <span>{title.charAt(0).toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
