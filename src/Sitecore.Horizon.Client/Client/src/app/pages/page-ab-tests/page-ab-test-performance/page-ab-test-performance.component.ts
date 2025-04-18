/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ComponentFlowDefinitionWithPublishedStatus } from '../page-ab-tests-dialog.component';
import { AbTestPerformanceDalService } from '../services/ab-test-performance.dal.service';
import { PerformanceCalculatorService } from '../services/performance-calculator-service';
import { AbTestVariantData, AbTestVariantsPerformance } from '../services/performance.types';

@Component({
  selector: 'app-page-ab-test-performance',
  templateUrl: './page-ab-test-performance.component.html',
  styleUrls: ['./page-ab-test-performance.component.scss'],
})
export class PageAbPerformanceComponent {
  private _pageAbTest: ComponentFlowDefinitionWithPublishedStatus;

  @Input()
  set pageAbTest(value: ComponentFlowDefinitionWithPublishedStatus) {
    this._pageAbTest = value;
    this.fetchAbTestPerformance();
  }

  get pageAbTest(): ComponentFlowDefinitionWithPublishedStatus {
    return this._pageAbTest;
  }

  isLoading = true;
  abTestVariantsPerformance: AbTestVariantsPerformance | undefined = undefined;
  highestPerformance: number = 100;
  currentDate: Date = new Date();

  constructor(
    private readonly abTestPerformanceDalService: AbTestPerformanceDalService,
    private readonly performanceCalculatorService: PerformanceCalculatorService,
  ) {}

  private async fetchAbTestPerformance(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(this.abTestPerformanceDalService.getAbTestPerformance(this.pageAbTest));

      if (response.apiIsBroken || response.requestIsInvalid || !response.data) {
        await this.handleInvalidResponse();
        return;
      }

      this.abTestVariantsPerformance = this.performanceCalculatorService.calculateVariantsPerformance(
        this.pageAbTest,
        response.data.data,
      );

      this.setHighestPerformance(this.abTestVariantsPerformance.variantsData);
    } finally {
      this.isLoading = false;
    }
  }

  isWinningVariant(variant: AbTestVariantData): boolean {
    return variant.ref === this.abTestVariantsPerformance?.winningVariantData?.ref;
    // simulate Winning variant
    // return variant.version === 'a';
  }

  isAbTestHasPerformanceData(): boolean {
    return !!this.abTestVariantsPerformance?.variantsData.some((v) => !!v.performance);
  }

  private async handleInvalidResponse(): Promise<void> {
    this.abTestVariantsPerformance = undefined;
  }

  private setHighestPerformance(variantsData: AbTestVariantData[]): void {
    const maxPerformance = Math.max(...variantsData.map((v) => v.performance || 0));
    this.highestPerformance = maxPerformance >= 100 ? maxPerformance : 100;
  }
}
