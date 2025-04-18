/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';

@Component({
  selector: 'app-workflow-confirmation-dialog',
  templateUrl: './workflow-confirmation-dialog.component.html',
  styleUrls: ['./workflow-confirmation-dialog.component.scss'],
})
export class WorkflowConfirmationDialogComponent {
  public comment = '';
  public onClose = new EventEmitter<{ state: 'canceled' | 'submitted'; comment: string }>();

  constructor(private closeHandle: DialogCloseHandle) {}

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close('canceled');
    }
  }

  public close(state: 'canceled' | 'submitted') {
    this.onClose.emit({ state, comment: this.comment });
    this.onClose.complete();
    this.closeHandle.close();
  }
}
