/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable } from '@angular/core';
import { SitecoreUser, TokenCustomClaimKeysEnum } from 'app/authentication/library/types';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { injectScript, removeScript } from 'app/shared/utils/script-injector.utils';
import { environment } from 'environments/environment';

export const GAINSIGHT_SCRIPT_ID = 'sc_horizon_gainsight';

@Injectable({
  providedIn: 'root',
})
export class GainsightService {
  private user?: SitecoreUser;

  constructor(
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  async init(user?: SitecoreUser): Promise<void> {
    if (environment.gainsightDisabled || !this.featureFlagsService.isFeatureEnabled('pages_gainsight')) {
      removeScript(GAINSIGHT_SCRIPT_ID);
      (window as any).identifyInitialized = false;
      return;
    }

    if (!this.staticConfigurationService.gainsightProductKey) {
      return;
    }

    this.user = user;

    this.injectGaintSightScript();
    this.setGainsightIdentifyFields();
    this.setGainsightGlobalContext();
  }

  private injectGaintSightScript() {
    injectScript({ code: this.getGainsightScript(), id: GAINSIGHT_SCRIPT_ID });
  }

  private getGainsightScript() {
    return `
    (function(n,t,a,e,co){var i="aptrinsic";n[i]=n[i]||function(){
        (n[i].q=n[i].q||[]).push(arguments)},n[i].p=e;n[i].c=co;
      var r=t.createElement("script");r.async=!0,r.src=a+"?a="+e;
      var c=t.getElementsByTagName("script")[0];c.parentNode.insertBefore(r,c)
    })(window,document,"https://web-sdk-eu.aptrinsic.com/api/aptrinsic.js","${this.staticConfigurationService.gainsightProductKey}");
`;
  }

  private setGainsightIdentifyFields() {
    const global = window as any;
    const script = document.getElementById(GAINSIGHT_SCRIPT_ID);

    if (!this.user || !script) {
      return;
    }

    const accountFields = { id: this.user[TokenCustomClaimKeysEnum.ORG_ACC_ID] };
    const userFields = {
      id: this.user.email,
      email: this.user.email,
      lastLogin: new Date(this.user.lastLogin).valueOf(),
      signUpDate: new Date(this.user.created).valueOf(),
    };

    global.aptrinsic?.('identify', userFields, accountFields);
    global.identifyInitialized = true;
  }

  private setGainsightGlobalContext() {
    const global = window as any;
    const { identifyInitialized, aptrinsic } = global;

    if (!this.user || !identifyInitialized || !aptrinsic) {
      return;
    }

    const orgRoles = this.user[TokenCustomClaimKeysEnum.ROLES]
      .filter((role) => role.includes('Organization'))
      .map((orgRole) => orgRole.split('\\')[1]);

    const globalContext = {
      OrganizationID: this.user[TokenCustomClaimKeysEnum.ORG_ID],
      'Organization DisplayName': this.user[TokenCustomClaimKeysEnum.ORG_DISPLAY_NAME],
      'Organization Role': orgRoles.join(', '),
      'Organization Type': this.user[TokenCustomClaimKeysEnum.ORG_TYPE] ?? '',
      'App Hostname': window.location.hostname,
    };
    global.aptrinsic?.('set', 'globalContext', globalContext);
  }
}
