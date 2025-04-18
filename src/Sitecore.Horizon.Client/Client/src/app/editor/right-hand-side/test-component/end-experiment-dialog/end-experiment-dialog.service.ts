/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { BXComponentVariant } from 'app/pages/left-hand-side/personalization/personalization.types';
import { Observable } from 'rxjs';
import { EndExperimentDialogComponent } from './end-experiment-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class EndExperimentDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(options: {
    variants: BXComponentVariant[];
    isStatisticalSignificanceReached: boolean;
  }): Observable<BXComponentVariant> {
    const comp = this.overlayService.open(EndExperimentDialogComponent, {
      size: 'AutoHeight',
    });

    comp.component.variants = options.variants;
    comp.component.isStatisticalSignificanceReached = options.isStatisticalSignificanceReached;
    return comp.component.onSave;
  }
}
