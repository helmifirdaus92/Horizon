/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { NotImplementedDialogComponent } from './not-implemented-dialog.component';

@Injectable({ providedIn: 'root' })
export class NotImplementedDialogService {
  constructor(private _dialogService: DialogOverlayService) {}

  show() {
    const { onBackdropClick, component } = this._dialogService.open(NotImplementedDialogComponent, {
      size: 'FixedSmall',
    });

    onBackdropClick.subscribe(() => component.close());
  }
}
