import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import {
  Catalog,
  Favorite,
  MovieDetail,
  MovieSearchParams,
  MovieSummary,
  Page,
  Rating,
  Review,
} from '../models';

@Injectable({ providedIn: 'root' })
export class MoviesService {
  constructor(private readonly http: HttpClient) {}

  getCatalog(): Observable<Catalog> {
    return this.http.get<Catalog>('/api/catalog');
  }

  search(params: MovieSearchParams = {}): Observable<Page<MovieSummary>> {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return this.http.get<Page<MovieSummary>>('/api/movies', { params: p });
  }

  getById(id: number): Observable<MovieDetail> {
    return this.http.get<MovieDetail>(`/api/movies/${id}`);
  }

  getRecommendations(): Observable<MovieSummary[]> {
    return this.http.get<MovieSummary[]>('/api/recommendations');
  }

  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>('/api/favorites');
  }

  addFavorite(movieId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`/api/favorites/${movieId}`, {});
  }

  removeFavorite(movieId: number): Observable<void> {
    return this.http.delete<void>(`/api/favorites/${movieId}`);
  }

  getMyRating(movieId: number): Observable<Rating | null> {
    return this.http.get<Rating>(`/api/movies/${movieId}/ratings/me`).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) return of(null);
        return throwError(() => err);
      }),
    );
  }

  rate(movieId: number, score: number): Observable<Rating> {
    return this.http.post<Rating>(`/api/movies/${movieId}/ratings`, { score });
  }

  getReviews(movieId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`/api/movies/${movieId}/reviews`);
  }

  createReview(movieId: number, title: string, body: string): Observable<Review> {
    return this.http.post<Review>(`/api/movies/${movieId}/reviews`, {
      title: title || undefined,
      body,
    });
  }

  updateReview(id: number, title: string, body: string): Observable<Review> {
    return this.http.put<Review>(`/api/reviews/${id}`, { title: title || undefined, body });
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`/api/reviews/${id}`);
  }
}
