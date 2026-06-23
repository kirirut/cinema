import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stars" [class.stars--interactive]="interactive" role="group">
      @for (star of stars; track star) {
        <button
          type="button"
          class="stars__btn"
          [class.stars__btn--on]="star <= (hover || value)"
          [disabled]="!interactive"
          (mouseenter)="interactive && (hover = star)"
          (mouseleave)="hover = 0"
          (click)="interactive && rate.emit(star)"
          [attr.aria-label]="star + ' из 5'"
        >★</button>
      }
    </div>
  `,
  styles: [`
    .stars { display: inline-flex; gap: 2px; }
    .stars__btn {
      background: none; border: none; padding: 0; font-size: 1.1rem;
      color: rgba(255,255,255,0.2); cursor: default; line-height: 1;
      transition: color 0.15s, transform 0.15s;
    }
    .stars--interactive .stars__btn { cursor: pointer; }
    .stars__btn--on { color: #ffb347; }
    .stars--interactive .stars__btn:hover { transform: scale(1.15); color: #ffc966; }
  `],
})
export class StarRatingComponent {
  @Input() value = 0;
  @Input() interactive = false;
  @Output() rate = new EventEmitter<number>();
  stars = [1, 2, 3, 4, 5];
  hover = 0;
}
