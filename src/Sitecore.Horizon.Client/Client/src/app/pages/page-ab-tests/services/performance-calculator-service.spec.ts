/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { PerformanceCalculatorService } from './performance-calculator-service';
import {
  AbTestPerformance,
  AbTestVariantsPerformance,
  EMPTY_AB_TEST_VARIANT_DATA,
  PERFORMANCE_KEYS,
} from './performance.types';

const MOCK_AB_TEST: BXComponentFlowDefinition = {
  siteId: 'siteId',
  archived: false,
  businessProcess: 'interactive_v1',
  name: 'Test AB',
  friendlyId: 'test-ab',
  channels: ['WEB'],
  sampleSizeConfig: {
    baseValue: 0.5,
    minimumDetectableDifference: 0.1,
    confidenceLevel: 0.55,
    sampleSize: 100,
  },
  schedule: {
    type: 'simpleSchedule',
    startDate: '2023-01-01T00:00:00Z',
  },
  status: 'PRODUCTION',
  tags: [],
  traffic: {
    type: 'simpleTraffic',
    weightingAlgorithm: 'USER_DEFINED',
    allocation: 100,
    splits: [
      { ref: 'control', split: 50 },
      { ref: 'variant1', split: 50 },
    ],
    coupled: false,
  },
  variants: [
    {
      ref: 'control',
      name: 'Control',
      isControl: true,
      tasks: [
        {
          implementation: 'templateRenderTask',
          input: {
            inputType: 'templateRenderTaskInput',
            type: 'application/json',
            template: 'template1',
          },
        },
      ],
    },
    {
      ref: 'variant1',
      name: 'Variant 1',
      isControl: false,
      tasks: [
        {
          implementation: 'templateRenderTask',
          input: {
            inputType: 'templateRenderTaskInput',
            type: 'application/json',
            template: 'template2',
          },
        },
      ],
    },
  ],
  goals: {
    primary: {
      type: 'customGoal',
      name: 'Conversion Goal',
      friendlyId: 'conversion-goal',
      ref: 'goal1',
      description: 'Goal Description',
      goalCalculation: {
        type: 'binary',
        calculation: 'INCREASE',
        target: 'conversionPerSession',
      },
      pageParameters: [
        {
          matchCondition: 'Equals',
          parameterString: 'param1',
        },
      ],
    },
  },
  triggers: [],
  type: 'INTERACTIVE_API_FLOW',
  subtype: 'EXPERIENCE',
};

const MOCK_PERFORMANCE: AbTestPerformance[] = [
  {
    [PERFORMANCE_KEYS.FLOW_VARIANT_REF]: 'control',
    [PERFORMANCE_KEYS.TOTAL_SESSIONS]: 100,
    [PERFORMANCE_KEYS.TOTAL_GUESTS]: 100,
    [PERFORMANCE_KEYS.CONVERSION_PER_GUEST]: 0.1,
    [PERFORMANCE_KEYS.FLOW_REF]: '',
    [PERFORMANCE_KEYS.METRIC]: '',
    [PERFORMANCE_KEYS.CONVERSION_PER_SESSION]: 0.1,
    [PERFORMANCE_KEYS.SAMPLE_STANDARD_ERROR]: 0,
    [PERFORMANCE_KEYS.TOTAL_CONVERSIONS]: 10,
    [PERFORMANCE_KEYS.TOTAL_VALUE]: 0,
    [PERFORMANCE_KEYS.VALUE_PER_CONVERSION]: 0,
    [PERFORMANCE_KEYS.VALUE_PER_GUEST]: 0,
    [PERFORMANCE_KEYS.VALUE_PER_SESSION]: 0.1,
  },
  {
    [PERFORMANCE_KEYS.FLOW_VARIANT_REF]: 'variant1',
    [PERFORMANCE_KEYS.TOTAL_SESSIONS]: 100,
    [PERFORMANCE_KEYS.TOTAL_GUESTS]: 100,
    [PERFORMANCE_KEYS.CONVERSION_PER_GUEST]: 0.2,
    [PERFORMANCE_KEYS.FLOW_REF]: '',
    [PERFORMANCE_KEYS.METRIC]: '',
    [PERFORMANCE_KEYS.CONVERSION_PER_SESSION]: 0.2,
    [PERFORMANCE_KEYS.SAMPLE_STANDARD_ERROR]: 0,
    [PERFORMANCE_KEYS.TOTAL_CONVERSIONS]: 20,
    [PERFORMANCE_KEYS.TOTAL_VALUE]: 0,
    [PERFORMANCE_KEYS.VALUE_PER_CONVERSION]: 0,
    [PERFORMANCE_KEYS.VALUE_PER_GUEST]: 0,
    [PERFORMANCE_KEYS.VALUE_PER_SESSION]: 0.2,
  },
];

describe(PerformanceCalculatorService.name, () => {
  let service: PerformanceCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PerformanceCalculatorService],
    });

    service = TestBed.inject(PerformanceCalculatorService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty performance data when abTest or performance is not provided', () => {
    const result = service.calculateVariantsPerformance();
    expect(result).toEqual({ variantsData: [], winningVariantData: EMPTY_AB_TEST_VARIANT_DATA });
  });

  it('should return performance data for provided abTest and performance', () => {
    const result: AbTestVariantsPerformance = service.calculateVariantsPerformance(MOCK_AB_TEST, MOCK_PERFORMANCE);

    expect(result.variantsData.length).toBe(2);
    expect(result.winningVariantData.name).toBe('Variant 1');
  });

  it('should return winning variant data when control and variant performance data are provided', () => {
    const result: AbTestVariantsPerformance = service.calculateVariantsPerformance(MOCK_AB_TEST, MOCK_PERFORMANCE);

    expect(result.variantsData.length).toBe(2);
    expect(result.winningVariantData.name).toBe('Variant 1');
    expect(result.winningVariantData.performanceIndex).toBe(0.2);
  });

  it('should return empty performance data when no control variant is found', () => {
    const abTestWithoutControl = { ...MOCK_AB_TEST, variants: [MOCK_AB_TEST.variants[1]] };
    const result: AbTestVariantsPerformance = service.calculateVariantsPerformance(
      abTestWithoutControl,
      MOCK_PERFORMANCE,
    );

    expect(result.variantsData.length).toBe(0);
    expect(result.winningVariantData).toEqual(EMPTY_AB_TEST_VARIANT_DATA);
  });
});
