/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener, Input } from '@angular/core';
import { DialogCloseHandle, DialogOverlayService } from '@sitecore/ng-spd-lib';

export type RenameItemResult = { status: 'OK'; itemName: string; displayName: string } | { status: 'Canceled' };

@Component({
  selector: 'app-rename-item-dialog',
  templateUrl: './rename-item-dialog.component.html',
  styleUrls: ['./rename-item-dialog.component.scss'],
})
export class RenameItemDialogComponent {
  @Input() displayName = '';

  // Split current and initial value in order to keep the dialog title static when user change itemName
  @Input() set itemName(value: string) {
    this.itemNameInitialValue = value ?? '';
    this.itemNameCurrentValue = value ?? '';
  }

  itemNameInitialValue = '';
  itemNameCurrentValue = '';

  dialogResultEvent = new EventEmitter<RenameItemResult>();

  static show(overlayService: DialogOverlayService) {
    return overlayService.open(RenameItemDialogComponent, {
      size: 'AutoHeightLarge',
    });
  }

  constructor(private _closeHandle: DialogCloseHandle) {}

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.onDeclineClick();
    }
  }

  onConfirmClick() {
    this.dialogResultEvent.emit({ status: 'OK', itemName: this.itemNameCurrentValue, displayName: this.displayName });
    this._closeHandle.close();
  }

  onDeclineClick() {
    this.dialogResultEvent.emit({ status: 'Canceled' });
    this._closeHandle.close();
  }
}
