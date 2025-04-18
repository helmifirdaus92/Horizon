/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { checkCdpIsConfigured } from 'app/analytics/analytics-util/analytics-utils';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { RenderingHostFeaturesService } from 'app/shared/rendering-host/rendering-host-features.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { ApiResponse } from 'app/shared/utils/utils';
import { environment } from 'environments/environment.dev';
import { combineLatest } from 'rxjs';
import { PersonalizationAPIService } from '../personalization-api/personalization.api.service';
import { BXPersonalizationFlowDefinitionList } from '../personalization.types';

@Injectable({
  providedIn: 'root',
})
export class FlowDefinitionsService {
  private lifetime: Lifetime = new Lifetime();

  private itemId: string = '';
  private language: string = '';

  private _flowDefinitionsPromise: Promise<{
    context: { itemId: string; language: string };
    flows: BXPersonalizationFlowDefinitionList['items'];
  }>;

  isCdpAppConfigured = checkCdpIsConfigured(environment.personalizationIntegrationConnectedMode, {
    cdpApiUrl: ConfigurationService.cdpTenant?.apiUrl,
    cdpAppUrl: ConfigurationService.cdpTenant?.appUrl,
  });

  constructor(
    private readonly personalizationApiService: PersonalizationAPIService,
    private readonly contextService: ContextService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly rhFeatureService: RenderingHostFeaturesService,
    private readonly staticConfigurationService: StaticConfigurationService,
  ) {
    combineLatest([this.contextService.itemId$, this.contextService.language$])
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(([itemId, language]) => {
        this.itemId = itemId;
        this.language = language;

        this._flowDefinitionsPromise = this.fetchPageFlowDefinitions(itemId, language);
      });
  }

  getPageFlowDefinitions(itemId: string, language: string, forceRefetch: boolean = false) {
    if (this.itemId === itemId && this.language === language && !forceRefetch) {
      return this._flowDefinitionsPromise;
    }

    this.itemId = itemId;
    this.language = language;

    this._flowDefinitionsPromise = this.fetchPageFlowDefinitions(itemId, language);
    return this._flowDefinitionsPromise;
  }

  private async fetchPageFlowDefinitions(
    itemId: string,
    language: string,
  ): Promise<{
    context: { itemId: string; language: string };
    flows: BXPersonalizationFlowDefinitionList['items'];
  }> {
    const isComponentsTestingEnabled = this.featureFlagsService.isFeatureEnabled('pages_components-testing');
    const isComponentsTestingEnabledForTenant = await this.rhFeatureService.isFeatureEnabled('rh_components-testing');
    const isStagingEnvironment = this.staticConfigurationService.isStagingEnvironment;

    if (
      isComponentsTestingEnabled &&
      (isComponentsTestingEnabledForTenant || isStagingEnvironment) &&
      this.isCdpAppConfigured
    ) {
      try {
        const flows = await this.personalizationApiService
          .getPageFlowDefinitions(itemId.toLowerCase().replace(/-/g, ''))
          .then((flowDefinitionsResponse) => this.handleAPIResponse(flowDefinitionsResponse).data?.items ?? []);

        return {
          context: { itemId, language },
          flows: flows.filter((flow) => {
            const normalizedFriendlyId = flow.friendlyId.toLowerCase();
            return normalizedFriendlyId.includes(`_${language.toLowerCase().replace(/-/g, '_')}`);
          }),
        };
      } catch (error) {
        console.error('Error fetching current page flow definitions:', error);
        return Promise.resolve({ context: { itemId, language }, flows: [] });
      }
    }
    return Promise.resolve({
      context: { itemId, language },
      flows: [],
    });
  }

  private handleAPIResponse<T>(requestResult: ApiResponse<T>): ApiResponse<T> {
    if (requestResult?.apiIsBroken === true) {
      throw new Error('Api is broken');
    }

    if (requestResult.requestIsInvalid === true) {
      throw new Error('Request is invalid');
    }

    return requestResult;
  }
}
