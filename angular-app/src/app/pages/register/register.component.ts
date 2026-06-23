import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { PasswordInputComponent } from '../../shared/components/password-input/password-input.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, PasswordInputComponent],
  template: `
    <div class="auth">
      <div class="auth__visual">
        <div class="auth__visual-inner">
          <span class="auth__logo">◆ CINEMA+</span>
          <p>Персональные<br />рекомендации<br />и ваш список.</p>
        </div>
      </div>
      <div class="auth__form-wrap">
        <form class="auth__form" (ngSubmit)="submit()">
          <h1>Регистрация</h1>
          @if (error()) { <div class="error">{{ error() }}</div> }
          <label>
            <span>Логин *</span>
            <input [(ngModel)]="username" name="username" required maxlength="50" />
          </label>
          <label>
            <span>Email *</span>
            <input [(ngModel)]="email" name="email" type="email" required />
          </label>
          <label>
            <span>Пароль * (мин. 6)</span>
            <app-password-input [(value)]="password" />
          </label>
          <div class="row">
            <label>
              <span>Имя</span>
              <input [(ngModel)]="firstName" name="firstName" />
            </label>
            <label>
              <span>Фамилия</span>
              <input [(ngModel)]="lastName" name="lastName" />
            </label>
          </div>
          <button type="submit" class="btn" [disabled]="submitting()">
            {{ submitting() ? 'Создание…' : 'Создать аккаунт' }}
          </button>
          <p class="auth__switch">Есть аккаунт? <a routerLink="/login">Войти</a></p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth {
      display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - 72px);
      margin: -72px -24px 0;
    }
    .auth__visual {
      background: linear-gradient(135deg, #2a0a1a 0%, #0a0a12 50%, #1a1033 100%);
      display: flex; align-items: center; justify-content: center; padding: 48px;
    }
    .auth__logo { font-size: 1.8rem; font-weight: 800; color: #fff; display: block; margin-bottom: 24px; }
    .auth__visual-inner p { font-size: 1.4rem; line-height: 1.6; color: rgba(255,255,255,0.55); margin: 0; }
    .auth__form-wrap {
      display: flex; align-items: center; justify-content: center; padding: 48px;
      background: #0e0e16;
    }
    .auth__form { width: 100%; max-width: 420px; }
    .auth__form h1 { margin: 0 0 24px; font-size: 1.8rem; }
    .auth__form label { display: block; margin-bottom: 14px; }
    .auth__form label span { display: block; font-size: 0.82rem; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
    .auth__form input {
      width: 100%; padding: 12px 14px; border-radius: 10px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      color: #fff; font-size: 0.95rem; box-sizing: border-box;
    }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .btn {
      width: 100%; padding: 14px; border: none; border-radius: 10px; margin-top: 8px;
      background: linear-gradient(135deg, #ff6b4a, #7c5cff);
      color: #fff; font-weight: 700; cursor: pointer;
    }
    .error {
      padding: 12px; margin-bottom: 16px; border-radius: 8px;
      background: rgba(255,80,80,0.12); color: #ff8888; font-size: 0.88rem;
    }
    .auth__switch { text-align: center; margin-top: 20px; font-size: 0.88rem; color: rgba(255,255,255,0.45); }
    .auth__switch a { color: #ff6b4a; }
    @media (max-width: 768px) {
      .auth { grid-template-columns: 1fr; }
      .auth__visual { display: none; }
      .row { grid-template-columns: 1fr; }
    }
  `],
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  error = signal('');
  submitting = signal(false);

  submit(): void {
    this.error.set('');
    this.submitting.set(true);
    this.auth.register({
      username: this.username,
      email: this.email,
      password: this.password,
      firstName: this.firstName || undefined,
      lastName: this.lastName || undefined,
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Ошибка регистрации');
        this.submitting.set(false);
      },
    });
  }
}
