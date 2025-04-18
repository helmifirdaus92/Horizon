/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-toggle-buttons',
  standalone: true,
  imports: [CommonModule],
  template: `<div [ngClass]="containerClass">
    <ng-content></ng-content>
  </div>`,
  styleUrls: ['./toggle-buttons.component.scss'],
})
export class ToggleButtonsComponent {
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() hasBorder: boolean = false;

  get containerClass(): string {
    return `${this.orientation} ${this.hasBorder ? 'border' : ''}`;
  }
}
