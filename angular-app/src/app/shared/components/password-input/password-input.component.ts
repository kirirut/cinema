import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-password-input',
  standalone: true,
  template: `
    <div class="wrap">
      <input [type]="visible ? 'text' : 'password'" [value]="value" (input)="onInput($event)" autocomplete="current-password" />
      <button type="button" (click)="visible = !visible" tabindex="-1" aria-label="Показать пароль">
        {{ visible ? '🙈' : '👁' }}
      </button>
    </div>
  `,
  styles: [`
    .wrap { position: relative; display: flex; }
    input {
      width: 100%; padding: 12px 44px 12px 14px; border-radius: 10px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      color: #fff; font-size: 0.95rem; box-sizing: border-box;
    }
    button {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; opacity: 0.6;
    }
  `],
})
export class PasswordInputComponent {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  visible = false;

  onInput(e: Event): void {
    this.valueChange.emit((e.target as HTMLInputElement).value);
  }
}
