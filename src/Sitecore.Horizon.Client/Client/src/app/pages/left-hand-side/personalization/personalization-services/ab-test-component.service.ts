/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { checkCdpIsConfigured, checkPosIdentifierIsDefined } from 'app/analytics/analytics-util/analytics-utils';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { AbTestComponentConfigurationStatus } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { environment } from 'environments/environment.dev';
import { BehaviorSubject } from 'rxjs';
import { LHSNavigationService } from '../../lhs-navigation.service';
import { PersonalizationAPIService } from '../personalization-api/personalization.api.service';
import { formatFriendlyId, isPageComponentFriendlyId } from '../personalization-api/personalization.api.utils';
import { BXComponentFlowDefinition, BXFlowDefinitionBasicInfo } from '../personalization.types';
import { FlowDefinitionsService } from './flow-definitions.service';

@Injectable({
  providedIn: 'root',
})
export class AbTestComponentService implements OnDestroy {
  private readonly lifetime = new Lifetime();
  private activeNavigation = '';
  private _flowDefinitionsSubject = new BehaviorSubject<BXFlowDefinitionBasicInfo[]>([]);

  flowDefinition$ = this._flowDefinitionsSubject.asObservable();
  isPosIdentifierDefined = true;

  isCdpAppConfigured = checkCdpIsConfigured(environment.personalizationIntegrationConnectedMode, {
    cdpApiUrl: ConfigurationService.cdpTenant?.apiUrl,
    cdpAppUrl: ConfigurationService.cdpTenant?.appUrl,
  });

  private selectedTestSubject = new BehaviorSubject<BXComponentFlowDefinition | null>(null);
  selectedTest$ = this.selectedTestSubject.asObservable();

  constructor(
    private readonly personalizationApiService: PersonalizationAPIService,
    private readonly flowDefinitionsService: FlowDefinitionsService,
    private readonly siteService: SiteService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly lhsNavService: LHSNavigationService,
    private contextService: ContextService,
  ) {
    const activeNavigation$ = this.lhsNavService.watchRouteSegment();
    activeNavigation$.pipe(takeWhileAlive(this.lifetime)).subscribe((route) => (this.activeNavigation = route));

    this.contextService.siteName$.pipe(takeWhileAlive(this.lifetime)).subscribe(async () => {
      this.setFlowDefinitions();
    });
  }

  setSelectedTest(test: BXComponentFlowDefinition) {
    this.selectedTestSubject.next(test);
  }

  async getAbTestsConfiguredOnPage(
    itemId: string,
    language: string,
    forceUpdate: boolean = false,
  ): Promise<BXComponentFlowDefinition[]> {
    const allFlowDefinitions = await this.flowDefinitionsService.getPageFlowDefinitions(itemId, language, forceUpdate);
    const personalizationScope = await this.personalizationApiService.getPersonalizationScope();

    const componentsFlowDefinitions = allFlowDefinitions.flows
      ? allFlowDefinitions.flows.filter((flow) =>
          isPageComponentFriendlyId(flow.friendlyId, itemId, personalizationScope, language),
        )
      : [];

    return componentsFlowDefinitions as BXComponentFlowDefinition[];
  }

  getPageFlowDefinitions(itemId: string, language: string, forceUpdate: boolean = false) {
    return this.flowDefinitionsService.getPageFlowDefinitions(itemId, language, forceUpdate);
  }

  async getCurrentSiteFlowDefinitions(): Promise<BXFlowDefinitionBasicInfo[]> {
    if (!this.isCdpAppConfigured) {
      return [];
    }
    const flowDefinitionsResponse = await this.personalizationApiService.getCurrentSiteFlowDefinitions();

    if (!flowDefinitionsResponse.apiIsBroken && flowDefinitionsResponse.data) {
      return flowDefinitionsResponse.data;
    }

    return [];
  }

  async getAbTestConfigStatus(itemId: string, language: string): Promise<AbTestComponentConfigurationStatus> {
    if (
      this.activeNavigation === 'editpagedesign' ||
      this.activeNavigation === 'editpartialdesign' ||
      this.activeNavigation === 'editpagebranch'
    ) {
      return 'modeNotSupported';
    }

    if (!this.isCdpAppConfigured) {
      return 'notEnabledOnTenant';
    }

    const posIdentifier = await this.siteService.getPointOfSale();
    const isPosIdentifierDefined = checkPosIdentifierIsDefined(posIdentifier);

    if (!isPosIdentifierDefined) {
      return 'noPOSIdentifierForSite';
    }

    const pageflowDefinition = await this.flowDefinitionsService.getPageFlowDefinitions(itemId, language);
    const personalizationScopeValue = await this.personalizationApiService.getPersonalizationScope();
    if (
      pageflowDefinition?.flows.some((flow) =>
        flow.friendlyId.includes(formatFriendlyId(true, personalizationScopeValue, itemId, '', language)),
      )
    ) {
      return 'pagePersonalizationConfigured';
    }

    return 'readyForConfiguration';
  }

  async refetchFlows(itemId: string, language: string) {
    await this.setFlowDefinitions();
    return this.flowDefinitionsService.getPageFlowDefinitions(itemId, language, true);
  }

  async setFlowDefinitions() {
    const flowDefinitions = await this.getCurrentSiteFlowDefinitions();
    this._flowDefinitionsSubject.next(flowDefinitions);
  }

  async updateComponentFlowDefinition(flowDefinition: BXComponentFlowDefinition) {
    if (this.isCdpAppConfigured) {
      const updateFlowDefinitionResult =
        await this.personalizationApiService.updateComponentFlowDefinition(flowDefinition);
      if (
        updateFlowDefinitionResult.requestIsInvalid ||
        updateFlowDefinitionResult.apiIsBroken ||
        !updateFlowDefinitionResult.data
      ) {
        this.timedNotificationsService.push(
          'updateComponentFlowDefinitionError',
          this.translateService.get('COMPONENT_TESTING.SAVE_ERROR'),
        );
      }
    }
  }

  ngOnDestroy() {
    this.lifetime.dispose();
  }
}
