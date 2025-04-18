/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { from, Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { ConfigurationService } from '../configuration/configuration.service';
import { StaticConfigurationService } from '../configuration/static-configuration.service';

@Injectable()
export class PlatformAuthenticationInterceptor implements HttpInterceptor {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly staticConfigurationService: StaticConfigurationService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (
      (ConfigurationService.xmCloudTenant?.url && req.url.startsWith(ConfigurationService.xmCloudTenant?.url)) ||
      (this.staticConfigurationService.inventoryApiBaseUrl &&
        req.url.startsWith(this.staticConfigurationService.inventoryApiBaseUrl)) ||
      (this.staticConfigurationService.featureFlagsBaseUrl &&
        req.url.startsWith(this.staticConfigurationService.featureFlagsBaseUrl)) ||
      (ConfigurationService.cdpTenant?.apiUrl && req.url.startsWith(ConfigurationService.cdpTenant?.apiUrl)) ||
      (this.staticConfigurationService.xMDeployAppApiBaseUrl &&
        req.url.startsWith(this.staticConfigurationService.xMDeployAppApiBaseUrl)) ||
      (this.staticConfigurationService.xMAppsApiBaseUrl &&
        req.url.startsWith(this.staticConfigurationService.xMAppsApiBaseUrl)) ||
      (this.staticConfigurationService.genAiApiBaseUrl &&
        req.url.startsWith(this.staticConfigurationService.genAiApiBaseUrl)) ||
      (this.staticConfigurationService.formsApiBaseUrl &&
        req.url.startsWith(this.staticConfigurationService.formsApiBaseUrl)) ||
      (this.staticConfigurationService.analyticsBaseUrl &&
        req.url.startsWith(this.staticConfigurationService.analyticsBaseUrl)) ||
      (this.staticConfigurationService.brandManagementBaseUrl &&
        req.url.startsWith(this.staticConfigurationService.brandManagementBaseUrl))
    ) {
      const token = this.authenticationService.getBearerToken();
      if (typeof token === 'string') {
        return next.handle(this.withTokenHeader(token, req));
      }

      return from(token).pipe(
        first(),
        switchMap((t) => next.handle(this.withTokenHeader(t, req))),
      );
    }

    return next.handle(req);
  }

  private withTokenHeader(token: string, req: HttpRequest<any>): HttpRequest<any> {
    return req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }
}
