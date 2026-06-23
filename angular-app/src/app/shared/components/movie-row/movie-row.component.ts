import { Component, Input } from '@angular/core';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { MovieSummary } from '../../../core/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-movie-row',
  standalone: true,
  imports: [MovieCardComponent, RouterLink],
  template: `
    <section class="row">
      <div class="row__head">
        <h2 class="row__title">{{ title }}</h2>
        @if (seeAllLink) {
          <a [routerLink]="seeAllLink" class="row__more">Смотреть все →</a>
        }
      </div>
      <div class="row__track">
        @for (movie of movies; track movie.id) {
          <app-movie-card [movie]="movie" />
        }
        @if (movies.length === 0) {
          <p class="row__empty">Пока пусто</p>
        }
      </div>
    </section>
  `,
  styles: [`
    .row { margin-bottom: 36px; }
    .row__head {
      display: flex; align-items: baseline; justify-content: space-between;
      margin-bottom: 14px; padding: 0 4px;
    }
    .row__title {
      margin: 0; font-size: 1.2rem; font-weight: 700; color: #fff;
      letter-spacing: -0.02em;
    }
    .row__more {
      font-size: 0.85rem; color: #ff6b4a; text-decoration: none;
      opacity: 0.85; transition: opacity 0.15s;
    }
    .row__more:hover { opacity: 1; }
    .row__track {
      display: flex; gap: 16px; overflow-x: auto; padding: 8px 4px 16px;
      scroll-snap-type: x mandatory; scrollbar-width: thin;
      scrollbar-color: rgba(255,107,74,0.4) transparent;
    }
    .row__track::-webkit-scrollbar { height: 4px; }
    .row__track::-webkit-scrollbar-thumb {
      background: rgba(255,107,74,0.4); border-radius: 4px;
    }
    .row__empty { color: rgba(255,255,255,0.35); font-size: 0.9rem; padding: 20px; }
  `],
})
export class MovieRowComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) movies: MovieSummary[] = [];
  @Input() seeAllLink: string | null = null;
}
