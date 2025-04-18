/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { AiHypophysisPanelService } from 'app/editor/right-hand-side/ai-hypophysis-panel/ai-hypophysis-panel.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';

@Component({
  selector: 'app-ai-hypophysis-button',
  template: `
    @if (isFeatureEnabled) {
      <button
        type="button"
        ngSpdIconButton
        icon="creation"
        class="my-auto mx-sm btn-square color-ai-main"
        [attr.aria-label]="'AI_RECOMMENDATIONS.LABEL' | translate"
        [title]="'AI_RECOMMENDATIONS.LABEL' | translate"
        [ngSpdPopover]="popoverAiRecommendations"
        popoverPosition="below"
        [popoverOffset]="5"
        [popoverShowDelay]="0"
        [popoverHideDelay]="0"
        [hideOnBackdropClick]="true"
        #popoverRef="ngSpdPopover"
        (click)="popoverRef.toggle(); $event.stopPropagation()"
        name="aiHypophysis"
        id="aiHypophysisBtn"
      ></button>
    }
    <ng-template #popoverAiRecommendations let-popoverRef>
      <div class="p-md w-350">
        <h3 class="flex-row align-items-center mt-0"
          ><span class="mdi mdi-creation mr-sm"></span> {{ 'AI_RECOMMENDATIONS.BUTTON' | translate }}</h3
        >
        <p class="my-md">{{ 'AI_RECOMMENDATIONS.TEXT' | translate }}</p>
        <div class="flex-row justify-space-between">
          <button
            class="mr-0 ml-sm bg-ai-gradient"
            type="button"
            ngSpdButton="primary"
            (click)="popoverRef.toggle(); showPanel()"
            >{{ 'AI_RECOMMENDATIONS.BUTTON' | translate }}</button
          >
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ['./ai-hypophysis-button.component.scss'],
})
export class AiHypophysisButtonComponent {
  isFeatureEnabled = this.featureFlagsService.isFeatureEnabled('pages_ab_test_hypothesis');

  constructor(
    private readonly aiHypophysisPanelService: AiHypophysisPanelService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  showPanel() {
    this.aiHypophysisPanelService.openPanel();
  }
}
