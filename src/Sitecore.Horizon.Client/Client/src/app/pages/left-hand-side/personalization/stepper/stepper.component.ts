/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';

export type Steps = 'createVariant' | 'createAudience' | 'editVariant' | null;

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
})
export class StepperComponent {
  @Input() activeStepIndex?: number;

  currentSteps: Array<{ label: string }> = [
    {
      label: 'PERSONALIZATION.STEPPER.CREATE_VARIANT',
    },
    {
      label: 'PERSONALIZATION.STEPPER.CREATE_AUDIENCE',
    },
  ];
}
