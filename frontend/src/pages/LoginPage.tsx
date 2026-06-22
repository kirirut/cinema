import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api';
import { PasswordInput } from '../components/PasswordInput';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Ошибка входа');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Вход</h1>
        <p className="auth-card__sub">Войдите, чтобы оценивать фильмы и сохранять избранное</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <label className="form-field">
            <span>Имя пользователя</span>
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label className="form-field">
            <span>Пароль</span>
            <PasswordInput
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
              minLength={6}
            />
          </label>

          <button type="submit" className="btn btn--accent btn--block" disabled={submitting}>
            {submitting ? 'Вход…' : 'Войти'}
          </button>
        </form>

        <p className="auth-card__footer">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
