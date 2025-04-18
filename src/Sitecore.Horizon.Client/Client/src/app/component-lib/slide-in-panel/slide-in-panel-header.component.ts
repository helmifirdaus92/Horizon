/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Size } from '@sitecore/ng-spd-lib/lib/button/button-variant.type';

@Component({
  selector: 'ng-spd-slide-in-panel-header',
  template: `
    <button
      *ngIf="showBackButton"
      type="button"
      [size]="size"
      ngSpdIconButton
      [icon]="icon"
      aria-label="options"
      (click)="back.emit()"
    ></button>
    <h4 [class.pl-md]="!showBackButton">
      <ng-content></ng-content>
    </h4>
  `,
  styleUrls: ['./slide-in-panel-header.component.scss'],
})
export class SlideInPanelHeaderComponent {
  @Input() icon: 'arrow-left' | 'close' = 'arrow-left';
  @Input() showBackButton = true;
  @Input() size: Size = 'md';
  @Output() back = new EventEmitter();
}
