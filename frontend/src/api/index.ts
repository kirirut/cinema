import { ApiError, apiFetch, buildQuery } from './client';
import type {
  AuthResponse,
  Catalog,
  Favorite,
  LoginRequest,
  MovieDetail,
  MovieSearchParams,
  MovieSummary,
  Page,
  Rating,
  RegisterRequest,
  Review,
  User,
  UserProfileUpdate,
} from './types';

export * from './types';
export { ApiError, setToken } from './client';

export const catalogApi = {
  get: () => apiFetch<Catalog>('/api/catalog', {}, false),
};

export const moviesApi = {
  search: (params: MovieSearchParams) =>
    apiFetch<Page<MovieSummary>>(`/api/movies${buildQuery(params as Record<string, string | number | undefined>)}`, {}, false),
  getById: (id: number) => apiFetch<MovieDetail>(`/api/movies/${id}`, {}, false),
};

export const authApi = {
  login: (body: LoginRequest) =>
    apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }, false),
  register: (body: RegisterRequest) =>
    apiFetch<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }, false),
};

export const usersApi = {
  me: () => apiFetch<User>('/api/users/me'),
  updateMe: (body: UserProfileUpdate) =>
    apiFetch<User>('/api/users/me', { method: 'PUT', body: JSON.stringify(body) }),
};

export const favoritesApi = {
  list: () => apiFetch<Favorite[]>('/api/favorites'),
  add: (movieId: number) => apiFetch<Favorite>(`/api/favorites/${movieId}`, { method: 'POST' }),
  remove: (movieId: number) => apiFetch<void>(`/api/favorites/${movieId}`, { method: 'DELETE' }),
};

export const ratingsApi = {
  list: (movieId: number) => apiFetch<Rating[]>(`/api/movies/${movieId}/ratings`, {}, false),
  myRating: async (movieId: number) => {
    try {
      return await apiFetch<Rating>(`/api/movies/${movieId}/ratings/me`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },
  rate: (movieId: number, score: number) =>
    apiFetch<Rating>(`/api/movies/${movieId}/ratings`, {
      method: 'POST',
      body: JSON.stringify({ score }),
    }),
  remove: (movieId: number) =>
    apiFetch<void>(`/api/movies/${movieId}/ratings/me`, { method: 'DELETE' }),
};

export const reviewsApi = {
  list: (movieId: number) => apiFetch<Review[]>(`/api/movies/${movieId}/reviews`, {}, false),
  create: (movieId: number, title: string, body: string) =>
    apiFetch<Review>(`/api/movies/${movieId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ title: title || undefined, body }),
    }),
  update: (id: number, title: string, body: string) =>
    apiFetch<Review>(`/api/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title: title || undefined, body }),
    }),
  remove: (id: number) => apiFetch<void>(`/api/reviews/${id}`, { method: 'DELETE' }),
};

export const recommendationsApi = {
  list: () => apiFetch<MovieSummary[]>('/api/recommendations'),
};
