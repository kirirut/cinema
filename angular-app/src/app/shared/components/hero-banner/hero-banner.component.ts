import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieSummary } from '../../../core/models';
import { formatRating } from '../../../core/utils/format';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (movie) {
      <section class="hero">
        @if (movie.posterUrl) {
          <div class="hero__bg" [style.backgroundImage]="'url(' + movie.posterUrl + ')'"></div>
        }
        <div class="hero__gradient"></div>
        <div class="hero__content">
          <span class="hero__badge">Премьера</span>
          <h1 class="hero__title">{{ movie.title }}</h1>
          @if (movie.originalTitle && movie.originalTitle !== movie.title) {
            <p class="hero__sub">{{ movie.originalTitle }}</p>
          }
          <div class="hero__meta">
            @if (movie.releaseYear) { <span>{{ movie.releaseYear }}</span> }
            @if (movie.ageRating) { <span class="hero__age">{{ movie.ageRating }}</span> }
            @if (movie.averageRating) {
              <span class="hero__rating">★ {{ rating }}</span>
            }
            @for (g of movie.genres.slice(0, 3); track g.id) {
              <span class="hero__genre">{{ g.name }}</span>
            }
          </div>
          <div class="hero__actions">
            <a [routerLink]="['/movie', movie.id]" class="btn btn--primary">
              ▶ Смотреть
            </a>
            <button type="button" class="btn btn--ghost" (click)="addList.emit(movie.id)">
              {{ inList ? '✓ В списке' : '+ Мой список' }}
            </button>
          </div>
        </div>
      </section>
    }
  `,
  styles: [`
    .hero {
      position: relative; min-height: 72vh; max-height: 640px;
      display: flex; align-items: flex-end; overflow: hidden;
      margin: -72px -24px 40px; border-radius: 0 0 24px 24px;
    }
    .hero__bg {
      position: absolute; inset: 0;
      background-size: cover; background-position: center top;
      transform: scale(1.05);
    }
    .hero__gradient {
      position: absolute; inset: 0;
      background:
        linear-gradient(to top, #0a0a12 0%, rgba(10,10,18,0.7) 40%, rgba(10,10,18,0.2) 100%),
        linear-gradient(to right, rgba(10,10,18,0.95) 0%, transparent 60%);
    }
    .hero__content {
      position: relative; z-index: 1; padding: 0 48px 56px; max-width: 620px;
    }
    .hero__badge {
      display: inline-block; padding: 4px 12px; border-radius: 20px;
      background: linear-gradient(135deg, #ff6b4a, #7c5cff);
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; margin-bottom: 16px;
    }
    .hero__title {
      margin: 0 0 8px; font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 800; line-height: 1.05; letter-spacing: -0.03em;
      text-shadow: 0 4px 24px rgba(0,0,0,0.5);
    }
    .hero__sub { margin: 0 0 16px; color: rgba(255,255,255,0.55); font-size: 1rem; }
    .hero__meta {
      display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
      margin-bottom: 24px; font-size: 0.88rem; color: rgba(255,255,255,0.65);
    }
    .hero__age {
      border: 1px solid rgba(255,255,255,0.3); padding: 1px 8px;
      border-radius: 4px; font-size: 0.78rem;
    }
    .hero__rating { color: #ffb347; font-weight: 600; }
    .hero__genre {
      padding: 2px 10px; background: rgba(255,255,255,0.08);
      border-radius: 12px; font-size: 0.78rem;
    }
    .hero__actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 28px; border-radius: 10px; font-size: 0.95rem;
      font-weight: 600; cursor: pointer; border: none; text-decoration: none;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .btn--primary {
      background: linear-gradient(135deg, #ff6b4a, #e84a3a);
      color: #fff; box-shadow: 0 4px 20px rgba(255,107,74,0.4);
    }
    .btn--primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,107,74,0.5); }
    .btn--ghost {
      background: rgba(255,255,255,0.1); color: #fff;
      border: 1px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(8px);
    }
    .btn--ghost:hover { background: rgba(255,255,255,0.18); }
    @media (max-width: 768px) {
      .hero { margin: -64px -16px 32px; min-height: 60vh; }
      .hero__content { padding: 0 20px 40px; }
    }
  `],
})
export class HeroBannerComponent {
  @Input() movie: MovieSummary | null = null;
  @Input() inList = false;
  @Output() addList = new EventEmitter<number>();

  get rating(): string {
    return this.movie ? formatRating(this.movie.averageRating) : '—';
  }
}
