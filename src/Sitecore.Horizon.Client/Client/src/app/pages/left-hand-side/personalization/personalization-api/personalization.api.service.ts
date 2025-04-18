/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { BaseItemDalService, ItemDalService } from 'app/shared/graphql/item.dal.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { ApiResponse, handleHttpErrorResponse, handleHttpResponse } from 'app/shared/utils/utils';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  BXComponentFlowDefinition,
  BXFlowDefinitionBasicInfo,
  BXPersonalizationFlowDefinition,
  BXPersonalizationFlowDefinitionList,
  BXPersonalizationSplit,
  PersonalizationVariant,
} from '../personalization.types';
import { PersonalizationAPIServiceDisconnected } from './personalization.api.disconnected';
import { createDefaultComponentFlowDefinition, formatFriendlyId } from './personalization.api.utils';

export function personalizationAPIServiceFactory(
  contextService: ContextService,
  itemService: ItemDalService,
  httpClient: HttpClient,
  configurationService: ConfigurationService,
  siteService: SiteService,
) {
  if (environment.personalizationIntegrationConnectedMode) {
    return new PersonalizationAPIServiceConnected(
      contextService,
      itemService,
      httpClient,
      configurationService,
      siteService,
    );
  } else {
    return new PersonalizationAPIServiceDisconnected();
  }
}

export abstract class PersonalizationAPIService {
  constructor() {}

  public abstract getAllFlowDefinitions(): Promise<ApiResponse<BXPersonalizationFlowDefinitionList>>;
  public abstract getCurrentSiteFlowDefinitions(): Promise<ApiResponse<BXFlowDefinitionBasicInfo[]>>;
  public abstract getPageFlowDefinitions(pageId: string): Promise<ApiResponse<BXPersonalizationFlowDefinitionList>>;
  public abstract getActivePersonalizeFlowDefinition(): Promise<ApiResponse<BXPersonalizationFlowDefinition>>;
  public abstract createPageFlowDefinition(
    isEmbedded?: boolean,
    componentId?: string,
    flowDefinitionName?: string,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition | BXComponentFlowDefinition>>;
  public abstract createComponentFlowDefinition(
    renderingInstanceId: string,
    experimentName: string,
    renderingDisplayName: string,
  ): Promise<ApiResponse<BXComponentFlowDefinition>>;
  public abstract updateComponentFlowDefinition(
    flowDefinition: BXComponentFlowDefinition,
  ): Promise<ApiResponse<BXComponentFlowDefinition>>;
  public abstract addUpdateVariantToFlowDefinition(
    variant: PersonalizationVariant,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>>;
  public abstract deleteVariantFromFlowDefinition(
    currentFlowDefinition: BXPersonalizationFlowDefinition,
    variant: PersonalizationVariant,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>>;

  public abstract renameVariantNameFromFlowDefinition(
    currentFlowDefinition: BXPersonalizationFlowDefinition,
    variantId: string,
    variantName: string,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>>;

  public abstract unarchiveFlowDefinition(
    currentFlowDefinition: BXPersonalizationFlowDefinition,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>>;

  public abstract archiveFlowDefinition(
    currentFlowDefinition: BXPersonalizationFlowDefinition,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>>;

  public abstract getPersonalizationScope(): Promise<string | undefined>;
}

@Injectable()
export class PersonalizationAPIServiceConnected implements PersonalizationAPIService {
  private flowDefinitionEndpointURL = '/v3/flowDefinitions/';

  constructor(
    private readonly contextService: ContextService,
    private readonly itemService: BaseItemDalService,
    private readonly httpClient: HttpClient,
    private readonly configurationService: ConfigurationService,
    private readonly siteService: SiteService,
  ) {}

  async getAllFlowDefinitions(): Promise<ApiResponse<BXPersonalizationFlowDefinitionList>> {
    try {
      const requestUrl =
        ConfigurationService.cdpTenant?.apiUrl +
        this.flowDefinitionEndpointURL +
        '?flowType=embedded,component&limit=1000&offset=0&expand=true';
      const response = await firstValueFrom(
        this.httpClient.get<BXPersonalizationFlowDefinitionList>(requestUrl, {
          observe: 'response',
        }),
      );

      const result = handleHttpResponse<BXPersonalizationFlowDefinitionList>(response);

      this.adjustFlowDefinitions(result);

      return result;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return handleHttpErrorResponse(error);
      }
    }
    return {
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    };
  }

  async getCurrentSiteFlowDefinitions(): Promise<ApiResponse<BXFlowDefinitionBasicInfo[]>> {
    const siteId = this.siteService.getContextSite().hostId ?? this.siteService.getContextSite().id;
    try {
      const requestUrl =
        ConfigurationService.cdpTenant?.apiUrl +
        this.flowDefinitionEndpointURL +
        `sites/${siteId}?&limit=1000&offset=0&expand=true`;
      const response = await firstValueFrom(
        this.httpClient.get<BXFlowDefinitionBasicInfo[]>(requestUrl, {
          observe: 'response',
        }),
      );

      return handleHttpResponse<BXFlowDefinitionBasicInfo[]>(response);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return handleHttpErrorResponse(error);
      }
    }
    return {
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    };
  }

  async getPageFlowDefinitions(pageId: string): Promise<ApiResponse<BXPersonalizationFlowDefinitionList>> {
    try {
      const requestUrl =
        ConfigurationService.cdpTenant?.apiUrl +
        this.flowDefinitionEndpointURL +
        '?flowType=component,embedded&limit=1000&offset=0&expand=true&search=' +
        pageId;
      const response = await firstValueFrom(
        this.httpClient.get<BXPersonalizationFlowDefinitionList>(requestUrl, {
          observe: 'response',
        }),
      );

      const result = handleHttpResponse<BXPersonalizationFlowDefinitionList>(response);

      this.adjustFlowDefinitions(result);

      return result;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return handleHttpErrorResponse(error);
      }
    }
    return {
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    };
  }

  async getActivePersonalizeFlowDefinition(): Promise<ApiResponse<BXPersonalizationFlowDefinition>> {
    try {
      const requestUrl = ConfigurationService.cdpTenant?.apiUrl + (await this.getCurrentFlowDefinitionUrl(true));
      const response = await firstValueFrom(
        this.httpClient.get<BXPersonalizationFlowDefinition>(requestUrl, {
          observe: 'response',
        }),
      );
      const result = handleHttpResponse<BXPersonalizationFlowDefinition>(response);

      this.patchVariantId(result.data?.traffic?.splits);

      return result;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return handleHttpErrorResponse(error);
      }
    }
    return {
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    };
  }

  async updateComponentFlowDefinition(
    flowDefinition: BXComponentFlowDefinition,
  ): Promise<ApiResponse<BXComponentFlowDefinition>> {
    const requestUrl =
      ConfigurationService.cdpTenant?.apiUrl + this.flowDefinitionEndpointURL + flowDefinition.friendlyId;

    try {
      const response = await firstValueFrom(
        this.httpClient.put<BXComponentFlowDefinition>(requestUrl, flowDefinition, {
          observe: 'response',
        }),
      );

      const result = handleHttpResponse<BXComponentFlowDefinition>(response);
      return result;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return handleHttpErrorResponse(error);
      }
    }
    return {
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    };
  }

  async createComponentFlowDefinition(
    renderingInstanceId: string,
    experimentName: string,
    componentName: string,
  ): Promise<ApiResponse<BXComponentFlowDefinition>> {
    const friendlyId = await this.getFriendlyId(false, renderingInstanceId);

    const flowDefinition = createDefaultComponentFlowDefinition(
      experimentName,
      friendlyId,
      renderingInstanceId,
      this.siteService.getContextSite().hostId ?? this.siteService.getContextSite().id,
      componentName,
    );

    const requestUrl = ConfigurationService.cdpTenant?.apiUrl + this.flowDefinitionEndpointURL;

    try {
      const response = await firstValueFrom(
        this.httpClient.post<BXComponentFlowDefinition>(requestUrl, flowDefinition, {
          observe: 'response',
        }),
      );

      const result = handleHttpResponse<BXComponentFlowDefinition>(response);
      return result;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return handleHttpErrorResponse(error);
      }
    }
    return {
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    };
  }

  async createPageFlowDefinition(): Promise<ApiResponse<BXPersonalizationFlowDefinition>> {
    const friendlyId = await this.getFriendlyId(true);

    const flowDefinition: BXPersonalizationFlowDefinition = {
      name: await this.createNewFlowDefinitionName(),
      siteId: this.siteService.getContextSite().hostId ?? this.siteService.getContextSite().id,
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

    const requestUrl = ConfigurationService.cdpTenant?.apiUrl + this.flowDefinitionEndpointURL;

    try {
      const response = await firstValueFrom(
        this.httpClient.post<BXPersonalizationFlowDefinition>(requestUrl, flowDefinition, {
          observe: 'response',
        }),
      );

      const result = handleHttpResponse<BXPersonalizationFlowDefinition>(response);

      this.patchVariantId(result.data?.traffic?.splits);

      return result;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return handleHttpErrorResponse(error);
      }
    }
    return {
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    };
  }

  async deleteVariantFromFlowDefinition(
    currentFlowDefinition: BXPersonalizationFlowDefinition,
    variant: PersonalizationVariant,
  ): Promise<{ apiIsBroken: boolean; requestIsInvalid: boolean; data: BXPersonalizationFlowDefinition | null }> {
    if (!currentFlowDefinition) {
      return { apiIsBroken: false, requestIsInvalid: false, data: null };
    }

    const flowDefinition = await this.setDefaultFlowDefinitionProperties({ ...currentFlowDefinition });
    const index = flowDefinition?.traffic?.splits.findIndex((item) => item.variantId === variant.variantId);

    flowDefinition?.traffic?.splits.splice(index, 1);

    if (flowDefinition?.traffic?.splits.length === 0) {
      flowDefinition.status = 'PAUSED';
      flowDefinition.archived = true;
    }

    return await this.updateFlowDefinition(flowDefinition);
  }

  async renameVariantNameFromFlowDefinition(
    currentFlowDefinition: BXPersonalizationFlowDefinition,
    variantId: string,
    variantName: string,
  ): Promise<{ apiIsBroken: boolean; requestIsInvalid: boolean; data: BXPersonalizationFlowDefinition | null }> {
    if (!currentFlowDefinition) {
      return { apiIsBroken: false, requestIsInvalid: false, data: null };
    }
    const flowDefinition = await this.setDefaultFlowDefinitionProperties({ ...currentFlowDefinition });
    flowDefinition.traffic.splits.forEach((item) => {
      if (item.variantId === variantId) {
        item.variantName = variantName;
      }
    });

    const result = await this.updateFlowDefinition(flowDefinition);
    return result;
  }

  public async unarchiveFlowDefinition(
    currentFlowDefinition: BXPersonalizationFlowDefinition,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>> {
    if (!currentFlowDefinition) {
      return { apiIsBroken: false, requestIsInvalid: false, data: null };
    }

    currentFlowDefinition.archived = false;
    currentFlowDefinition.status = 'PRODUCTION';

    return await this.updateFlowDefinition(currentFlowDefinition);
  }

  public async archiveFlowDefinition(
    currentFlowDefinition: BXPersonalizationFlowDefinition,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>> {
    if (!currentFlowDefinition) {
      return { apiIsBroken: false, requestIsInvalid: false, data: null };
    }

    currentFlowDefinition.archived = true;
    currentFlowDefinition.status = 'PAUSED';

    return await this.updateFlowDefinition(currentFlowDefinition);
  }

  async addUpdateVariantToFlowDefinition(
    _variant: BXPersonalizationSplit,
  ): Promise<ApiResponse<BXPersonalizationFlowDefinition>> {
    throw new Error('Method not implemented.');
  }

  async getPersonalizationScope(): Promise<string | undefined> {
    const personalizationScopeValue = await firstValueFrom(
      this.configurationService.configuration$.pipe(map((config) => config.personalizeScope)),
    );
    return personalizationScopeValue ? `${personalizationScopeValue.replace(/[^a-zA-Z0-9]/g, '')}` : '';
  }

  private async updateFlowDefinition(
    flowDefinition: BXPersonalizationFlowDefinition,
  ): Promise<{ apiIsBroken: boolean; requestIsInvalid: boolean; data: BXPersonalizationFlowDefinition | null }> {
    const requestUrl = ConfigurationService.cdpTenant?.apiUrl + (await this.getCurrentFlowDefinitionUrl());

    try {
      const response = await firstValueFrom(
        this.httpClient.put<BXPersonalizationFlowDefinition>(requestUrl, flowDefinition, {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          observe: 'response',
        }),
      );

      const result = handleHttpResponse<BXPersonalizationFlowDefinition>(response);

      this.patchVariantId(result.data?.traffic?.splits);

      return result;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return handleHttpErrorResponse(error);
      }
    }
    return {
      apiIsBroken: true,
      requestIsInvalid: true,
      data: null,
    };
  }

  private adjustFlowDefinitions(result: ApiResponse<BXPersonalizationFlowDefinitionList>) {
    result?.data?.items.forEach((flowDefinition) => {
      if (flowDefinition.friendlyId.startsWith('embedded') && flowDefinition.traffic && flowDefinition.traffic.splits) {
        this.patchVariantId((flowDefinition as BXPersonalizationFlowDefinition).traffic.splits);
      }

      // Uncomment to simulate the flow where the page has achieved statistical significance.
      // flowDefinition.result = {
      //   processedAt: '2024-07-21T20:00:00Z',
      //   outcome: 'CONCLUSIVE',
      // };

      if (
        (flowDefinition.friendlyId.startsWith('component') && flowDefinition.traffic.type !== 'simpleTraffic') ||
        !flowDefinition.traffic.splits.length
      ) {
        flowDefinition.traffic = {
          allocation: 100,
          weightingAlgorithm: 'USER_DEFINED',
          type: 'simpleTraffic',
          coupled: false,
          splits: [],
        };
        flowDefinition.variants?.forEach((variant) => {
          (flowDefinition as BXComponentFlowDefinition).traffic.splits.push({
            ref: variant.ref,
            split: 50,
          });
        });
      }
    });
  }

  private async setDefaultFlowDefinitionProperties(
    flowDefinition: BXPersonalizationFlowDefinition,
  ): Promise<BXPersonalizationFlowDefinition> {
    flowDefinition.name = await this.createNewFlowDefinitionName();
    flowDefinition.archived = false;

    return flowDefinition;
  }

  private async createNewFlowDefinitionName(): Promise<string> {
    let personalizationScopeValue = await this.getPersonalizationScope();
    personalizationScopeValue = personalizationScopeValue ? `${personalizationScopeValue} ` : '';

    const { itemId, language, siteName } = this.contextService.value;

    const pageName = await firstValueFrom(this.itemService.getItemDisplayName(itemId, language, siteName));

    return `${personalizationScopeValue}${pageName} ${language} - ${itemId}`;
  }

  private async getCurrentFlowDefinitionUrl(isEmbedded = true, componentId?: string): Promise<string> {
    return this.flowDefinitionEndpointURL + (await this.getFriendlyId(!!isEmbedded, componentId));
  }

  private async getFriendlyId(isEmbedded = true, renderingInstaceId?: string) {
    const { itemId, language } = this.contextService.value;
    const personalizationScopeValue = await this.getPersonalizationScope();

    return formatFriendlyId(isEmbedded, personalizationScopeValue, itemId, renderingInstaceId, language);
  }

  private patchVariantId(splits?: BXPersonalizationSplit[]): void {
    if (!splits?.length) {
      return;
    }

    // variantId is not returned as part of Boxever response, we manually set this field
    // This is to keep the UI logic simpler
    splits.forEach(
      (variant) => (variant.variantId = variant?.template ? JSON.parse(variant?.template)?.variantId : undefined),
    );
  }
}
