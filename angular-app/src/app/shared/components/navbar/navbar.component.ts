import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="nav" [class.nav--scrolled]="scrolled()">
      <div class="nav__inner">
        <a routerLink="/" class="nav__logo">
          <span class="nav__logo-icon">◆</span> CINEMA<span class="nav__logo-plus">+</span>
        </a>

        <nav class="nav__links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Главная</a>
          <a routerLink="/browse" routerLinkActive="active">Каталог</a>
          @if (auth.isLoggedIn()) {
            <a routerLink="/for-you" routerLinkActive="active">Для вас</a>
            <a routerLink="/my-list" routerLinkActive="active">Мой список</a>
          }
        </nav>

        <form class="nav__search" (ngSubmit)="search()">
          <input type="search" [(ngModel)]="query" name="q" placeholder="Фильмы, жанры…" aria-label="Поиск" />
          <button type="submit" aria-label="Искать">⌕</button>
        </form>

        <div class="nav__actions">
          @if (auth.isLoggedIn()) {
            <div class="nav__user">
              <button type="button" class="nav__avatar" (click)="menuOpen.set(!menuOpen())">
                {{ initial }}
              </button>
              @if (menuOpen()) {
                <div class="nav__dropdown">
                  <div class="nav__dropdown-head">
                    <strong>{{ auth.user()?.username }}</strong>
                    <span>{{ auth.user()?.email }}</span>
                  </div>
                  <a routerLink="/profile" (click)="menuOpen.set(false)">Профиль</a>
                  <a routerLink="/my-list" (click)="menuOpen.set(false)">Мой список</a>
                  <button type="button" class="nav__logout" (click)="logout()">Выйти</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="nav__login">Вход</a>
            <a routerLink="/register" class="nav__signup">Регистрация</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 16px 0; transition: background 0.35s, backdrop-filter 0.35s;
    }
    .nav--scrolled {
      background: rgba(10,10,18,0.92); backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .nav__inner {
      max-width: 1400px; margin: 0 auto; padding: 0 24px;
      display: flex; align-items: center; gap: 28px;
    }
    .nav__logo {
      font-size: 1.25rem; font-weight: 800; color: #fff;
      text-decoration: none; letter-spacing: -0.03em; white-space: nowrap;
    }
    .nav__logo-icon { color: #ff6b4a; margin-right: 4px; font-size: 0.9rem; }
    .nav__logo-plus { color: #7c5cff; }
    .nav__links {
      display: flex; gap: 20px;
    }
    .nav__links a {
      color: rgba(255,255,255,0.55); text-decoration: none;
      font-size: 0.88rem; font-weight: 500; transition: color 0.15s;
    }
    .nav__links a:hover, .nav__links a.active { color: #fff; }
    .nav__search {
      flex: 1; max-width: 320px; display: flex;
      background: rgba(255,255,255,0.07); border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.08); overflow: hidden;
      margin-left: auto;
    }
    .nav__search input {
      flex: 1; background: none; border: none; padding: 8px 14px;
      color: #fff; font-size: 0.88rem; outline: none;
    }
    .nav__search input::placeholder { color: rgba(255,255,255,0.35); }
    .nav__search button {
      background: none; border: none; padding: 0 14px;
      color: rgba(255,255,255,0.5); cursor: pointer; font-size: 1rem;
    }
    .nav__actions { display: flex; align-items: center; gap: 12px; }
    .nav__login {
      color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.88rem;
    }
    .nav__signup {
      padding: 8px 18px; border-radius: 8px;
      background: linear-gradient(135deg, #ff6b4a, #7c5cff);
      color: #fff; text-decoration: none; font-size: 0.85rem; font-weight: 600;
    }
    .nav__user { position: relative; }
    .nav__avatar {
      width: 36px; height: 36px; border-radius: 50%; border: 2px solid #7c5cff;
      background: rgba(124,92,255,0.2); color: #fff; font-weight: 700;
      cursor: pointer; font-size: 0.85rem;
    }
    .nav__dropdown {
      position: absolute; top: calc(100% + 8px); right: 0; min-width: 200px;
      background: #161622; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 8px 0; box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    }
    .nav__dropdown-head {
      padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex; flex-direction: column; gap: 2px;
    }
    .nav__dropdown-head strong { font-size: 0.9rem; }
    .nav__dropdown-head span { font-size: 0.75rem; color: rgba(255,255,255,0.45); }
    .nav__dropdown a, .nav__logout {
      display: block; width: 100%; text-align: left; padding: 10px 16px;
      color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.88rem;
      background: none; border: none; cursor: pointer;
    }
    .nav__dropdown a:hover, .nav__logout:hover { background: rgba(255,255,255,0.05); color: #fff; }
    .nav__logout { color: #ff6b6b; }
    @media (max-width: 900px) {
      .nav__links { display: none; }
      .nav__search { max-width: 180px; }
    }
  `],
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  query = '';
  scrolled = signal(false);
  menuOpen = signal(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => this.scrolled.set(window.scrollY > 40));
    }
  }

  get initial(): string {
    const u = this.auth.user();
    return (u?.firstName?.[0] ?? u?.username?.[0] ?? '?').toUpperCase();
  }

  search(): void {
    const q = this.query.trim();
    this.router.navigate(['/browse'], { queryParams: q ? { q } : {} });
  }

  logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
