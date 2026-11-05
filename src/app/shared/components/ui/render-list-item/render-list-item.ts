import { Component, effect, inject, input, output, signal } from '@angular/core';
import { AppearanceService } from '@shared/services';

@Component({
  selector: 'app-render-list-item',
  imports: [],
  templateUrl: './render-list-item.html',
  styleUrl: './render-list-item.css',
})
export class RenderListItem {
  public appearanceService = inject(AppearanceService);
  public title = input('');
  public subtitle = input('');
  public accentColor = input('');
  public image = input('');
  public imagePlaceholder = input('');
  public onRenderItemClick = output();
  public isImageLoaded = signal(false);

  constructor() {
    effect(() => {
      const src = this.image() || this.imagePlaceholder();
      const img = new Image();
      img.onload = img.onerror = () => this.isImageLoaded.set(true);
      img.src = src;
      this.isImageLoaded.set(!src || img.complete);
    });
  }

  handleRenderItemClick() {
    this.onRenderItemClick.emit();
  }
}
