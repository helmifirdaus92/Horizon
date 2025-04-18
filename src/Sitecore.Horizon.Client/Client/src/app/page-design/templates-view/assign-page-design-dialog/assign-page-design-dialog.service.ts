/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TenantPageTemplate } from 'app/page-design/page-templates.types';
import { Observable } from 'rxjs';
import { AssignPageDesignDialogComponent } from './assign-page-design-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class AssignPageDesignDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(
    templateId: string,
    tenantPageTemplates: TenantPageTemplate[],
    alreadyAssignedDesignId?: string,
  ): Observable<boolean> {
    const dialog = this.overlayService.open(AssignPageDesignDialogComponent, {
      size: 'FixedXLarge',
    });

    dialog.component.templateId = templateId;
    dialog.component.alreadyAssignedDesignId = alreadyAssignedDesignId;
    dialog.component.tenantPageTemplates = tenantPageTemplates;
    return dialog.component.onAssign;
  }
}
