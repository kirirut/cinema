import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { type FormEvent, useEffect, useState } from 'react';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  }

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">▶</span>
          Cinema
        </Link>

        <form className="header__search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Поиск фильмов…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Поиск"
          />
          <button type="submit" aria-label="Искать">
            ⌕
          </button>
        </form>

        <nav className="header__nav">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/recommendations"
                className={({ isActive }) => `header__link${isActive ? ' active' : ''}`}
              >
                Рекомендации
              </NavLink>
              <NavLink
                to="/favorites"
                className={({ isActive }) => `header__link${isActive ? ' active' : ''}`}
              >
                Избранное
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) => `header__link${isActive ? ' active' : ''}`}
              >
                {user?.username}
              </NavLink>
              <button type="button" className="header__link header__link--btn" onClick={logout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="header__link">
                Вход
              </NavLink>
              <NavLink to="/register" className="btn btn--accent btn--sm">
                Регистрация
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
