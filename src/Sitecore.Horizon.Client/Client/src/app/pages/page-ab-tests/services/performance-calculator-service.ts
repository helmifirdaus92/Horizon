/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import {
  BXComponentFlowDefinition,
  BXComponentVariant,
} from 'app/pages/left-hand-side/personalization/personalization.types';
import { erf } from 'mathjs';
import {
  AbTestGoalDefinition,
  AbTestPerformance,
  AbTestVariantData,
  AbTestVariantsPerformance,
  EMPTY_AB_TEST_VARIANT_DATA,
  PERFORMANCE_KEY,
} from './performance.types';
import { setVariantVersions } from './variant-utils';

@Injectable({
  providedIn: 'root',
})
export class PerformanceCalculatorService {
  constructor() {}

  calculateVariantsPerformance(
    abTest?: BXComponentFlowDefinition,
    performance?: AbTestPerformance[],
  ): AbTestVariantsPerformance {
    if (!abTest || !performance) {
      return { variantsData: [], winningVariantData: EMPTY_AB_TEST_VARIANT_DATA };
    }

    const variantsPerformance = this.getAbTestVariantsData(abTest, performance);
    const variantsData = setVariantVersions(variantsPerformance);
    const winningVariantData = this.getAbTestWinningVariant(this.getAbTestGoalDefinition(abTest), variantsData);

    return { variantsData, winningVariantData };
  }

  private getAbTestGoalDefinition(abTest: BXComponentFlowDefinition): AbTestGoalDefinition {
    return {
      target: abTest?.goals?.primary?.goalCalculation.target || 'conversionPerGuest',
      calculation: abTest?.goals?.primary?.goalCalculation.calculation || 'INCREASE',
      sampleSize: abTest?.sampleSizeConfig?.sampleSize || 0,
      confidenceLevel: abTest?.sampleSizeConfig?.confidenceLevel || 0,
      minimumDetectableDifference: abTest?.sampleSizeConfig?.minimumDetectableDifference || 0,
    };
  }

  private getEmptyAbTestPerformance(variant: BXComponentVariant): AbTestVariantData {
    return {
      ...EMPTY_AB_TEST_VARIANT_DATA,
      ...variant,
    };
  }

  private getAbTestControlPerformance(
    abTest: BXComponentFlowDefinition,
    variantsData: AbTestPerformance[],
    goalDefinition: AbTestGoalDefinition,
  ): AbTestVariantData | null {
    if (!abTest || !abTest?.variants || !abTest?.variants?.length) {
      return null;
    }

    const control = abTest.variants.find((v) => v.isControl);
    if (!control) {
      return null;
    }

    const controlPerformance = variantsData.find((r) => r['SessionMetrics.flowvariantref'] === control.ref);
    if (!controlPerformance) {
      return this.getEmptyAbTestPerformance(control);
    }

    const { target } = goalDefinition;
    const performanceIndex = controlPerformance?.[`${PERFORMANCE_KEY}${target}`] || 0;
    const standardError = performanceIndex || this.getStandardError(goalDefinition, controlPerformance);

    return {
      ...this.getEmptyAbTestPerformance(control),
      performanceIndex,
      performance: performanceIndex * 100,
      standardError,
    };
  }

  private getAbTestVariantsPerformance(
    abTest: BXComponentFlowDefinition,
    variantsData: AbTestPerformance[],
    goalDefinition: AbTestGoalDefinition,
    controlPerformance: AbTestVariantData,
  ): AbTestVariantData[] | null {
    if (!abTest || !abTest?.variants) {
      return [];
    }

    const { performanceIndex: controlPerformanceIndex, standardError: controlStandardError } = controlPerformance;
    const upliftCalculation = goalDefinition.calculation === 'INCREASE' ? 100 : -100;

    return abTest.variants
      .filter((v) => !v.isControl)
      .map<AbTestVariantData>((variant) => {
        const variantPerformance = variantsData?.find((r) => r['SessionMetrics.flowvariantref'] === variant.ref);

        if (!variantPerformance) {
          return this.getEmptyAbTestPerformance(variant);
        }

        const performanceIndex = variantPerformance[`${PERFORMANCE_KEY}${goalDefinition.target}`] || 0;
        const performance = performanceIndex * 100;

        const standardError = this.getStandardError(goalDefinition, variantPerformance);

        const upliftIndex = this.calculateUpliftIndex(performanceIndex, controlPerformance.performanceIndex);
        const uplift = (upliftIndex * upliftCalculation).toFixed(2);

        const confidenceIndex = this.calculateConfidenceIndex(
          controlPerformanceIndex,
          controlStandardError,
          performanceIndex,
          standardError,
        );
        const confidence = (confidenceIndex * 100).toFixed(2);

        const totalSessions = variantPerformance['SessionMetrics.totalSessions'] || 0;
        const totalGuests = variantPerformance['SessionMetrics.totalGuests'] || 0;

        return {
          ...variant,
          performanceIndex,
          performance,
          upliftIndex,
          uplift,
          confidenceIndex,
          confidence,
          standardError,
          totalSessions,
          totalGuests,
        };
      });
  }

  private getAbTestVariantsData(
    abTest: BXComponentFlowDefinition,
    performance: AbTestPerformance[],
  ): AbTestVariantData[] {
    if (!abTest || !performance) {
      return [];
    }

    const goalDefinition = this.getAbTestGoalDefinition(abTest);
    const controlPerformance = this.getAbTestControlPerformance(abTest, performance, goalDefinition);
    if (!controlPerformance) {
      return [];
    }

    const variantsPerformance = this.getAbTestVariantsPerformance(
      abTest,
      performance,
      goalDefinition,
      controlPerformance,
    );

    if (!variantsPerformance || !variantsPerformance.length) {
      return [controlPerformance];
    }

    return [controlPerformance, ...variantsPerformance];
  }

  private getAbTestWinningVariant(
    goalDefinition: AbTestGoalDefinition,
    variants: AbTestVariantData[],
  ): AbTestVariantData {
    if (!variants || variants.length === 0) {
      return EMPTY_AB_TEST_VARIANT_DATA;
    }

    const { sampleSize, confidenceLevel, minimumDetectableDifference, target } = goalDefinition;
    const isGuestsGoal = target === 'conversionPerGuest' || target === 'valuePerGuest';
    const variantsWithOutControl = variants.filter((variant) => !variant.isControl);

    const isAllVariantAchievedSampleSize = !variantsWithOutControl.find((variant) => {
      const variantSampleSize = isGuestsGoal ? variant.totalGuests : variant.totalSessions;

      return variantSampleSize < sampleSize;
    });

    if (!isAllVariantAchievedSampleSize) {
      return EMPTY_AB_TEST_VARIANT_DATA;
    }

    let winningVariant: AbTestVariantData = EMPTY_AB_TEST_VARIANT_DATA;

    for (const variant of variantsWithOutControl) {
      const isMinimumUpliftIndexReached = variant.upliftIndex > minimumDetectableDifference;
      const isMinimumConfidenceIndexReached = variant.confidenceIndex > confidenceLevel;

      if (isMinimumUpliftIndexReached && isMinimumConfidenceIndexReached) {
        if (variant.upliftIndex > winningVariant.upliftIndex) {
          winningVariant = variant;
        }
      }
    }

    return winningVariant;
  }

  private normalCdf(x: number, sigma: number, to: number): number {
    const e = erf((sigma - x) / (Math.sqrt(2) * to));
    return (1 - e) / 2;
  }

  private calculateConfidenceIndex(
    controlValue: number,
    controlStandardError: number,
    variantValue: number,
    variantStandardError: number,
  ): number {
    const sigma = controlValue - variantValue;
    const to = Math.sqrt(Math.pow(controlStandardError, 2) + Math.pow(variantStandardError, 2));
    const cumulativeDist = this.normalCdf(0, sigma, to);
    return Math.abs(1 - 2 * cumulativeDist);
  }

  private calculateUpliftIndex(value: number, controlValue: number): number {
    if (controlValue === 0) {
      return 0;
    }
    const upliftValue = (value - controlValue) / controlValue;
    return isNaN(upliftValue) ? 0 : upliftValue;
  }

  private getStandardError(goalDefinition: AbTestGoalDefinition, variantData?: AbTestPerformance): number {
    if (!variantData) {
      return 0;
    }
    const isGuestBasedGoal =
      goalDefinition.target === 'conversionPerGuest' || goalDefinition.target === 'valuePerGuest';
    const sessions = isGuestBasedGoal
      ? variantData?.['SessionMetrics.totalGuests']
      : variantData?.['SessionMetrics.totalSessions'];
    const value = variantData?.[`${PERFORMANCE_KEY}${goalDefinition.target}`];
    return Math.sqrt((value * (1 - value)) / sessions);
  }
}
