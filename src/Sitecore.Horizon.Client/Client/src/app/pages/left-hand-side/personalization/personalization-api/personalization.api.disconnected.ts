/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable } from '@angular/core';
import { ApiResponse } from 'app/shared/utils/utils';
import {
  BXComponentFlowDefinition,
  BXFlowDefinitionBasicInfo,
  BXPersonalizationFlowDefinition,
  BXPersonalizationFlowDefinitionList,
  BXPersonalizationSplit,
  PersonalizationVariant,
} from '../personalization.types';
import { PersonalizationAPIService } from './personalization.api.service';
import { createDefaultComponentFlowDefinition, formatFriendlyId } from './personalization.api.utils';

@Injectable()
export class PersonalizationAPIServiceDisconnected implements PersonalizationAPIService {
  flowDefinitions: Array<Partial<BXPersonalizationFlowDefinition | BXComponentFlowDefinition>> = [];
  get flowDefinition() {
    return Array.from(this.flowDefinitions)[0] ?? null;
  }

  private readonly defaultVariants: Array<Partial<BXPersonalizationSplit>> = [
    {
      variantId: 'cfa85597e43545479aadc27df7ff134e',
      template: JSON.stringify({ variantId: 'cfa85597e43545479aadc27df7ff134e' }),
      variantName: 'Visitor from Copenhagen',
      audienceName: 'User has visited all pages',
      conditionGroups: [
        {
          conditions: [
            {
              templateId: 'page_views',
              params: {
                Visited: 'has',
                'Page name': '/selectFlights',
              },
            },
          ],
        },
      ],
    },
    {
      variantId: 'ffa85597e43545479aadc27df7ff134e',
      template: JSON.stringify({ variantId: 'ffa85597e43545479aadc27df7ff134e' }),
      variantName: 'Visitor from Oslo',
      audienceName: 'User has visited home page',
      conditionGroups: [
        {
          conditions: [
            {
              templateId: 'page_views',
              params: {
                Visited: 'has',
                'Page name': '/selectFlights',
              },
            },
          ],
        },
      ],
    },
    {
      template: JSON.stringify({ variantId: 'ffa85597e43545479aadc27df7ff234e' }),
      variantId: 'ffa85597e43545479aadc27df7ff234e',
      variantName: 'variant 3',
      audienceName: 'User has visited about page',
      conditionGroups: [
        {
          conditions: [
            {
              templateId: 'page_views',
              params: {
                Visited: 'has',
                'Page name': '/selectFlights',
              },
            },
          ],
        },
      ],
    },
  ];

  private readonly defaultFlowDefinition: Partial<BXPersonalizationFlowDefinition> = {
    siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
    friendlyId: 'embedded_a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en',
    ref: '2897bfe7-14ff-4fcb-adb0-d95612e84652',
    name: 'Flow Definition 1',
    status: 'PRODUCTION',
    channels: ['WEB'],
    archived: false,
    sampleSizeConfig: {
      baseValue: 0.15,
      minimumDetectableDifference: 0.02,
      confidenceLevel: 0.95,
    },
    type: 'INTERACTIVE_API_FLOW',
    variants: [],
    subtype: 'EXPERIENCE',
    schedule: {
      type: 'simpleSchedule',
      startDate: '01/08/2021',
    },
    traffic: {
      type: 'audienceTraffic',
      weightingAlgorithm: 'USER_DEFINED',
      splits: [this.defaultVariants[0], this.defaultVariants[1]] as BXPersonalizationSplit[],
    },
  };

  readonly defaultComponentFlowDefinition: Partial<BXComponentFlowDefinition> = {
    siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
    friendlyId: 'component_a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en',
    name: 'Flow Definition 1',
    status: 'PRODUCTION',
    channels: ['WEB'],
    archived: false,
    sampleSizeConfig: {
      baseValue: 0.02,
      minimumDetectableDifference: 0.2,
      confidenceLevel: 0.95,
    },
    type: 'COMPONENT',
    subtype: 'EXPERIMENT',
    variants: [],
    schedule: {
      type: 'simpleSchedule',
      startDate: '01/08/2021',
    },
    traffic: {
      type: 'simpleTraffic',
      weightingAlgorithm: 'USER_DEFINED',
      allocation: 100,
      coupled: false,
      splits: [],
    },
  };

  constructor() {
    const initialMockDataFromLocalStorage = localStorage.getItem('mock-flow-definitions');
    this.init(initialMockDataFromLocalStorage ? JSON.parse(initialMockDataFromLocalStorage) : undefined);
  }

  init(flowDefinitions?: typeof this.flowDefinitions) {
    if (flowDefinitions && flowDefinitions?.length > 0) {
      this.flowDefinitions = flowDefinitions;
    } else {
      this.flowDefinitions = Array.from([this.defaultFlowDefinition]);
    }
  }

  async getAllFlowDefinitions(): Promise<ApiResponse<BXPersonalizationFlowDefinitionList>> {
    const BXPersonalizationFlowDefinitionList: BXPersonalizationFlowDefinitionList = {
      items: Array.from(this.flowDefinitions) as any,
      offset: 0,
      limit: 10,
    };

    return { data: BXPersonalizationFlowDefinitionList, apiIsBroken: false, requestIsInvalid: false };
  }

  async getCurrentSiteFlowDefinitions(): Promise<ApiResponse<BXFlowDefinitionBasicInfo[]>> {
    const value = Array.from(this.flowDefinitions)[0];

    const flowDefinitionBasicInfo: BXFlowDefinitionBasicInfo = {
      friendlyId: value?.friendlyId || '',
      name: value?.name || '',
      status: 'DRAFT',
    };

    const BXPersonalizationFlowDefinitionList: BXFlowDefinitionBasicInfo[] = value ? [flowDefinitionBasicInfo] : [];

    return { data: BXPersonalizationFlowDefinitionList, apiIsBroken: false, requestIsInvalid: false };
  }

  public getPageFlowDefinitions(_pageId: string): Promise<ApiResponse<BXPersonalizationFlowDefinitionList>> {
    return this.getAllFlowDefinitions();
  }

  async getActivePersonalizeFlowDefinition(): Promise<ApiResponse<BXPersonalizationFlowDefinition>> {
    const value = Array.from(this.flowDefinitions)[0] as BXPersonalizationFlowDefinition | null;
    return { data: value, apiIsBroken: false, requestIsInvalid: false };
  }

  async createPageFlowDefinition(): Promise<ApiResponse<BXPersonalizationFlowDefinition>> {
    this.init([{ ...this.defaultFlowDefinition, ...{ variants: [] } }]);
    const value = Array.from(this.flowDefinitions)[0] as BXPersonalizationFlowDefinition;
    return { data: value, apiIsBroken: false, requestIsInvalid: false };
  }

  async createComponentFlowDefinition(
    renderingInstanceId: string,
    experimentName: string,
    renderingDisplayName: string,
  ): Promise<ApiResponse<BXComponentFlowDefinition>> {
    const url = new URL(window.location.href);

    const itemId = url.searchParams.get('sc_itemid') ?? 'itemId';
    const language = url.searchParams.get('sc_lang') ?? 'language';

    const friendlyId = formatFriendlyId(false, undefined, itemId, renderingInstanceId, language);

    const flowDefinition = createDefaultComponentFlowDefinition(
      experimentName,
      friendlyId,
      renderingInstanceId,
      'ContextSiteHostId',
      renderingDisplayName,
    );

    this.flowDefinitions.push(flowDefinition as any);
    this.init(this.flowDefinitions);

    return {
      data: flowDefinition as any,
      apiIsBroken: false,
      requestIsInvalid: false,
    };
  }

  async updateComponentFlowDefinition(
    flowDefinition: BXComponentFlowDefinition,
  ): Promise<ApiResponse<BXComponentFlowDefinition>> {
    return {
      data: flowDefinition,
      apiIsBroken: false,
      requestIsInvalid: false,
    };
  }

  async deleteVariantFromFlowDefinition(
    currentFlowDefinition: Partial<BXPersonalizationFlowDefinition>,
    variant: PersonalizationVariant,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>> {
    const index = this.flowDefinitions
      .find((flow) => flow.friendlyId === currentFlowDefinition.friendlyId)
      ?.traffic?.splits.findIndex((item) => (item as any).variantId === variant.variantId);
    if (index !== undefined && index > -1) {
      this.flowDefinitions
        .find((flow) => flow.friendlyId === currentFlowDefinition.friendlyId)
        ?.traffic?.splits.splice(index, 1);
    }
    const value = this.flowDefinitions.find(
      (flow) => flow.friendlyId === currentFlowDefinition.friendlyId,
    ) as BXPersonalizationFlowDefinition;
    return { data: value, apiIsBroken: false, requestIsInvalid: false };
  }

  public async renameVariantNameFromFlowDefinition(
    currentFlowDefinition: BXPersonalizationFlowDefinition,
    variantId: string,
    variantName: string,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>> {
    const matchedFlowDefinition = Array.from(this.flowDefinitions).find(
      (flow) => flow.friendlyId === currentFlowDefinition.friendlyId,
    ) as BXPersonalizationFlowDefinition;

    matchedFlowDefinition?.traffic?.splits.forEach((item) => {
      if (item.variantId === variantId) {
        item.variantName = variantName;
      }
    });
    const value = { ...matchedFlowDefinition } as BXPersonalizationFlowDefinition;

    return { data: value, apiIsBroken: false, requestIsInvalid: false };
  }

  public async unarchiveFlowDefinition(
    currentFlowDefinition: BXPersonalizationFlowDefinition,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>> {
    if (!currentFlowDefinition) {
      return { apiIsBroken: false, requestIsInvalid: false, data: null };
    }

    const matchedFlowDefinition = Array.from(this.flowDefinitions).find(
      (flow) => flow.friendlyId === currentFlowDefinition.friendlyId,
    ) as BXPersonalizationFlowDefinition;

    matchedFlowDefinition.archived = false;
    matchedFlowDefinition.status = 'PRODUCTION';
    return { data: matchedFlowDefinition, apiIsBroken: false, requestIsInvalid: false };
  }

  public async archiveFlowDefinition(
    currentFlowDefinition: BXPersonalizationFlowDefinition,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>> {
    if (!currentFlowDefinition) {
      return { apiIsBroken: false, requestIsInvalid: false, data: null };
    }

    const matchedFlowDefinition = Array.from(this.flowDefinitions).find(
      (flow) => flow.friendlyId === currentFlowDefinition.friendlyId,
    ) as BXPersonalizationFlowDefinition;

    matchedFlowDefinition.archived = true;
    matchedFlowDefinition.status = 'PAUSED';
    return { data: matchedFlowDefinition, apiIsBroken: false, requestIsInvalid: false };
  }

  async addUpdateVariantToFlowDefinition(
    variant: BXPersonalizationSplit,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>> {
    const flowDefinition = Array.from(this.flowDefinitions)[0] as BXPersonalizationFlowDefinition;

    const existedVariantIndex = flowDefinition?.traffic?.splits.findIndex(
      (item) => item.variantId === variant.variantId,
    );

    if (existedVariantIndex && existedVariantIndex > -1 && flowDefinition?.traffic) {
      flowDefinition.traffic.splits[existedVariantIndex] = variant;
    } else {
      flowDefinition?.traffic?.splits.push(variant);
    }
    const value = { ...flowDefinition } as BXPersonalizationFlowDefinition;
    return { data: value, apiIsBroken: false, requestIsInvalid: false };
  }

  getPersonalizationScope(): Promise<string | undefined> {
    return Promise.resolve(undefined);
  }
}
