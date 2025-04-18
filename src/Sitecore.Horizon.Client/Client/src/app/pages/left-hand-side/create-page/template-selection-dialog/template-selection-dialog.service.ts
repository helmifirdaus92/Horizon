/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { Observable } from 'rxjs';
import { TemplateSelectionDialogComponent } from './template-selection-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class TemplateSelectionDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(itemId: string, itemName: string): Observable<boolean> {
    const dialog = this.overlayService.open(TemplateSelectionDialogComponent, {
      size: 'FixedXLarge',
    });

    dialog.component.itemId = itemId;
    dialog.component.itemName = itemName;
    return dialog.component.onSelection;
  }
}
