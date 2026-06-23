import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <h1>Профиль</h1>
      @if (user()) {
        <div class="card">
          <div class="avatar">{{ user()!.username.charAt(0).toUpperCase() }}</div>
          <div>
            <strong>{{ user()!.username }}</strong>
            <span>{{ user()!.roles.join(', ') }}</span>
          </div>
        </div>
        <form (ngSubmit)="save()">
          @if (msg()) { <div class="success">{{ msg() }}</div> }
          @if (error()) { <div class="error">{{ error() }}</div> }
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
          <label>
            <span>Email</span>
            <input [(ngModel)]="email" name="email" type="email" required />
          </label>
          <button type="submit" class="btn" [disabled]="saving()">Сохранить</button>
        </form>
      }
    </div>
  `,
  styles: [`
    h1 { margin: 0 0 24px; font-size: 1.8rem; font-weight: 800; }
    .card {
      display: flex; align-items: center; gap: 16px; padding: 20px;
      background: rgba(255,255,255,0.04); border-radius: 14px; margin-bottom: 28px;
    }
    .avatar {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #ff6b4a, #7c5cff);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; font-weight: 800;
    }
    .card strong { display: block; font-size: 1.1rem; }
    .card span { font-size: 0.82rem; color: rgba(255,255,255,0.45); }
    form { max-width: 480px; }
    label { display: block; margin-bottom: 14px; }
    label span { display: block; font-size: 0.82rem; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
    input {
      width: 100%; padding: 12px 14px; border-radius: 10px; box-sizing: border-box;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff;
    }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .btn {
      padding: 12px 28px; border: none; border-radius: 10px; margin-top: 8px;
      background: linear-gradient(135deg, #ff6b4a, #7c5cff); color: #fff; font-weight: 700; cursor: pointer;
    }
    .success { padding: 12px; margin-bottom: 12px; border-radius: 8px; background: rgba(80,200,120,0.12); color: #6fdc8c; }
    .error { padding: 12px; margin-bottom: 12px; border-radius: 8px; background: rgba(255,80,80,0.12); color: #ff8888; }
    @media (max-width: 600px) { .row { grid-template-columns: 1fr; } }
  `],
})
export class ProfileComponent implements OnInit {
  private readonly auth = inject(AuthService);
  user = this.auth.user;
  firstName = '';
  lastName = '';
  email = '';
  msg = signal('');
  error = signal('');
  saving = signal(false);

  ngOnInit(): void {
    const u = this.auth.user();
    if (u) {
      this.firstName = u.firstName ?? '';
      this.lastName = u.lastName ?? '';
      this.email = u.email;
    }
  }

  save(): void {
    this.msg.set('');
    this.error.set('');
    this.saving.set(true);
    this.auth.updateProfile({ firstName: this.firstName, lastName: this.lastName, email: this.email }).subscribe({
      next: () => {
        this.msg.set('Профиль сохранён');
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Ошибка');
        this.saving.set(false);
      },
    });
  }
}
