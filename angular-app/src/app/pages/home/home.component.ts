import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin, of, catchError } from 'rxjs';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { MovieRowComponent } from '../../shared/components/movie-row/movie-row.component';
import { MoviesService } from '../../core/services/movies.service';
import { AuthService } from '../../core/services/auth.service';
import { Catalog, MovieSummary } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroBannerComponent, MovieRowComponent],
  template: `
    @if (loading()) {
      <div class="loading">Загрузка…</div>
    } @else {
      <app-hero-banner
        [movie]="featured()"
        [inList]="featuredInList()"
        (addList)="toggleFavorite($event)"
      />

      @if (topRated().length) {
        <app-movie-row title="Лучшие оценки" [movies]="topRated()" seeAllLink="/browse" />
      }

      @for (row of genreRows(); track row.genre.id) {
        <app-movie-row
          [title]="row.genre.name"
          [movies]="row.movies"
          [seeAllLink]="'/browse?genreId=' + row.genre.id"
        />
      }

      @if (!featured() && genreRows().length === 0) {
        <div class="empty">
          <h2>Каталог пуст</h2>
          <p>Фильмы скоро появятся — следите за обновлениями</p>
        </div>
      }
    }
  `,
  styles: [`
    .loading, .empty {
      text-align: center; padding: 80px 24px; color: rgba(255,255,255,0.5);
    }
    .empty h2 { color: #fff; margin-bottom: 8px; }
  `],
})
export class HomeComponent implements OnInit {
  private readonly movies = inject(MoviesService);
  private readonly auth = inject(AuthService);

  loading = signal(true);
  featured = signal<MovieSummary | null>(null);
  topRated = signal<MovieSummary[]>([]);
  genreRows = signal<{ genre: Catalog['genres'][0]; movies: MovieSummary[] }[]>([]);
  favoriteIds = signal<Set<number>>(new Set());

  featuredInList = () => {
    const f = this.featured();
    return f ? this.favoriteIds().has(f.id) : false;
  };

  ngOnInit(): void {
    forkJoin({
      catalog: this.movies.getCatalog(),
      all: this.movies.search({ size: 50 }),
      favs: this.auth.isLoggedIn()
        ? this.movies.getFavorites().pipe(catchError(() => of([])))
        : of([]),
    }).subscribe({
      next: ({ catalog, all, favs }) => {
        this.favoriteIds.set(new Set(favs.map((f) => f.movieId)));
        const list = all.content;
        const sorted = [...list].sort(
          (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
        );
        this.featured.set(sorted[0] ?? list[0] ?? null);
        this.topRated.set(sorted.slice(0, 12));

        const rows = catalog.genres
          .map((genre) => ({
            genre,
            movies: list.filter((m) => m.genres.some((g) => g.id === genre.id)).slice(0, 12),
          }))
          .filter((r) => r.movies.length > 0);
        this.genreRows.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleFavorite(movieId: number): void {
    if (!this.auth.isLoggedIn()) return;
    if (this.favoriteIds().has(movieId)) {
      this.movies.removeFavorite(movieId).subscribe(() => {
        const s = new Set(this.favoriteIds());
        s.delete(movieId);
        this.favoriteIds.set(s);
      });
    } else {
      this.movies.addFavorite(movieId).subscribe(() => {
        const s = new Set(this.favoriteIds());
        s.add(movieId);
        this.favoriteIds.set(s);
      });
    }
  }
}
