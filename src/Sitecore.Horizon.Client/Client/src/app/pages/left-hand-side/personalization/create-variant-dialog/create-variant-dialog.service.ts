/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { Observable } from 'rxjs';
import { PersonalizationFlowDefinition } from '../personalization.types';
import { CreateVariantDialogComponent } from './create-variant-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class CreateVariantDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(options: {
    flowDefinition: PersonalizationFlowDefinition | null;
    variantId: string;
    action?: string;
  }): Observable<{ id: string; name: string } | null> {
    const comp = this.overlayService.open(CreateVariantDialogComponent, {
      size: 'FullWithPadding',
    });

    if (options.action === 'createVariant') {
      comp.component.dialogSteps$.next('createVariant');
    }
    if (options.action === 'editVariant') {
      comp.component.dialogSteps$.next('editVariant');
    }

    comp.component.flowDefinition = options.flowDefinition;
    comp.component.variantId = options.variantId;
    return comp.component.onCreate;
  }
}
