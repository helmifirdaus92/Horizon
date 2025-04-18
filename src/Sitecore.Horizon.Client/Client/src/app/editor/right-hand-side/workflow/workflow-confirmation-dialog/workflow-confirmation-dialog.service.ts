/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { Observable } from 'rxjs';
import { WorkflowConfirmationDialogComponent } from './workflow-confirmation-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class WorkflowConfirmationDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(): Observable<{ state: 'canceled' | 'submitted'; comment: string }> {
    const comp = this.overlayService.open(WorkflowConfirmationDialogComponent, {
      size: 'AutoHeight',
    });

    return comp.component.onClose;
  }
}
