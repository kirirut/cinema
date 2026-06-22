export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Country {
  id: number;
  name: string;
  isoCode: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Catalog {
  genres: Genre[];
  countries: Country[];
  tags: Tag[];
  roles: Role[];
}

export interface MovieSummary {
  id: number;
  title: string;
  originalTitle: string | null;
  releaseYear: number | null;
  posterUrl: string | null;
  ageRating: string | null;
  averageRating: number | null;
  ratingsCount: number | null;
  genres: Genre[];
}

export interface Director {
  id: number;
  fullName: string;
  birthDate: string | null;
  bio: string | null;
  photoUrl: string | null;
}

export interface MovieCast {
  actorId: number;
  actorName: string;
  roleName: string | null;
}

export interface MovieDetail {
  id: number;
  title: string;
  originalTitle: string | null;
  description: string | null;
  releaseYear: number | null;
  durationMinutes: number | null;
  posterUrl: string | null;
  trailerUrl: string | null;
  ageRating: string | null;
  averageRating: number | null;
  ratingsCount: number | null;
  genres: Genre[];
  countries: Country[];
  directors: Director[];
  tags: Tag[];
  cast: MovieCast[];
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  active: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Rating {
  id: number;
  userId: number;
  username: string;
  movieId: number;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  userId: number;
  username: string;
  movieId: number;
  title: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  userId: number;
  movieId: number;
  addedAt: string;
  movie: MovieSummary;
}

export interface MovieSearchParams {
  q?: string;
  genreId?: number;
  countryId?: number;
  tagId?: number;
  directorId?: number;
  actorId?: number;
  yearFrom?: number;
  yearTo?: number;
  page?: number;
  size?: number;
}
