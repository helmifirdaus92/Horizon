/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { Item } from 'app/page-design/page-templates.types';
import { Observable } from 'rxjs';
import { CreateItemDialogComponent } from './create-item-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class CreateItemDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(options: {
    parentId: string;
    templateId: string;
    existingNames: string[];
    language: string;
    type: 'partial-design' | 'page-design';
  }): Observable<Item | null> {
    const comp = this.overlayService.open(CreateItemDialogComponent, {
      size: 'AutoHeight',
    });

    comp.component.existingNames = options.existingNames;
    comp.component.parentId = options.parentId;
    comp.component.templateId = options.templateId;
    comp.component.language = options.language;
    comp.component.type = options.type;
    return comp.component.onCreate;
  }
}
