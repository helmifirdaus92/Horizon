/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TenantPageTemplate } from 'app/page-design/page-templates.types';
import { Observable } from 'rxjs';
import { InsertOptionsConfigurationsDialogComponent } from './insert-options-configurations-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class InsertOptionsConfigurationsDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(options: { templateId: string; templatesList: TenantPageTemplate[] }): Observable<{ success: boolean } | null> {
    const comp = this.overlayService.open(InsertOptionsConfigurationsDialogComponent, {
      size: 'AutoHeightMedium',
    });

    comp.component.templateId = options.templateId;
    comp.component.templatesList = options.templatesList;

    return comp.component.onSave;
  }
}
