/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { DialogCloseHandle, DialogOverlayService } from '@sitecore/ng-spd-lib';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
})
export class ErrorDialogComponent {
  @Input() title = 'Dialog title';
  @Input() text = 'Dialog text';

  static show(dialogService: DialogOverlayService) {
    return dialogService.open(ErrorDialogComponent, {
      size: 'FixedSmall',
    });
  }

  constructor(private _closeHandle: DialogCloseHandle) {}

  close() {
    this._closeHandle.close();
  }
}
