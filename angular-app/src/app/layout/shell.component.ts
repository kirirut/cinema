import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="main">
      <router-outlet />
    </main>
    <footer class="footer">
      <p>CINEMA+ — стриминговый каталог фильмов</p>
    </footer>
  `,
  styles: [`
    .main {
      min-height: 100vh;
      padding: 72px 24px 48px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .footer {
      text-align: center;
      padding: 24px;
      color: rgba(255,255,255,0.25);
      font-size: 0.82rem;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    @media (max-width: 768px) {
      .main { padding: 64px 16px 32px; }
    }
  `],
})
export class ShellComponent {}
