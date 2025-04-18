/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Directive } from '@angular/core';

/**
 * This directive works with global styles.
 * See `_dragndrop.directive.scss` imported in `styles.scss`.
 */
@Directive({
  selector: '[appDragndropContainer]',
  host: {
    '[class._dragndrop_mode_]': '_dragMode',
  },
})
export class DragndropContainerDirective {
  _dragMode = false;

  dragstart() {
    this._dragMode = true;
  }

  dragend() {
    this._dragMode = false;
  }
}
