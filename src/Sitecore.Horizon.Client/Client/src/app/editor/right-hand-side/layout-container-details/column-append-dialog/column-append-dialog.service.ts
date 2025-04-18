/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { LayoutTemplatesKey } from '../layout-size-templates';
import { ColumnAppendDialogComponent } from './column-append-dialog.component';

@Injectable({ providedIn: 'root' })
export class ColumnAppendDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  showColumnAppendDialog(previousColumnCount: number, newColumnCount: number, templateKey: LayoutTemplatesKey): void {
    const comp = this.overlayService.open(ColumnAppendDialogComponent, {
      size: 'AutoHeight',
    });
    comp.component.previousColumnCount = previousColumnCount;
    comp.component.newEnabledColumnCount = newColumnCount;
    comp.component.templateKey = templateKey;
  }
}
