import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const initials = (user.firstName?.[0] ?? user.username[0]).toUpperCase();

  function handleLogout() {
    setOpen(false);
    logout();
    navigate('/');
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="user-menu__avatar">{initials}</span>
        <span className="user-menu__name">{user.username}</span>
        <span className="user-menu__chevron" aria-hidden>{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__header">
            <strong>{user.username}</strong>
            <span>{user.email}</span>
          </div>
          <Link to="/profile" className="user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            Профиль
          </Link>
          <Link to="/favorites" className="user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            Избранное
          </Link>
          <Link to="/recommendations" className="user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            Рекомендации
          </Link>
          <hr className="user-menu__divider" />
          <button type="button" className="user-menu__item user-menu__item--danger" role="menuitem" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
