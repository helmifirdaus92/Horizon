/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { BXComponentVariant } from 'app/pages/left-hand-side/personalization/personalization.types';

export const VARIANTS_VERSIONS = ['a', 'b', 'c', 'd', 'e', 'f'];

export const VARIANT_REGEX = /(?<=Variant\s+)[a-fA-F\W]/gim;

export const AB_TEST_FRIENDLY_ID_REGEX =
  /^[a-zA-Z]+(?:_[a-zA-Z0-9]+)?_([a-f0-9]{32})_([a-f0-9]{32})_([a-z]{2}_[a-z]{2}|[a-z]{2})(?:_(\d{8}t\d{9}z))?$/;

export const AB_TEST_GOAL_TARGET_KEYS = {
  CONVERSATION_PER_GUEST: 'conversionPerGuest' as const,
  CONVERSATION_PER_SESSION: 'conversionPerSession' as const,
  VALUE_PER_GUEST: 'valuePerGuest' as const,
  VALUE_PER_SESSION: 'valuePerSession' as const,
};

export const PERFORMANCE_KEY = `SessionMetrics.`;
export const VARIANT_NAME_PREFIX = 'Variant ';

export const PERFORMANCE_KEYS = {
  FLOW_VARIANT_REF: `${PERFORMANCE_KEY}flowvariantref` as const,
  FLOW_REF: `${PERFORMANCE_KEY}flowref` as const,
  METRIC: `${PERFORMANCE_KEY}metric` as const,
  CONVERSION_PER_GUEST: `${PERFORMANCE_KEY}conversionPerGuest` as const,
  CONVERSION_PER_SESSION: `${PERFORMANCE_KEY}conversionPerSession` as const,
  SAMPLE_STANDARD_ERROR: `${PERFORMANCE_KEY}sampleStandardError` as const,
  TOTAL_CONVERSIONS: `${PERFORMANCE_KEY}totalConversions` as const,
  TOTAL_GUESTS: `${PERFORMANCE_KEY}totalGuests` as const,
  TOTAL_SESSIONS: `${PERFORMANCE_KEY}totalSessions` as const,
  TOTAL_VALUE: `${PERFORMANCE_KEY}totalValue` as const,
  VALUE_PER_CONVERSION: `${PERFORMANCE_KEY}valuePerConversion` as const,
  VALUE_PER_GUEST: `${PERFORMANCE_KEY}valuePerGuest` as const,
  VALUE_PER_SESSION: `${PERFORMANCE_KEY}valuePerSession` as const,
};

export interface AbTestPerformance {
  [PERFORMANCE_KEYS.FLOW_VARIANT_REF]: string;
  [PERFORMANCE_KEYS.FLOW_REF]: string;
  [PERFORMANCE_KEYS.METRIC]: string;
  [PERFORMANCE_KEYS.CONVERSION_PER_GUEST]: number;
  [PERFORMANCE_KEYS.CONVERSION_PER_SESSION]: number;
  [PERFORMANCE_KEYS.SAMPLE_STANDARD_ERROR]: number;
  [PERFORMANCE_KEYS.TOTAL_CONVERSIONS]: number;
  [PERFORMANCE_KEYS.TOTAL_GUESTS]: number;
  [PERFORMANCE_KEYS.TOTAL_SESSIONS]: number;
  [PERFORMANCE_KEYS.TOTAL_VALUE]: number;
  [PERFORMANCE_KEYS.VALUE_PER_CONVERSION]: number;
  [PERFORMANCE_KEYS.VALUE_PER_GUEST]: number;
  [PERFORMANCE_KEYS.VALUE_PER_SESSION]: number;
}

export interface AbTestPerformanceResponse {
  data: AbTestPerformance[];
}

export interface AbTestVariantsPerformance {
  variantsData: AbTestVariantData[];
  winningVariantData: AbTestVariantData;
}

export interface AbTestVariantData extends BXComponentVariant {
  performanceIndex: number;
  performance: number;
  confidenceIndex: number;
  confidence: string;
  upliftIndex: number;
  uplift: string;
  standardError: number;
  totalSessions: number;
  totalGuests: number;
  version?: string;
}

export interface AbTestGoalDefinition {
  target: GoalTarget;
  calculation: GoalCalculation;
  sampleSize: number;
  confidenceLevel: number;
  minimumDetectableDifference: number;
}

export type GoalTarget = (typeof AB_TEST_GOAL_TARGET_KEYS)[keyof typeof AB_TEST_GOAL_TARGET_KEYS];
export type GoalCalculation = 'INCREASE' | 'DECREASE';

export interface AbTestPrimaryGoalCalculation {
  type: string;
  calculation: GoalCalculation;
  target: GoalTarget;
}

export const EMPTY_AB_TEST_VARIANT: BXComponentVariant = {
  name: '',
  ref: '',
  isControl: false,
};

export const EMPTY_AB_TEST_VARIANT_DATA: AbTestVariantData = {
  ...EMPTY_AB_TEST_VARIANT,
  performanceIndex: 0,
  performance: 0,
  confidenceIndex: 0,
  confidence: '0',
  upliftIndex: 0,
  uplift: '0',
  standardError: 0,
  totalGuests: 0,
  totalSessions: 0,
};
