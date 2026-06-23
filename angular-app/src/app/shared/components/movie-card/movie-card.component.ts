import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieSummary } from '../../../core/models';
import { formatRating, posterFallback } from '../../../core/utils/format';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/movie', movie.id]" class="card">
      <div class="card__poster">
        @if (movie.posterUrl) {
          <img [src]="movie.posterUrl" [alt]="movie.title" loading="lazy" />
        } @else {
          <span class="card__fallback">{{ fallback }}</span>
        }
        <div class="card__overlay">
          <span class="card__play">▶</span>
          @if (movie.averageRating) {
            <span class="card__score">★ {{ rating }}</span>
          }
        </div>
      </div>
      <div class="card__info">
        <h3 class="card__title">{{ movie.title }}</h3>
        @if (movie.releaseYear) {
          <span class="card__year">{{ movie.releaseYear }}</span>
        }
      </div>
    </a>
  `,
  styles: [`
    .card {
      display: block; text-decoration: none; color: inherit;
      flex: 0 0 auto; width: var(--card-width, 160px);
      scroll-snap-align: start;
    }
    .card__poster {
      position: relative; aspect-ratio: 2/3; border-radius: 12px;
      overflow: hidden; background: #1c1c28;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      transition: transform 0.35s cubic-bezier(.25,.8,.25,1), box-shadow 0.35s;
    }
    .card:hover .card__poster {
      transform: scale(1.06) translateY(-6px);
      box-shadow: 0 16px 40px rgba(124,92,255,0.25);
    }
    .card__poster img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .card__fallback {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 100%; font-size: 2.5rem; font-weight: 700;
      background: linear-gradient(135deg, #2a1f4e, #1a1033); color: #ff6b4a;
    }
    .card__overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%);
      opacity: 0; transition: opacity 0.3s;
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 12px;
    }
    .card:hover .card__overlay { opacity: 1; }
    .card__play {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(255,107,74,0.9); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; padding-left: 3px;
    }
    .card__score { font-size: 0.82rem; color: #ffb347; font-weight: 600; }
    .card__info { padding: 10px 2px 0; }
    .card__title {
      margin: 0; font-size: 0.88rem; font-weight: 600; color: #eee;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .card__year { font-size: 0.75rem; color: rgba(255,255,255,0.45); }
  `],
})
export class MovieCardComponent {
  @Input({ required: true }) movie!: MovieSummary;

  get rating(): string {
    return formatRating(this.movie.averageRating);
  }

  get fallback(): string {
    return posterFallback(this.movie.title);
  }
}
