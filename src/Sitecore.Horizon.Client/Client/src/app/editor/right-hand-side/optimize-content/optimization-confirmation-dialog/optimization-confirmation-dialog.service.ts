/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { Observable } from 'rxjs';
import {
  OptimizationConfirmationDialogComponent,
  OptimizationDecisionType,
} from './optimization-confirmation-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class OptimizationConfirmationDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(): Observable<OptimizationDecisionType> {
    const comp = this.overlayService.open(OptimizationConfirmationDialogComponent, {
      size: 'AutoHeight',
    });

    return comp.component.onAction;
  }
}
