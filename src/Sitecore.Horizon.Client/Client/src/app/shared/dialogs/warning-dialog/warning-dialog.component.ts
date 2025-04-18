/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener, Input } from '@angular/core';
import { DialogCloseHandle, DialogOverlayService } from '@sitecore/ng-spd-lib';

@Component({
  selector: 'app-warning-dialog',
  templateUrl: './warning-dialog.component.html',
})
export class WarningDialogComponent {
  @Input() title = 'Dialog title';
  @Input() text = 'Dialog text';
  @Input() declineText = 'Decline';
  @Input() confirmText = 'Confirm';

  dialogResultEvent = new EventEmitter<{ confirmed: boolean }>();

  static show(overlayService: DialogOverlayService) {
    return overlayService.open(WarningDialogComponent, {
      size: 'AutoHeight',
    });
  }

  constructor(private _closeHandle: DialogCloseHandle) {}

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this._closeHandle.close();
    }
  }

  onConfirmClick() {
    this.dialogResultEvent.emit({ confirmed: true });
    this._closeHandle.close();
  }

  onDeclineClick() {
    this.dialogResultEvent.emit({ confirmed: false });
    this._closeHandle.close();
  }
}
