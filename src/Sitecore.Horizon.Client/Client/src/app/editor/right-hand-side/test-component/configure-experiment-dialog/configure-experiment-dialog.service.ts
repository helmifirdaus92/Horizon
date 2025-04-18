/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { Observable } from 'rxjs/internal/Observable';
import { ConfigureExperimentDialogComponent } from './configure-experiment-dialog.component';

export type ConfigureExperimentDialog =
  | { status: 'OK'; flowDefinition: BXComponentFlowDefinition }
  | { status: 'Canceled' };

@Injectable({ providedIn: 'root' })
export class ConfigureExperimentDialogService {
  constructor(private readonly overlayService: DialogOverlayService) {}

  show(options: {
    flowDefinition: BXComponentFlowDefinition;
    existingNames: Promise<string[]>;
    renderingInstanceId: string;
  }): Observable<ConfigureExperimentDialog> {
    const comp = this.overlayService.open(ConfigureExperimentDialogComponent, {
      size: { width: '1200px', height: '860px' },
    });

    comp.component.flowDefinition = options.flowDefinition;
    comp.component.existingNames = options.existingNames;
    comp.component.renderingInstanceId = options.renderingInstanceId;
    return comp.component.onSelect;
  }
}
