import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserMenu } from './UserMenu';
import { type FormEvent, useEffect, useState } from 'react';

export function Header() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
    setMobileNavOpen(false);
  }

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo" onClick={() => setMobileNavOpen(false)}>
          <span className="header__logo-icon">▶</span>
          Cinema
        </Link>

        <form className="header__search" onSubmit={handleSearch} role="search">
          <input
            type="search"
            placeholder="Название фильма…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Поиск фильмов"
          />
          <button type="submit" aria-label="Искать">
            ⌕
          </button>
        </form>

        <nav className={`header__nav${mobileNavOpen ? ' header__nav--open' : ''}`} aria-label="Основное меню">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/recommendations"
                className={({ isActive }) => `header__link header__link--mobile${isActive ? ' active' : ''}`}
                onClick={() => setMobileNavOpen(false)}
              >
                Рекомендации
              </NavLink>
              <NavLink
                to="/favorites"
                className={({ isActive }) => `header__link header__link--mobile${isActive ? ' active' : ''}`}
                onClick={() => setMobileNavOpen(false)}
              >
                Избранное
              </NavLink>
              <UserMenu />
            </>
          ) : (
            <>
              <NavLink to="/login" className="header__link" onClick={() => setMobileNavOpen(false)}>
                Вход
              </NavLink>
              <NavLink to="/register" className="btn btn--accent btn--sm" onClick={() => setMobileNavOpen(false)}>
                Регистрация
              </NavLink>
            </>
          )}
        </nav>

        <button
          type="button"
          className="header__burger"
          aria-label={mobileNavOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((v) => !v)}
        >
          {mobileNavOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
