/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';

@Injectable({
  providedIn: 'root',
})
export class HostingEnvironmentService {
  constructor(private readonly staticConfigurationService: StaticConfigurationService) {}

  addEnvironmentInfo(): string {
    const authorityDomain = this.staticConfigurationService.auth0Settings.domain;
    return authorityDomain.includes('staging')
      ? '&env=staging'
      : authorityDomain.includes('beta') || authorityDomain.includes('preprod')
        ? '&env=pre-production'
        : '';
  }
}
