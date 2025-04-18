/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, type OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { SitecoreUser, TokenCustomClaimKeysEnum } from 'app/authentication/library/types';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent implements OnInit {
  user?: SitecoreUser;
  orgName?: string;
  manageUserUrl: SafeUrl;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly domSanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.user = this.authenticationService.authProvider.user;
    if (!this.user) {
      return;
    }

    this.orgName = this.user[TokenCustomClaimKeysEnum.ORG_DISPLAY_NAME];

    this.manageUserUrl = this.domSanitizer.bypassSecurityTrustUrl(
      this.staticConfigurationService.portalBaseUrl + '/profile?organization=' + ConfigurationService.organization,
    );
  }

  logout() {
    this.authenticationService.logout();
  }
}
