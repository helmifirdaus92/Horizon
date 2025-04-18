/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  BXComponentFlowDefinition,
  BXComponentGoals,
  BXComponentVariant,
  BXSampleSizeConfig,
} from 'app/pages/left-hand-side/personalization/personalization.types';
import { AbTestInfo } from '../editor-rhs.component';

export const mockComponentFlowDefinition: BXComponentFlowDefinition = {
  siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
  ref: 'ref',
  archived: false,
  businessProcess: 'interactive_v1',
  name: 'morning visitor',
  friendlyId: 'embedded_foo1bar2baz30000aaaabbbbcccc1234_1',
  channels: ['WEB'],
  sampleSizeConfig: {
    baseValue: 0.15,
    minimumDetectableDifference: 0.02,
    confidenceLevel: 0.95,
  },
  traffic: {
    type: 'simpleTraffic',
    weightingAlgorithm: 'USER_DEFINED',
    modifiedAt: undefined,
    allocation: 100,
    splits: [{ ref: '123', split: 0.5 }],
    coupled: false,
  },
  goals: {
    primary: {
      type: 'pageViewGoal',
      name: '',
      friendlyId: '',
      ref: '',
      description: '',
      goalCalculation: {
        type: 'binary',
        calculation: 'INCREASE',
        target: 'conversionPerSession',
      },
      pageParameters: [],
    },
  },
  schedule: {
    type: 'simpleSchedule',
    startDate: '01/08/2021',
  },
  status: 'DRAFT',
  tags: [],
  triggers: [],
  type: 'INTERACTIVE_API_FLOW',
  variants: [{ ref: 'test', name: 'testVariant', isControl: false, tasks: [] }],
  subtype: 'EXPERIENCE',
  transpiledVariants: [],
};

export const mockVariants: BXComponentVariant[] = [
  {
    ref: 'test',
    name: 'testVariant',
    isControl: false,
    tasks: [
      {
        implementation: 'templateRenderTask',
        input: {
          inputType: 'templateRenderTaskInput',
          type: 'application/json',
          template: '{"variantId":"' + 'testInstanceId_default' + '"}',
        },
      },
    ],
  },
];

export const mockSampleSizeConfig: BXSampleSizeConfig = {
  baseValue: 0.002,
  minimumDetectableDifference: 0.02,
  confidenceLevel: 0.95,
};

export const mockGoals: BXComponentGoals = {
  primary: {
    type: 'pageViewGoal',
    name: '',
    friendlyId: '',
    ref: '',
    description: '',
    goalCalculation: {
      type: 'binary',
      calculation: 'INCREASE',
      target: 'conversionPerSession',
    },
    pageParameters: [],
  },
};

export const mockPageParameters = [{ matchCondition: 'Equals', parameterString: 'test1' }] as any;

export const mockTraffic: any = {
  type: 'simpleTraffic',
  weightingAlgorithm: 'USER_DEFINED',
  modifiedAt: undefined,
  allocation: 100,
  splits: [{ ref: 'control', split: 0 }],
  coupled: false,
};

export function getAbTestInfo(
  variants = mockVariants,
  traffic = mockTraffic,
  goals = mockGoals,
  sampleSizeConfig = mockSampleSizeConfig,
): AbTestInfo {
  return {
    rendering: {
      chromeId: 'rnd_1',
      chromeType: 'rendering',
      displayName: 'displayName',
      renderingDefinitionId: 'aab',
      renderingInstanceId: 'test_instance_id',
      contextItem: { id: '', language: '', version: 1 },
      inlineEditorProtocols: [],
      isPersonalized: false,
      appliedPersonalizationActions: [],
      compatibleRenderings: ['rendering1', 'rendering2'],
      parentPlaceholderChromeInfo: { allowedRenderingIds: [] } as any,
    },
    flowDefinition: {
      siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
      ref: 'ref',
      archived: false,
      businessProcess: 'interactive_v1',
      name: 'morning visitor',
      friendlyId: 'embedded_foo1bar2baz30000aaaabbbbcccc1234_1',
      channels: ['WEB'],
      sampleSizeConfig,
      traffic,
      goals,
      schedule: {
        type: 'simpleSchedule',
        startDate: '01/08/2021',
      },
      status: 'PRODUCTION',
      tags: [],
      triggers: [],
      type: 'INTERACTIVE_API_FLOW',
      variants,
      subtype: 'EXPERIENCE',
      transpiledVariants: [],
    },
  };
}

export function getFlowDefinition(
  traffic = mockTraffic,
  variants = mockVariants,
  pageParameters = mockPageParameters,
  sampleSizeConfig = mockSampleSizeConfig,
): BXComponentFlowDefinition {
  return {
    siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
    ref: 'ref',
    archived: false,
    businessProcess: 'interactive_v1',
    name: 'cph test',
    friendlyId: 'embedded_foo1bar2baz30000aaaabbbbcccc1234_1',
    channels: ['WEB'],
    sampleSizeConfig,
    traffic,
    goals: {
      primary: {
        type: 'pageViewGoal',
        name: '',
        friendlyId: '',
        ref: '',
        description: '',
        goalCalculation: {
          type: 'binary',
          calculation: 'INCREASE',
          target: 'conversionPerSession',
        },
        pageParameters,
      },
    },
    schedule: {
      type: 'simpleSchedule',
      startDate: '01/08/2021',
    },
    status: 'PRODUCTION',
    tags: [],
    triggers: [],
    type: 'INTERACTIVE_API_FLOW',
    variants,
    subtype: 'EXPERIENCE',
    transpiledVariants: [],
  };
}
