import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of, Observable } from 'rxjs';
import { AuthResponse, User } from '../models';

const TOKEN_KEY = 'cinema_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<User | null>(null);
  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.userSignal() !== null);

  constructor(private readonly http: HttpClient) {
    this.loadUser().subscribe();
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/login', { username, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  register(body: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/register', body)
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.userSignal.set(null);
  }

  loadUser(): Observable<User | null> {
    if (!this.token) {
      this.userSignal.set(null);
      return of(null);
    }
    return this.http.get<User>('/api/users/me').pipe(
      tap((user) => this.userSignal.set(user)),
      catchError(() => {
        localStorage.removeItem(TOKEN_KEY);
        this.userSignal.set(null);
        return of(null);
      }),
    );
  }

  updateProfile(body: { firstName?: string; lastName?: string; email?: string }): Observable<User> {
    return this.http.put<User>('/api/users/me', body).pipe(
      tap((user) => this.userSignal.set(user)),
    );
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    this.userSignal.set(res.user);
  }
}
