/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostBinding, Input, Output } from '@angular/core';

export type Size = 'md' | 'lg' | 'sm' | 'xs';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [CommonModule],
  template: ` <i class="normal mdi mdi-{{ icon }}"></i>
    <ng-content></ng-content>
    <button
      *ngIf="isDismissible"
      (click)="onDismiss($event)"
      class="mdi mdi-s mdi-close"
      [title]="dismissButtonLabel"
    ></button>`,
  styleUrls: ['./tag.component.scss'],
  host: {
    '[class]': 'size',
    '(click)': '$event.stopPropagation()',
  },
})
export class TagComponent {
  @Input() icon = '';
  @Input() size: Size = 'md';
  @Input() isDismissible = false;
  @Input() dismissButtonLabel = '';

  @Output() actionClick = new EventEmitter<MouseEvent>();

  @HostBinding('attr.tabindex')
  get tabindex() {
    return this.isDismissible ? -1 : 1;
  }

  @HostBinding('class.ng-spd-tag-dismissible')
  get dismissible() {
    return this.isDismissible;
  }

  constructor(public el: ElementRef) {}

  onDismiss(event: MouseEvent) {
    this.el.nativeElement.remove();
    this.actionClick.emit(event);
  }
}
