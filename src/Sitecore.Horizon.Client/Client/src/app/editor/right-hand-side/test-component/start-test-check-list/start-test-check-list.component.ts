/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { getComponentVariantId } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.utils';
import { PersonalizationLayoutService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { AbTestInfo } from '../../editor-rhs.component';
import {
  sampleSizeConfigIsInValid,
  splitsAreInvalid,
} from '../configure-experiment-dialog/configure-experiment-dialog.utils';

export function isFlowDefinitionReadyToStart(flowDefinition: BXComponentFlowDefinition): boolean {
  if (!flowDefinition) {
    return false;
  }

  return true;
}

@Component({
  selector: 'app-start-test-check-list',
  templateUrl: './start-test-check-list.component.html',
  styleUrl: './start-test-check-list.component.scss',
})
export class StartTestCheckListComponent implements OnChanges {
  @Input() abTest: AbTestInfo;

  @Output() closePopover = new EventEmitter<unknown>();
  @Output() goToConfiguration = new EventEmitter<unknown>();
  @Output() startTest = new EventEmitter<unknown>();

  variantsLengthIsValid = true;
  variantsArePopulated = true;
  targetPagesLengthIsValid = true;
  trafficAllocationIsValid = true;
  targetPagesArePublished = true;
  sampleSizeConfigIsValid = true;

  configurationIsValid = false;

  constructor(private readonly personalizationLayoutService: PersonalizationLayoutService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.abTest) {
      this.validateFlowDefinition();
    }
  }

  private async validateFlowDefinition() {
    this.variantsLengthIsValid = this.abTest.flowDefinition.variants.length >= 2;
    this.targetPagesLengthIsValid =
      this.abTest.flowDefinition?.goals?.primary?.pageParameters?.length >= 1 ||
      this.abTest.flowDefinition?.goals?.primary.type === 'customGoal';
    this.trafficAllocationIsValid = !splitsAreInvalid(this.abTest.flowDefinition.traffic.splits);
    this.sampleSizeConfigIsValid = !sampleSizeConfigIsInValid(
      this.abTest.flowDefinition.sampleSizeConfig,
      this.abTest.flowDefinition.traffic.allocation,
    );
    this.variantsArePopulated =
      (
        await Promise.all(
          [...this.abTest.flowDefinition.variants].map((variant) => {
            const variantId = getComponentVariantId(variant);
            if (!variantId) return true;
            if (variant.isControl) return true;

            return this.personalizationLayoutService.isVariantUsedInAnyRule(variantId);
          }),
        )
      ).indexOf(false) === -1;

    this.configurationIsValid =
      this.variantsLengthIsValid &&
      this.targetPagesLengthIsValid &&
      this.trafficAllocationIsValid &&
      this.variantsArePopulated &&
      this.sampleSizeConfigIsValid;
  }
}
