/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { Lifetime } from 'app/shared/utils/lifetime';
import { environment } from 'environments/environment.dev';

@Component({
  selector: 'app-hz-app-switcher',
  templateUrl: './hz-app-switcher.component.html',
  styleUrls: ['./hz-app-switcher.component.scss'],
})
export class HzAppSwitcherComponent implements AfterViewInit, OnDestroy {
  private readonly lifetime = new Lifetime();
  @ViewChild('appSwitcher', { static: false, read: ElementRef }) appSwitcher?: ElementRef;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly staticConfigurationService: StaticConfigurationService,
  ) {}

  ngAfterViewInit(): void {
    this.initAppSwitcher();
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  async initAppSwitcher() {
    const appSwitcher = this.appSwitcher?.nativeElement;
    if (!appSwitcher?.componentOnReady) {
      return;
    }

    const hostingEnvironment = this.staticConfigurationService.environment;

    appSwitcher.componentOnReady().then(() => {
      appSwitcher.init({
        getAccessToken: () => this.authenticationService.getBearerToken(),
        loginWithRedirect: (params: any) => {
          this.loginWithRedirect(params);
        },
        environment: hostingEnvironment,
        isDevMode: !environment.production,
        organizationId: ConfigurationService.organization,
        tenantId: ConfigurationService.tenantId,
        applicationName: 'Pages',
      });
    });
  }

  /**
   * Make these functions public for testability
   */
  loginWithRedirect(params: any) {
    if (params.prompt === 'login') {
      this.refreshUserLoggedInSession();
    } else if (params.organization_id) {
      this.changeOrganization(params.organization_id);
    }
  }

  refreshUserLoggedInSession() {
    window.location.reload();
  }

  changeOrganization(organizationId: string) {
    window.history.pushState(null, '', window.location.origin + window.location.pathname);

    this.authenticationService.changeAuthParams({
      organization: organizationId,
      tenantName: null,
    });
  }
}
