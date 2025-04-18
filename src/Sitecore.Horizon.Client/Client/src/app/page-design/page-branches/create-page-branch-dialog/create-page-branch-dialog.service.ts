/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { Item } from 'app/page-design/page-templates.types';
import { Observable } from 'rxjs';
import { CreatePageBranchDialogComponent } from './create-page-branch-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class CreatePageBranchDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(options: {
    parentId: string;
    existingNames: string[];
    language: string;
  }): Observable<{ branchItem: Item | null; rootPageItem: Item | null }> {
    const comp = this.overlayService.open(CreatePageBranchDialogComponent, {
      size: 'FixedXLarge',
    });

    comp.component.existingNames = options.existingNames;
    comp.component.parentId = options.parentId;
    comp.component.language = options.language;
    return comp.component.onCreate;
  }
}
