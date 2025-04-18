/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { Item } from 'app/page-design/page-templates.types';
import { Observable } from 'rxjs';
import { RenameItemDialogComponent } from './rename-item-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class RenameItemDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(options: { itemId: string; itemName: string; existingNames: string[] }): Observable<Item | null> {
    const comp = this.overlayService.open(RenameItemDialogComponent, {
      size: 'AutoHeight',
    });

    comp.component.existingNames = options.existingNames;
    comp.component.itemId = options.itemId;
    comp.component.itemName = options.itemName;
    return comp.component.onRename;
  }
}
