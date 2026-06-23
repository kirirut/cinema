import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { MoviesService } from '../../core/services/movies.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [MovieCardComponent, RouterLink],
  template: `
    <div class="page">
      <h1>Мой список</h1>
      <p class="sub">Фильмы, которые вы сохранили</p>
      @if (loading()) {
        <div class="loading">Загрузка…</div>
      } @else if (items().length === 0) {
        <div class="empty">
          <span class="empty__icon">☆</span>
          <p>Список пуст</p>
          <a routerLink="/browse" class="btn">Найти фильмы</a>
        </div>
      } @else {
        <div class="grid">
          @for (m of items(); track m.id) {
            <app-movie-card [movie]="m" [style.--card-width]="'100%'" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    h1 { margin: 0 0 6px; font-size: 1.8rem; font-weight: 800; }
    .sub { color: rgba(255,255,255,0.45); margin: 0 0 28px; }
    .grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px;
    }
    .loading, .empty { text-align: center; padding: 60px; color: rgba(255,255,255,0.45); }
    .empty__icon { font-size: 2.5rem; display: block; margin-bottom: 12px; opacity: 0.4; }
    .btn {
      display: inline-block; margin-top: 16px; padding: 10px 24px; border-radius: 10px;
      background: linear-gradient(135deg, #ff6b4a, #7c5cff); color: #fff;
      text-decoration: none; font-weight: 600;
    }
  `],
})
export class FavoritesComponent implements OnInit {
  private readonly moviesSvc = inject(MoviesService);
  items = signal<import('../../core/models').MovieSummary[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.moviesSvc.getFavorites().subscribe({
      next: (favs) => {
        this.items.set(favs.map((f) => f.movie));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
