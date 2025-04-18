/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'ng-spd-page-pane',
  template: '<ng-content></ng-content>',
  styleUrls: ['./page-pane.component.scss'],
  host: {
    '[class.show]': 'show',
    '[class.hide]': 'hide',
  },
})
export class PagePaneComponent {
  private _show = false;
  get show() {
    return this._show;
  }
  @Input()
  set show(value: boolean) {
    this._show = value;
    if (value) {
      this._hide = false;
    }
  }

  private _hide = false;
  get hide() {
    return this._hide;
  }
  @Input()
  set hide(value: boolean) {
    this._hide = value;
    if (value) {
      this._show = false;
    }
  }

  constructor(public elementRef: ElementRef) {}
}
