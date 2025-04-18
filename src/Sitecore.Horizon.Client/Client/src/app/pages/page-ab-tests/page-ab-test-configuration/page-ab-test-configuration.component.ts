/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { formatNumber } from '@angular/common';
import { Component, Input } from '@angular/core';
import { calcRequiredSessionsPerVariant } from 'app/editor/right-hand-side/test-component/configure-experiment-dialog/configure-experiment-dialog.cdp-utils';
import { ComponentFlowDefinitionWithPublishedStatus } from '../page-ab-tests-dialog.component';
import { setVariantVersions } from '../services/variant-utils';

@Component({
  selector: 'app-page-ab-test-configuration',
  templateUrl: './page-ab-test-configuration.component.html',
  styleUrls: ['./page-ab-test-configuration.component.scss'],
})
export class PageAbTestConfigurationComponent {
  private _pageAbTest: ComponentFlowDefinitionWithPublishedStatus;

  @Input()
  set pageAbTest(value: ComponentFlowDefinitionWithPublishedStatus) {
    this._pageAbTest = value;
    this.updateVariants();
  }

  get pageAbTest(): ComponentFlowDefinitionWithPublishedStatus {
    return this._pageAbTest;
  }

  private updateVariants(): void {
    if (this.pageAbTest) {
      this.pageAbTest.variants = setVariantVersions(this.pageAbTest.variants);
    }
  }

  roundNumbers(num: number, numbersAfterDecimal: number = 0): number {
    return parseFloat(num.toFixed(numbersAfterDecimal));
  }

  total = () => {
    return formatNumber(calcRequiredSessionsPerVariant(this.pageAbTest.sampleSizeConfig) || 0, 'en-US', '1.0-1');
  };
}
