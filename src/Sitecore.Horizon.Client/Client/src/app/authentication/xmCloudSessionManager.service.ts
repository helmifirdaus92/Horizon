/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { firstValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class XmCloudSessionManagerService {
  private isSessionEstablished = false;
  private trySetupSessionPromise: Promise<void> | undefined = undefined;
  private hrzEmptyPagePath = '/sitecore/shell/horizon/hrzEmptyPage.aspx';
  private iFrame: HTMLIFrameElement;
  private readonly tryEstablishSessionTimeout = 15000;

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly featureFlagService: FeatureFlagsService,
    private readonly authenticationService: AuthenticationService,

    private readonly ngZone: NgZone,
  ) {
    this.iFrame = document.createElement('iframe');
    this.iFrame.hidden = true;
  }

  setupSession() {
    const xmCloudUrl = ConfigurationService.xmCloudTenant?.url;
    const featureEnabled = this.featureFlagService.isFeatureEnabled('pages_rendering-host-flip');
    if (!xmCloudUrl || !featureEnabled) {
      this.trySetupSessionPromise = Promise.resolve();
      return;
    }

    // setTimeout and setInterval affects Angular testabilities.isStable which is used in e2e tests
    this.ngZone.runOutsideAngular(() => {
      this.trySetupSessionPromise = Promise.race([
        this.getEstablishSessionPromise(xmCloudUrl),
        this.getTimeoutExpirePromise(),
      ]);
      this.keepSessionActive(xmCloudUrl);
    });
  }

  async waitForSession() {
    if (!this.trySetupSessionPromise) {
      throw new Error('Trying to access activeSessionPromise before it was initialized');
    }

    await this.trySetupSessionPromise;
  }

  // Any errors appeared should not block the application. In worst case users still may setup session in separate browser tab.
  private getEstablishSessionPromise(xmCloudUrl: string) {
    return new Promise<void>((resolve) => {
      try {
        window.addEventListener('message', (event) => {
          if (event.data === 'hrzEmptyPageLoaded') {
            this.isSessionEstablished = true;
            resolve();
          }
        });

        this.iFrame.src = this.getEmptyPageUrlAvoidCaching(xmCloudUrl);
        document.body.appendChild(this.iFrame);
      } catch {
        resolve();
      }
    });
  }

  private getTimeoutExpirePromise() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (this.isSessionEstablished) {
          return;
        }

        this.showWarningMessage();
        resolve();
      }, this.tryEstablishSessionTimeout);
    });
  }

  private keepSessionActive(xmCloudUrl: string) {
    const refreshWindowSeconds = 30;
    let intervalTimeout = this.configurationService.xmCloudSessionTimeout - refreshWindowSeconds;
    intervalTimeout = intervalTimeout > refreshWindowSeconds ? intervalTimeout : refreshWindowSeconds;

    const interval = setInterval(async () => {
      const isPagesSessionActive = await this.authenticationService.isSessionActive();
      if (isPagesSessionActive) {
        this.iFrame.src = this.getEmptyPageUrlAvoidCaching(xmCloudUrl);
      } else {
        clearInterval(interval);
      }
    }, intervalTimeout * 1000);
  }

  private async showWarningMessage() {
    const notificationText = await firstValueFrom(this.translateService.get('WARNING.NEED_AUTHENTICATE_TO_XM_CLOUD'));
    const notificationActionText = await firstValueFrom(this.translateService.get('WARNING.GO_TO_XM_CLOUD'));
    const notification = await this.timedNotificationsService.push(
      'SessionToXmCloudIsNotEstablished',
      notificationText,
      'warning',
    );
    notification.closable = true;
    notification.action = {
      title: notificationActionText,
      run: () => window.open(ConfigurationService.xmCloudTenant?.url + '/sitecore'),
    };
  }

  private getEmptyPageUrlAvoidCaching(xmCloudUrl: string): string {
    return xmCloudUrl + this.hrzEmptyPagePath + `?i=${uuid()}`;
  }
}
