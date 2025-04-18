/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { sitesAbTestsOverviewUrl } from 'app/shared/utils/utils';
import { ComponentFlowDefinitionWithPublishedStatus } from '../page-ab-tests-dialog.component';

@Component({
  selector: 'app-page-ab-tests-list',
  templateUrl: './page-ab-tests-list.component.html',
  styleUrls: ['./page-ab-tests-list.component.scss'],
})
export class PageAbTestsListComponent {
  @Input() isLoading = false;
  @Input() pageAbTests: ComponentFlowDefinitionWithPublishedStatus[] = [];
  @Output() viewDetails = new EventEmitter<ComponentFlowDefinitionWithPublishedStatus>();

  constructor(
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly siteService: SiteService,
  ) {}

  navigateToDetail(abTest: ComponentFlowDefinitionWithPublishedStatus): void {
    this.viewDetails.emit(abTest);
  }

  async openSiteAbTests() {
    const contextSite = this.siteService.getContextSite();

    const url = sitesAbTestsOverviewUrl(
      this.staticConfigurationService.dashboardAppBaseUrl,
      contextSite.id,
      contextSite?.collectionId,
      ConfigurationService.organization,
      ConfigurationService.tenantName,
    );

    window.open(url, '_blank');
  }
}
