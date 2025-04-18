/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { normalizeGuidCharactersOnly, RecursivePartial } from 'app/shared/utils/utils';
import { v4 as uuid } from 'uuid';
import {
  BXComponentFlowDefinition,
  BXComponentGoals,
  BXComponentVariant,
  BXComponentVariantTemplate,
  BXPersonalizationFlowDefinition,
} from '../personalization.types';

export function createDefaultPersonalizeFlowDefinition(
  name: string,
  friendlyId: string,
  siteId: string,
): BXPersonalizationFlowDefinition {
  return {
    siteId,
    name,
    friendlyId,
    archived: false,
    businessProcess: 'interactive_v1',
    channels: ['WEB'],
    status: 'DRAFT',
    type: 'INTERACTIVE_API_FLOW',
    traffic: {
      type: 'audienceTraffic',
      weightingAlgorithm: 'USER_DEFINED',
      splits: [],
    },
    schedule: {
      type: 'simpleSchedule',
      startDate: new Date().toISOString(),
    },
    sampleSizeConfig: {
      baseValue: 0.15,
      minimumDetectableDifference: 0.02,
      confidenceLevel: 0.95,
    },
    tags: [],
    triggers: [],
    subtype: 'EXPERIENCE',
    variants: [],
  };
}

export function createDefaultComponentFlowDefinition(
  name: string,
  friendlyId: string,
  renderingInstanceId: string,
  siteId: string,
  componentName: string,
): RecursivePartial<BXComponentFlowDefinition> {
  const uniqueId = uuid();
  const normalizedRenderingInstanceId = formatToCharactersOnly(renderingInstanceId);
  return {
    siteId: siteId,
    name,
    friendlyId,
    type: 'COMPONENT',
    subtype: 'EXPERIMENT',
    channels: ['WEB'],
    tags: [`siteId:${siteId}`],
    businessProcess: 'interactive_v1',
    traffic: {
      type: 'simpleTraffic',
      allocation: 100,
      splits: [],
      coupled: false,
    },
    goals: getDefaultGoalsSection(),
    variants: [
      {
        name: componentName + ' (control)',
        isControl: true,
        tasks: [
          {
            implementation: 'templateRenderTask',
            input: {
              inputType: 'templateRenderTaskInput',
              type: 'application/json',
              template: '{"variantId":"' + normalizedRenderingInstanceId + '_default"}',
            },
          },
        ],
      },
      {
        name: 'Variant B',
        ref: uniqueId,
        isControl: false,
        tasks: [
          {
            implementation: 'templateRenderTask',
            input: {
              inputType: 'templateRenderTaskInput',
              type: 'application/json',
              template:
                '{"variantId":"' + normalizedRenderingInstanceId + '_' + formatToCharactersOnly(uniqueId) + '"}',
            },
          },
        ],
      },
    ],
    status: 'DRAFT',
    schedule: {
      type: 'simpleSchedule',
      startDate: new Date().toISOString(),
    },
    sampleSizeConfig: {
      baseValue: 0.02,
      minimumDetectableDifference: 0.2,
      confidenceLevel: 0.95,
    },
  };
}

export function getVariantSection(variantName: string, renderingInstanceId: string): BXComponentVariant {
  const uniqueId = uuid();
  const normalizedRenderingInstanceId = formatToCharactersOnly(renderingInstanceId).replace(/-/g, '_');
  return {
    ref: uniqueId,
    name: variantName,
    isControl: false,
    tasks: [
      {
        implementation: 'templateRenderTask',
        input: {
          inputType: 'templateRenderTaskInput',
          type: 'application/json',
          template: '{"variantId":"' + normalizedRenderingInstanceId + '_' + formatToCharactersOnly(uniqueId) + '"}',
        },
      },
    ],
  };
}

export function getDefaultGoalsSection(): BXComponentGoals {
  return {
    primary: {
      type: 'pageViewGoal',
      name: 'page_view_goal',
      friendlyId: 'friendly_id_page_view_goal',
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
}

export function getDefalutCustomGoalSection(componentInstanceId: string): BXComponentGoals {
  return {
    primary: {
      type: 'customGoal',
      name: 'custom_goal',
      friendlyId: 'friendly_id_custom_goal',
      ref: '',
      description: '',
      goalCalculation: {
        type: 'binary',
        calculation: 'INCREASE',
        target: 'conversionPerSession',
      },
      pageParameters: [],
      eventType: {
        matchCondition: 'Equals',
        matchString: 'FORM',
        attributes: [
          {
            title: 'componentInstanceId',
            matchCondition: 'STRING_EQUALS',
            value: componentInstanceId,
          },
          {
            title: 'interactionType',
            matchCondition: 'STRING_EQUALS',
            value: 'SUBMITTED',
          },
        ],
      },
    },
  };
}

export function getComponentVariantId(variant: BXComponentVariant | undefined): string | undefined {
  const template = variant?.tasks?.[0]?.input.template;
  const variantId = template ? (JSON.parse(template) as BXComponentVariantTemplate)?.variantId : undefined;
  return variantId;
}

export function formatFriendlyId(
  isEmbedded: boolean,
  personalizationScopeValue: string | undefined,
  itemId: string,
  renderingInstanceId: string | undefined,
  language: string,
): string {
  itemId = formatToCharactersOnly(itemId);
  if (renderingInstanceId) {
    renderingInstanceId = formatToCharactersOnly(renderingInstanceId);
  }

  const prefix = isEmbedded ? 'embedded' : 'component';
  const scopeValue = personalizationScopeValue ? `_${personalizationScopeValue}` : '';
  const instanceIdParam = renderingInstanceId ? `_${renderingInstanceId}` : '';
  let formattedId = `${scopeValue}_${itemId}${instanceIdParam}_${language}`.toLowerCase().replace(/-/g, '_');

  if (!isEmbedded) {
    formattedId += `_${new Date().toISOString().replace(/[-:.]/g, '').toLowerCase()}`;
  }
  return `${prefix}${formattedId}`;
}

export function formatToCharactersOnly(id: string) {
  return normalizeGuidCharactersOnly(id).replace('{', '').replace('}', '');
}

export function distributeSplitsEvenly(flowDefinition: BXComponentFlowDefinition): BXComponentFlowDefinition {
  const splitsLength = flowDefinition.traffic.splits.length;
  const normalizedSplit = Math.floor(100 / splitsLength);
  const defaultVariantSplit =
    normalizedSplit * splitsLength === 100 ? normalizedSplit : normalizedSplit + (100 - normalizedSplit * splitsLength);
  flowDefinition.traffic.splits.forEach((item, index) => {
    item.split = index === 0 ? defaultVariantSplit : normalizedSplit;
  });

  return flowDefinition;
}

export function isPageComponentFriendlyId(
  friendlyId: string,
  pageId: string,
  personalizationScope: string | undefined,
  language: string,
): boolean {
  return (
    friendlyId.startsWith(`component_`) &&
    friendlyId.includes(`_${pageId.toLowerCase().replace(/-/g, '')}`) &&
    (!personalizationScope || friendlyId.includes(personalizationScope)) &&
    friendlyId.includes('_' + language.toLowerCase().replace(/-/g, '_'))
  );
}

export function isMatchingPageComponentId(
  friendlyId: string,
  pageId: string,
  personalizationScope: string | undefined,
  language: string,
  renderingInstanceId: string,
): boolean {
  const normalizedRenderingInstanceId = normalizeGuidCharactersOnly(renderingInstanceId);
  return (
    friendlyId.includes(`component_${pageId.toLowerCase().replace(/-/g, '')}_${normalizedRenderingInstanceId}`) &&
    (!personalizationScope || friendlyId.includes(personalizationScope)) &&
    friendlyId.includes('_' + language.toLowerCase().replace(/-/g, '_'))
  );
}

export function makeFlowNameUnique(flow: BXComponentFlowDefinition) {
  const nowTimestamp = new Date().toISOString().replace(/[-:.]/g, '').toLowerCase();
  flow.name = `${flow.name}_${nowTimestamp}`;
  return flow;
}
