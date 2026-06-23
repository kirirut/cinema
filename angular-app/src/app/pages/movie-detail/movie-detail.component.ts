import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, catchError } from 'rxjs';
import { MoviesService } from '../../core/services/movies.service';
import { AuthService } from '../../core/services/auth.service';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { MovieDetail, Rating, Review } from '../../core/models';
import { formatDuration, formatRating, posterFallback } from '../../core/utils/format';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, StarRatingComponent, DatePipe],
  template: `
    @if (loading()) {
      <div class="loading">Загрузка…</div>
    } @else if (movie()) {
      <article class="detail">
        @if (movie()!.posterUrl) {
          <div class="detail__bg" [style.backgroundImage]="'url(' + movie()!.posterUrl + ')'"></div>
        }
        <div class="detail__gradient"></div>

        <div class="detail__layout">
          <div class="detail__poster">
            @if (movie()!.posterUrl) {
              <img [src]="movie()!.posterUrl!" [alt]="movie()!.title" />
            } @else {
              <span class="detail__fallback">{{ fallback }}</span>
            }
          </div>

          <div class="detail__body">
            <h1>{{ movie()!.title }}</h1>
            @if (movie()!.originalTitle && movie()!.originalTitle !== movie()!.title) {
              <p class="detail__original">{{ movie()!.originalTitle }}</p>
            }

            <div class="detail__scores">
              <div class="detail__big-score">{{ formatRating(movie()!.averageRating) }}</div>
              <div>
                <app-star-rating [value]="movie()!.averageRating ?? 0" />
                <span class="detail__votes">{{ movie()!.ratingsCount ?? 0 }} оценок</span>
              </div>
            </div>

            <div class="detail__meta">
              @if (movie()!.releaseYear) { <span>{{ movie()!.releaseYear }}</span> }
              @if (duration) { <span>{{ duration }}</span> }
              @if (movie()!.ageRating) { <span class="age">{{ movie()!.ageRating }}</span> }
            </div>

            @if (movie()!.genres.length) {
              <div class="tags">
                @for (g of movie()!.genres; track g.id) {
                  <a [routerLink]="['/browse']" [queryParams]="{ genreId: g.id }">{{ g.name }}</a>
                }
              </div>
            }

            @if (movie()!.directors.length) {
              <p class="line"><strong>Режиссёр:</strong> {{ directorNames }}</p>
            }
            @if (movie()!.countries.length) {
              <p class="line"><strong>Страна:</strong> {{ countryNames }}</p>
            }

            <div class="detail__actions">
              @if (movie()!.trailerUrl) {
                <a [href]="movie()!.trailerUrl!" target="_blank" rel="noopener" class="btn btn--primary">▶ Трейлер</a>
              }
              <button type="button" class="btn btn--ghost" (click)="toggleFavorite()">
                {{ isFavorite() ? '✓ В списке' : '+ Мой список' }}
              </button>
            </div>

            @if (auth.isLoggedIn()) {
              <div class="detail__rate">
                <span>Ваша оценка</span>
                <app-star-rating [value]="myRating()" [interactive]="true" (rate)="rate($event)" />
              </div>
            } @else {
              <a routerLink="/login" [queryParams]="{ return: '/movie/' + movie()!.id }" class="login-hint">Войдите, чтобы оценить</a>
            }

            @if (movie()!.description) {
              <section class="section">
                <h2>О фильме</h2>
                <p>{{ movie()!.description }}</p>
              </section>
            }

            @if (movie()!.cast.length) {
              <section class="section">
                <h2>Актёры</h2>
                <div class="cast">
                  @for (c of movie()!.cast; track c.actorId) {
                    <div class="cast__item">
                      <strong>{{ c.actorName }}</strong>
                      @if (c.roleName) { <span>{{ c.roleName }}</span> }
                    </div>
                  }
                </div>
              </section>
            }

            <section class="section">
              <h2>Отзывы ({{ reviews().length }})</h2>
              @if (auth.isLoggedIn()) {
                <form class="review-form" (ngSubmit)="submitReview()">
                  <input [(ngModel)]="reviewTitle" name="title" placeholder="Заголовок" />
                  <textarea [(ngModel)]="reviewBody" name="body" required rows="3" placeholder="Ваш отзыв…"></textarea>
                  <button type="submit" class="btn btn--primary btn--sm">{{ myReview() ? 'Обновить' : 'Опубликовать' }}</button>
                </form>
              }
              @for (r of reviews(); track r.id) {
                <div class="review">
                  <header>
                    <strong>{{ r.username }}</strong>
                    <time>{{ r.createdAt | date:'d MMM y' }}</time>
                  </header>
                  @if (r.title) { <h3>{{ r.title }}</h3> }
                  <p>{{ r.body }}</p>
                </div>
              }
            </section>
          </div>
        </div>
      </article>
    }
  `,
  styles: [`
    .detail { position: relative; margin: -72px -24px 0; padding: 100px 24px 48px; min-height: 80vh; }
    .detail__bg {
      position: absolute; inset: 0; background-size: cover; background-position: center;
      opacity: 0.25; filter: blur(4px);
    }
    .detail__gradient {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, rgba(10,10,18,0.3), #0a0a12 70%);
    }
    .detail__layout {
      position: relative; display: flex; gap: 40px; max-width: 1100px; margin: 0 auto;
    }
    .detail__poster {
      flex-shrink: 0; width: 260px; border-radius: 16px; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    }
    .detail__poster img { width: 100%; display: block; aspect-ratio: 2/3; object-fit: cover; }
    .detail__fallback {
      display: flex; align-items: center; justify-content: center;
      aspect-ratio: 2/3; font-size: 4rem; font-weight: 800;
      background: linear-gradient(135deg, #2a1f4e, #1a1033); color: #ff6b4a;
    }
    .detail__body { flex: 1; min-width: 0; }
    .detail__body h1 { margin: 0 0 6px; font-size: 2.2rem; font-weight: 800; }
    .detail__original { color: rgba(255,255,255,0.5); margin: 0 0 16px; }
    .detail__scores {
      display: flex; align-items: center; gap: 16px; margin-bottom: 16px;
    }
    .detail__big-score {
      font-size: 2.5rem; font-weight: 800; color: #ffb347; line-height: 1;
    }
    .detail__votes { display: block; font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
    .detail__meta {
      display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;
      font-size: 0.9rem; color: rgba(255,255,255,0.6);
    }
    .age { border: 1px solid rgba(255,255,255,0.25); padding: 1px 8px; border-radius: 4px; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .tags a {
      padding: 4px 12px; border-radius: 20px; background: rgba(124,92,255,0.2);
      color: #c4b5ff; text-decoration: none; font-size: 0.82rem;
    }
    .line { font-size: 0.88rem; color: rgba(255,255,255,0.55); margin: 0 0 8px; }
    .line strong { color: rgba(255,255,255,0.35); font-weight: 500; }
    .detail__actions { display: flex; gap: 12px; margin: 20px 0; flex-wrap: wrap; }
    .btn {
      padding: 10px 22px; border-radius: 10px; font-weight: 600; font-size: 0.9rem;
      cursor: pointer; border: none; text-decoration: none; display: inline-flex; align-items: center;
    }
    .btn--primary { background: linear-gradient(135deg, #ff6b4a, #e84a3a); color: #fff; }
    .btn--ghost { background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15); }
    .btn--sm { padding: 8px 16px; font-size: 0.85rem; }
    .detail__rate { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .login-hint { color: #ff6b4a; font-size: 0.88rem; }
    .section { margin-top: 28px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); }
    .section h2 { margin: 0 0 12px; font-size: 1.1rem; }
    .section p { color: rgba(255,255,255,0.65); line-height: 1.7; }
    .cast { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
    .cast__item {
      padding: 10px 12px; background: rgba(255,255,255,0.04); border-radius: 10px;
    }
    .cast__item strong { display: block; font-size: 0.88rem; }
    .cast__item span { font-size: 0.78rem; color: rgba(255,255,255,0.4); }
    .review-form {
      display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;
      padding: 16px; background: rgba(255,255,255,0.04); border-radius: 12px;
    }
    .review-form input, .review-form textarea {
      padding: 10px 14px; border-radius: 8px;
      background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff;
    }
    .review {
      padding: 16px; margin-bottom: 12px;
      background: rgba(255,255,255,0.03); border-radius: 12px;
    }
    .review header {
      display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem;
    }
    .review header time { color: rgba(255,255,255,0.35); }
    .review h3 { margin: 0 0 6px; font-size: 0.95rem; }
    .review p { margin: 0; color: rgba(255,255,255,0.6); line-height: 1.6; }
    .loading { text-align: center; padding: 80px; color: rgba(255,255,255,0.45); }
    @media (max-width: 768px) {
      .detail__layout { flex-direction: column; align-items: center; }
      .detail__poster { width: 200px; }
    }
  `],
})
export class MovieDetailComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly movies = inject(MoviesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly formatRating = formatRating;
  movie = signal<MovieDetail | null>(null);
  loading = signal(true);
  reviews = signal<Review[]>([]);
  myRating = signal(0);
  myReview = signal<Review | null>(null);
  isFavorite = signal(false);
  reviewTitle = '';
  reviewBody = '';

  get duration(): string | null {
    return formatDuration(this.movie()?.durationMinutes);
  }

  get fallback(): string {
    return this.movie() ? posterFallback(this.movie()!.title) : '?';
  }

  get directorNames(): string {
    return this.movie()?.directors.map((d) => d.fullName).join(', ') ?? '';
  }

  get countryNames(): string {
    return this.movie()?.countries.map((c) => c.name).join(', ') ?? '';
  }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      movie: this.movies.getById(id),
      reviews: this.movies.getReviews(id),
      rating: this.auth.isLoggedIn()
        ? this.movies.getMyRating(id).pipe(catchError(() => of(null)))
        : of(null),
      favs: this.auth.isLoggedIn()
        ? this.movies.getFavorites().pipe(catchError(() => of([])))
        : of([]),
    }).subscribe({
      next: ({ movie, reviews, rating, favs }) => {
        this.movie.set(movie);
        this.reviews.set(reviews);
        this.myRating.set(rating?.score ?? 0);
        this.isFavorite.set(favs.some((f) => f.movieId === id));
        const mine = reviews.find((r) => r.userId === this.auth.user()?.id);
        this.myReview.set(mine ?? null);
        if (mine) {
          this.reviewTitle = mine.title ?? '';
          this.reviewBody = mine.body;
        }
        this.loading.set(false);
      },
      error: () => this.router.navigate(['/browse']),
    });
  }

  toggleFavorite(): void {
    const m = this.movie();
    if (!m || !this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.isFavorite()) {
      this.movies.removeFavorite(m.id).subscribe(() => this.isFavorite.set(false));
    } else {
      this.movies.addFavorite(m.id).subscribe(() => this.isFavorite.set(true));
    }
  }

  rate(score: number): void {
    const m = this.movie();
    if (!m) return;
    this.movies.rate(m.id, score).subscribe((r) => {
      this.myRating.set(r.score);
      this.movies.getById(m.id).subscribe((updated) => this.movie.set(updated));
    });
  }

  submitReview(): void {
    const m = this.movie();
    if (!m || !this.reviewBody.trim()) return;
    const existing = this.myReview();
    const obs = existing
      ? this.movies.updateReview(existing.id, this.reviewTitle, this.reviewBody)
      : this.movies.createReview(m.id, this.reviewTitle, this.reviewBody);
    obs.subscribe((r) => {
      if (existing) {
        this.reviews.update((list) => list.map((x) => (x.id === r.id ? r : x)));
      } else {
        this.reviews.update((list) => [r, ...list]);
        this.reviewTitle = '';
        this.reviewBody = '';
      }
      this.myReview.set(r);
    });
  }
}
