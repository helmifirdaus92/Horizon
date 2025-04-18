/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { Item } from 'app/page-design/page-templates.types';
import { Observable } from 'rxjs';
import { CreatePageDesignDialogComponent } from './create-page-design-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class CreatePageDesignDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(options: {
    parentId: string;
    templateId: string;
    existingDesignNames: string[];
    language: string;
  }): Observable<Item | null> {
    const comp = this.overlayService.open(CreatePageDesignDialogComponent, {
      size: 'AutoHeightMedium',
    });

    comp.component.existingDesignNames = options.existingDesignNames;
    comp.component.pageDesignParentId = options.parentId;
    comp.component.pageDesignTemplateId = options.templateId;
    comp.component.language = options.language;
    return comp.component.onCreate;
  }
}
