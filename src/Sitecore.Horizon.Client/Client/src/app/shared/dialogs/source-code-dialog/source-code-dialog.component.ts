/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input } from '@angular/core';
import { DialogCloseHandle, DialogOverlayService } from '@sitecore/ng-spd-lib';
import { EditRteContentResult } from 'app/editor/right-hand-side/rich-text-editor/rich-text-editor.types';

@Component({
  selector: 'app-source-dialog',
  templateUrl: './source-code-dialog.component.html',
  styleUrls: ['./source-code-dialog.component.scss'],
})
export class EditSourceCodeDialogComponent {
  @Input() value = '';

  dialogResultEvent = new EventEmitter<EditRteContentResult>();

  static show(overlayService: DialogOverlayService) {
    return overlayService.open(EditSourceCodeDialogComponent, {
      size: 'FixedXLarge',
    });
  }

  constructor(private _closeHandle: DialogCloseHandle) {}

  onConfirmClick() {
    this.dialogResultEvent.emit({ status: 'OK', value: this.value });
    this._closeHandle.close();
  }

  onDeclineClick() {
    this.dialogResultEvent.emit({ status: 'Canceled' });
    this._closeHandle.close();
  }
}
