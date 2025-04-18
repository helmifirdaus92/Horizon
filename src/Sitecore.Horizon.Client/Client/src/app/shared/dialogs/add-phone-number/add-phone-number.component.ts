/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  ButtonModule,
  DialogCloseHandle,
  DialogModule,
  DialogOverlayService,
  InputLabelModule,
} from '@sitecore/ng-spd-lib';
import { EditRteContentResult } from 'app/editor/right-hand-side/rich-text-editor/rich-text-editor.types';

@Component({
  selector: 'app-add-phone-number',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, TranslateModule, InputLabelModule, FormsModule],
  templateUrl: './add-phone-number.component.html',
  styleUrl: './add-phone-number.component.scss',
})
export class AddPhoneNumberComponent {
  value = '';

  dialogResultEvent = new EventEmitter<EditRteContentResult>();

  static show(overlayService: DialogOverlayService) {
    return overlayService.open(AddPhoneNumberComponent, {
      size: 'AutoHeightMedium',
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
