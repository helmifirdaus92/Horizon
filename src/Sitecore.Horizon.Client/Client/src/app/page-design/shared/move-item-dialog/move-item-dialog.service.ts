/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { Item } from 'app/page-design/page-templates.types';
import { Observable } from 'rxjs';
import { MoveItemDialogComponent } from './move-item-dialog.component';

export interface MoveItemDialogResponse {
  movedItem: Item | null;
  addedFolders: Item[];
}

@Injectable({
  providedIn: 'root',
})
export class MoveItemDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(options: {
    parentId: string;
    itemId: string;
    itemName: string;
    rootId: string;
    templateId: string;
    language: string;
  }): Observable<MoveItemDialogResponse> {
    const comp = this.overlayService.open(MoveItemDialogComponent, {
      size: 'FixedMedium',
    });

    comp.component.parentId = options.parentId;
    comp.component.itemId = options.itemId;
    comp.component.itemName = options.itemName;
    comp.component.rootId = options.rootId;
    comp.component.templateId = options.templateId;
    comp.component.language = options.language;
    return comp.component.onMove;
  }
}
