/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, HostListener } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';

@Component({
  selector: 'app-dialog-notimplemented',
  templateUrl: './not-implemented-dialog.component.html',
  styleUrls: ['./not-implemented-dialog.component.scss'],
})
export class NotImplementedDialogComponent {
  constructor(private _closeHandle: DialogCloseHandle) {}

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    event.preventDefault();
    this.close();
  }

  close() {
    this._closeHandle.close();
  }
}
