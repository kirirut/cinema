import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { PasswordInputComponent } from '../../shared/components/password-input/password-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, PasswordInputComponent],
  template: `
    <div class="auth">
      <div class="auth__visual">
        <div class="auth__visual-inner">
          <span class="auth__logo">◆ CINEMA+</span>
          <p>Тысячи фильмов.<br />Оценки. Отзывы.<br />Ваш список.</p>
        </div>
      </div>
      <div class="auth__form-wrap">
        <form class="auth__form" (ngSubmit)="submit()">
          <h1>Вход</h1>
          @if (error()) { <div class="error">{{ error() }}</div> }
          <label>
            <span>Логин</span>
            <input [(ngModel)]="username" name="username" required autocomplete="username" />
          </label>
          <label>
            <span>Пароль</span>
            <app-password-input [(value)]="password" />
          </label>
          <button type="submit" class="btn" [disabled]="submitting()">
            {{ submitting() ? 'Вход…' : 'Войти' }}
          </button>
          <p class="auth__switch">Нет аккаунта? <a routerLink="/register">Регистрация</a></p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth {
      display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - 72px);
      margin: -72px -24px 0; border-radius: 0;
    }
    .auth__visual {
      background: linear-gradient(135deg, #1a1033 0%, #0a0a12 50%, #2a0a1a 100%);
      display: flex; align-items: center; justify-content: center; padding: 48px;
    }
    .auth__logo { font-size: 1.8rem; font-weight: 800; color: #fff; display: block; margin-bottom: 24px; }
    .auth__visual-inner p { font-size: 1.4rem; line-height: 1.6; color: rgba(255,255,255,0.55); margin: 0; }
    .auth__form-wrap {
      display: flex; align-items: center; justify-content: center; padding: 48px;
      background: #0e0e16;
    }
    .auth__form { width: 100%; max-width: 380px; }
    .auth__form h1 { margin: 0 0 28px; font-size: 1.8rem; }
    .auth__form label { display: block; margin-bottom: 16px; }
    .auth__form label span { display: block; font-size: 0.82rem; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
    .auth__form input {
      width: 100%; padding: 12px 14px; border-radius: 10px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      color: #fff; font-size: 0.95rem; box-sizing: border-box;
    }
    .btn {
      width: 100%; padding: 14px; border: none; border-radius: 10px; margin-top: 8px;
      background: linear-gradient(135deg, #ff6b4a, #7c5cff);
      color: #fff; font-weight: 700; font-size: 1rem; cursor: pointer;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .error {
      padding: 12px; margin-bottom: 16px; border-radius: 8px;
      background: rgba(255,80,80,0.12); color: #ff8888; font-size: 0.88rem;
    }
    .auth__switch { text-align: center; margin-top: 20px; font-size: 0.88rem; color: rgba(255,255,255,0.45); }
    .auth__switch a { color: #ff6b4a; }
    @media (max-width: 768px) {
      .auth { grid-template-columns: 1fr; }
      .auth__visual { display: none; }
    }
  `],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  username = '';
  password = '';
  error = signal('');
  submitting = signal(false);

  submit(): void {
    this.error.set('');
    this.submitting.set(true);
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        const ret = this.route.snapshot.queryParamMap.get('return') ?? '/';
        this.router.navigateByUrl(ret);
      },
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Ошибка входа');
        this.submitting.set(false);
      },
    });
  }
}
