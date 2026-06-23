import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieRowComponent } from '../../shared/components/movie-row/movie-row.component';
import { MoviesService } from '../../core/services/movies.service';
import { MovieSummary } from '../../core/models';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [MovieRowComponent, RouterLink],
  template: `
    <div class="page">
      <h1>Для вас</h1>
      <p class="sub">Подборка на основе ваших любимых жанров и высоких оценок</p>
      @if (loading()) {
        <div class="loading">Загрузка…</div>
      } @else if (error()) {
        <div class="error">{{ error() }} <button type="button" (click)="load()">Повторить</button></div>
      } @else if (movies().length === 0) {
        <div class="empty">
          <span class="empty__icon">✦</span>
          <p>Оцените фильмы на 4–5 звёзд — и мы подберём похожие</p>
          <a routerLink="/browse" class="btn">В каталог</a>
        </div>
      } @else {
        <app-movie-row title="Рекомендуем посмотреть" [movies]="movies()" />
      }
    </div>
  `,
  styles: [`
    h1 { margin: 0 0 6px; font-size: 1.8rem; font-weight: 800; }
    .sub { color: rgba(255,255,255,0.45); margin: 0 0 28px; }
    .loading, .empty, .error { text-align: center; padding: 60px; color: rgba(255,255,255,0.45); }
    .empty__icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }
    .error button {
      margin-top: 12px; padding: 8px 16px; border-radius: 8px;
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
      color: #fff; cursor: pointer;
    }
    .btn {
      display: inline-block; margin-top: 16px; padding: 10px 24px; border-radius: 10px;
      background: linear-gradient(135deg, #ff6b4a, #7c5cff); color: #fff;
      text-decoration: none; font-weight: 600;
    }
  `],
})
export class RecommendationsComponent implements OnInit {
  private readonly moviesSvc = inject(MoviesService);
  movies = signal<MovieSummary[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.moviesSvc.getRecommendations().subscribe({
      next: (m) => {
        this.movies.set(m);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Не удалось загрузить рекомендации');
        this.loading.set(false);
      },
    });
  }
}
