/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export const PERSONALIZATION_SCOPE_VARIABLE_NAME = 'PAGES_PERSONALIZE_SCOPE';

export type PersonalizationVariant = BXPersonalizationSplit;
export type PersonalizationFlowDefinition = BXPersonalizationFlowDefinition;

export type TestConclusiveAction = 'SET_TRAFFIC_TO_WINNING_VARIANT' | 'SET_TRAFFIC_TO_CONTROL_VARIANT';
export type TestInconclusiveAction = 'KEEP_RUNNING_TEST' | 'SET_TRAFFIC_TO_CONTROL_VARIANT';

export interface BXComponentFlowDefinition extends Omit<BXPersonalizationFlowDefinition, 'traffic' | 'variants'> {
  goals: BXComponentGoals;
  traffic: {
    type: 'simpleTraffic';
    weightingAlgorithm: 'USER_DEFINED';
    modifiedAt?: string;
    allocation: 100;
    splits: BXComponentSplit[];
    coupled: false;
  };
  variants: BXComponentVariant[];
  postTestAction?: {
    conclusive?: TestConclusiveAction;
    inconclusive?: TestInconclusiveAction;
  };
  result?: {
    processedAt?: string;
    outcome?: 'CONCLUSIVE' | 'INCONCLUSIVE';
  };
}

export interface BXPersonalizationFlowDefinitionList {
  offset: number;
  limit: number;
  items: Array<BXPersonalizationFlowDefinition | BXComponentFlowDefinition>;
}

export type FlowStatus = 'PRODUCTION' | 'PAUSED' | 'DRAFT' | 'PUBLISHING' | 'COMPLETED';
export type GoalSettingOptions = 'pageViewGoal' | 'bouncesGoal' | 'exitsGoal' | 'customGoal';

export interface BXPersonalizationFlowDefinition {
  siteId: string;
  ref?: string;
  archived: boolean;
  businessProcess: 'interactive_v1';
  name: string;
  friendlyId: string;
  channels: ['WEB'];
  sampleSizeConfig: BXSampleSizeConfig;
  schedule: BXschedule;
  status: FlowStatus;
  tags: string[];
  traffic: BXPersonalizationTraffic;
  triggers: [];
  type: 'INTERACTIVE_API_FLOW' | 'COMPONENT';
  subtype: 'EXPERIENCE' | 'EXPERIMENT';
  transpiledVariants?: [];
  variants?: [];
  postTestAction?: {
    conclusive?: TestConclusiveAction;
    inconclusive?: TestInconclusiveAction;
  };
  result?: {
    processedAt?: string;
    outcome?: 'CONCLUSIVE' | 'INCONCLUSIVE';
  };
}

export interface BXSampleSizeConfig {
  baseValue: number;
  minimumDetectableDifference: number;
  confidenceLevel: number;
  sampleSize?: number;
}

interface BXschedule {
  type: 'simpleSchedule';
  startDate: string; // ISO date string
}

export interface BXPersonalizationTraffic {
  type: 'audienceTraffic';
  weightingAlgorithm: 'USER_DEFINED';
  splits: BXPersonalizationSplit[];
}

export interface BXPersonalizationSplit {
  // variantId is not return as Boxever response, we manually set this field
  variantId: string;
  template: string;
  variantName: string;
  audienceName: string;
  conditionGroups: object;
}

export interface BXComponentSplit {
  ref: string;
  split: number;
}
export interface GoalsPageParameters {
  matchCondition: 'Equals';
  parameterString: string;
}
export interface BXComponentGoals {
  primary: {
    type: GoalSettingOptions;
    name: string;
    friendlyId: string;
    ref: string;
    description: string;
    goalCalculation: {
      type: 'binary';
      calculation: 'INCREASE' | 'DECREASE';
      target: 'conversionPerSession';
    };
    pageParameters: GoalsPageParameters[];
    eventType?: {
      matchCondition: 'Equals';
      matchString: 'FORM';
      attributes: [
        {
          title: 'componentInstanceId';
          matchCondition: 'STRING_EQUALS';
          value: string;
        },
        {
          title: 'interactionType';
          matchCondition: 'STRING_EQUALS';
          value: 'SUBMITTED';
        },
      ];
    };
  };
}

export interface BXComponentVariant {
  ref: string;
  name: string;
  isControl: boolean;
  tasks?: Array<{
    implementation: 'templateRenderTask';
    input: {
      inputType: 'templateRenderTaskInput';
      type: 'application/json';
      template: string;
    };
  }>;
  version?: string;
}

export interface BXComponentVariantTemplate {
  variantId: string;
}

export interface BXFlowDefinitionBasicInfo {
  name: string;
  friendlyId: string;
  status: FlowStatus;
}
