/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { AccessPermissions } from 'app/page-design/page-templates.types';
import { Observable } from 'rxjs';
import { DuplicateItemDialogComponent } from './duplicate-item-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DuplicateItemDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(options: {
    parentId: string;
    itemId: string;
    existingNames: string[];
    name: string;
    pageDesignId?: string;
  }): Observable<{ itemId: string; displayName: string; access: AccessPermissions } | null> {
    const comp = this.overlayService.open(DuplicateItemDialogComponent, {
      size: 'AutoHeight',
    });

    comp.component.existingNames = options.existingNames;
    comp.component.parentId = options.parentId;
    comp.component.itemId = options.itemId;
    comp.component.itemName = options.name;
    comp.component.pageDesignId = options.pageDesignId;
    return comp.component.onDuplicate;
  }
}
