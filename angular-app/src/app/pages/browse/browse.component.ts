import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { MoviesService } from '../../core/services/movies.service';
import { Catalog, MovieSummary } from '../../core/models';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, MovieCardComponent, FormsModule],
  template: `
    <div class="browse">
      <div class="browse__head">
        <h1>{{ title() }}</h1>
        <span class="browse__count">{{ total() }} фильмов</span>
      </div>

      <div class="browse__filters">
        <select [(ngModel)]="genreId" (ngModelChange)="applyFilters()">
          <option [ngValue]="null">Все жанры</option>
          @for (g of catalog()?.genres; track g.id) {
            <option [ngValue]="g.id">{{ g.name }}</option>
          }
        </select>
        <select [(ngModel)]="countryId" (ngModelChange)="applyFilters()">
          <option [ngValue]="null">Все страны</option>
          @for (c of catalog()?.countries; track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
        <input type="number" [(ngModel)]="yearFrom" placeholder="Год от" (change)="applyFilters()" />
        <input type="number" [(ngModel)]="yearTo" placeholder="до" (change)="applyFilters()" />
      </div>

      @if (loading()) {
        <div class="loading">Загрузка…</div>
      } @else if (movies().length === 0) {
        <div class="empty">Ничего не найдено</div>
      } @else {
        <div class="grid">
          @for (movie of movies(); track movie.id) {
            <app-movie-card [movie]="movie" [style.--card-width]="'100%'" />
          }
        </div>
        @if (totalPages() > 1) {
          <div class="pager">
            <button type="button" [disabled]="page === 0" (click)="goPage(page - 1)">←</button>
            <span>{{ page + 1 }} / {{ totalPages() }}</span>
            <button type="button" [disabled]="page >= totalPages() - 1" (click)="goPage(page + 1)">→</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .browse__head {
      display: flex; align-items: baseline; gap: 16px; margin-bottom: 24px;
    }
    .browse__head h1 { margin: 0; font-size: 1.8rem; font-weight: 800; }
    .browse__count { color: rgba(255,255,255,0.4); font-size: 0.88rem; }
    .browse__filters {
      display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 28px;
      padding: 16px; background: rgba(255,255,255,0.04);
      border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);
    }
    .browse__filters select, .browse__filters input {
      padding: 8px 14px; border-radius: 8px;
      background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
      color: #fff; font-size: 0.88rem;
    }
    .browse__filters input { width: 90px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 20px;
    }
    .pager {
      display: flex; align-items: center; justify-content: center;
      gap: 16px; margin-top: 32px;
    }
    .pager button {
      padding: 8px 16px; border-radius: 8px;
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
      color: #fff; cursor: pointer;
    }
    .pager button:disabled { opacity: 0.35; cursor: not-allowed; }
    .loading, .empty { text-align: center; padding: 60px; color: rgba(255,255,255,0.45); }
  `],
})
export class BrowseComponent implements OnInit {
  private readonly moviesSvc = inject(MoviesService);
  private readonly route = inject(ActivatedRoute);

  catalog = signal<Catalog | null>(null);
  movies = signal<MovieSummary[]>([]);
  loading = signal(true);
  title = signal('Каталог');
  total = signal(0);
  totalPages = signal(0);
  page = 0;
  genreId: number | null = null;
  countryId: number | null = null;
  yearFrom: number | null = null;
  yearTo: number | null = null;
  private q = '';

  ngOnInit(): void {
    this.moviesSvc.getCatalog().subscribe((c) => this.catalog.set(c));
    this.route.queryParams.subscribe((params) => {
      this.q = params['q'] ?? '';
      this.genreId = params['genreId'] ? +params['genreId'] : null;
      this.countryId = params['countryId'] ? +params['countryId'] : null;
      this.page = params['page'] ? +params['page'] : 0;
      this.title.set(
        this.q ? `Поиск: «${this.q}»` :
        this.genreId ? (this.catalog()?.genres.find(g => g.id === this.genreId)?.name ?? 'Жанр') :
        'Каталог',
      );
      this.load();
    });
  }

  applyFilters(): void {
    this.page = 0;
    this.load();
  }

  goPage(p: number): void {
    this.page = p;
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.moviesSvc.search({
      q: this.q || undefined,
      genreId: this.genreId ?? undefined,
      countryId: this.countryId ?? undefined,
      yearFrom: this.yearFrom ?? undefined,
      yearTo: this.yearTo ?? undefined,
      page: this.page,
      size: 24,
    }).subscribe({
      next: (res) => {
        this.movies.set(res.content);
        this.total.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
