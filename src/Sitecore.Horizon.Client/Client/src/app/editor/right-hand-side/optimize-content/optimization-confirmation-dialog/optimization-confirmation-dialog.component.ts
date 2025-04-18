/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';

export type OptimizationDecisionType = 'keep' | 'discard' | 'cancel';

@Component({
  selector: 'app-optimization-confirmation-dialog',
  templateUrl: './optimization-confirmation-dialog.component.html',
  styleUrls: ['./optimization-confirmation-dialog.component.scss'],
})
export class OptimizationConfirmationDialogComponent {
  readonly onAction = new EventEmitter<OptimizationDecisionType>();

  constructor(private readonly closeHandle: DialogCloseHandle) {}

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  cancel() {
    this.onAction.next('cancel');
    this.close();
  }

  keepChanges() {
    this.onAction.next('keep');
    this.close();
  }

  discardChanges() {
    this.onAction.next('discard');
    this.close();
  }

  private close() {
    this.onAction.complete();
    this.closeHandle.close();
  }
}
