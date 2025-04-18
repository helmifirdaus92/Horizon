/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';

export function sampleSizeConfigIsInValid(
  { baseValue, minimumDetectableDifference, confidenceLevel }: BXComponentFlowDefinition['sampleSizeConfig'],
  trafficAllocation: number,
): boolean {
  return (
    baseValue < 0.005 ||
    baseValue > 0.5 ||
    minimumDetectableDifference < 0.01 ||
    minimumDetectableDifference > 0.5 ||
    confidenceLevel < 0.8 ||
    confidenceLevel > 0.99 ||
    trafficAllocation < 1 ||
    trafficAllocation > 100
  );
}

export function splitsAreInvalid(inputValue: BXComponentFlowDefinition['traffic']['splits']): boolean {
  const splits = [...inputValue];

  return (
    splits.reduce((accumulator, item) => accumulator + item.split, 0) !== 100 ||
    !!splits.find((item) => item.split <= 0 || item.split > 100)
  );
}
