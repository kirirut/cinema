import { type FormEvent, useEffect, useState } from 'react';
import { usersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
      setEmail(user.email);
    }
  }, [user]);

  if (!user) return <LoadingSpinner />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await usersApi.updateMe({ firstName, lastName, email });
      await refreshUser();
      setMessage('Профиль обновлён');
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Ошибка сохранения');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Главная', to: '/' }, { label: 'Профиль' }]} />
      <h1>Профиль</h1>

      <div className="profile-card">
        <div className="profile-card__avatar">{user.username.charAt(0).toUpperCase()}</div>
        <div className="profile-card__info">
          <p>
            <strong>Логин:</strong> {user.username}
          </p>
          <p>
            <strong>Роли:</strong> {user.roles.join(', ')}
          </p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        {message && <div className="form-success">{message}</div>}
        {error && <div className="form-error">{error}</div>}

        <div className="form-row">
          <label className="form-field">
            <span>Имя</span>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>
          <label className="form-field">
            <span>Фамилия</span>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>
        </div>

        <label className="form-field">
          <span>Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <button type="submit" className="btn btn--accent" disabled={submitting}>
          {submitting ? 'Сохранение…' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}
