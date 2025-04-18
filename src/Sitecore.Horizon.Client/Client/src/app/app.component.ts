/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthenticationService } from './authentication/authentication.service';
import { XmCloudSessionManagerService } from './authentication/xmCloudSessionManager.service';
import { DesigningService } from './editor/designing/designing.service';
import { PlaceholderPropertiesSdkMessagingService } from './editor/right-hand-side/placeholder-details/placeholder-properties.sdk-messaging.service';
import { RenderingPropertiesSdkMessagingService } from './editor/right-hand-side/rendering-details/rendering-properties.sdk-messaging.service';
import { PageDesignRoutingService } from './page-design/shared/page-design-routing.service';
import { ContextValidator, EmptySitesError } from './shared/client-state/context-validator';
import { ContextService } from './shared/client-state/context.service';
import { RouterStateService } from './shared/client-state/router-state.service';
import { ConfigurationService } from './shared/configuration/configuration.service';
import { StaticConfigurationService } from './shared/configuration/static-configuration.service';
import { DatasourcePickerSdkMessagingService } from './shared/editing-shell-datasource/datasource-picker.sdk-messaging.service';
import { MediaPickerSdkMessagingService } from './shared/editing-shell-media/media-picker.sdk-messaging.service';
import { EditingShellHostService } from './shared/editing-shell/editing-shell.host.service';
import { GraphQlService } from './shared/graphql/graphql.service';
import { BeaconService } from './shared/messaging/beacon.service';
import { ConfigurationMessagingService } from './shared/messaging/configuration-messaging.service';
import { FeatureFlagsMessagingService } from './shared/messaging/feature-flags-messaging.service';
import { MessagingService } from './shared/messaging/messaging.service';
import { TranslationMessagingService } from './shared/messaging/translation-messaging.service';
import { TimedNotificationsSdkMessagingService } from './shared/notifications/timed-notifications.sdk-messaging.service';
import { TimedNotification, TimedNotificationsService } from './shared/notifications/timed-notifications.service';
import { LanguageService, SiteService } from './shared/site-language/site-language.service';
import { getDashboardAppUrl, hidePageLoader } from './shared/utils/utils';

@Component({
  selector: 'app-root',
  template: `<app-pages></app-pages>`,
})
export class AppComponent {
  constructor(
    private readonly translate: TranslateService,
    private readonly routerStateService: RouterStateService,
    private readonly pageDesignRouteService: PageDesignRoutingService,
    private readonly contextValidator: ContextValidator,
    private readonly graphqlService: GraphQlService,
    private readonly contextService: ContextService,
    private readonly messageService: MessagingService,
    private readonly beaconService: BeaconService,
    private readonly designingService: DesigningService,
    private readonly editingShellHostService: EditingShellHostService,
    private readonly renderingPropertiesSdkMessaging: RenderingPropertiesSdkMessagingService,
    private readonly placeholderPropertiesSdkMessaging: PlaceholderPropertiesSdkMessagingService,
    private readonly mediaPickerSdkMessaging: MediaPickerSdkMessagingService,
    private readonly datasourcePickerSdkMessaging: DatasourcePickerSdkMessagingService,
    private readonly configurationService: ConfigurationService,
    private readonly siteService: SiteService,
    private readonly languageService: LanguageService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly timedNotificationsSdkMessagingService: TimedNotificationsSdkMessagingService,
    private readonly translationMessagingService: TranslationMessagingService,
    private readonly authenticationService: AuthenticationService,
    private readonly featureFlagsMessagingService: FeatureFlagsMessagingService,
    private readonly xmCloudSessionManagerService: XmCloudSessionManagerService,
    private readonly configurationMessagingService: ConfigurationMessagingService,
    private readonly staticConfigurationService: StaticConfigurationService,
  ) {
    this.authenticationService.navigateToReturnUrl();
    hidePageLoader();

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang(environment.systemLang);
    this.initServices();
  }

  private async initServices() {
    this.graphqlService.initApollo();
    await this.configurationService.init();
    this.xmCloudSessionManagerService.setupSession();
    await this.languageService.init();
    await this.siteService.init();

    this.initLocale();
    await this.initContext();

    // Keep context in sync with other services
    this.routerStateService.watchAndSyncAll();

    // Update page design route when segment/context changes
    this.pageDesignRouteService.init();

    // Canvas messaging related services
    this.messageService.init();
    this.designingService.init();
    this.beaconService.init();
    this.translationMessagingService.init();
    this.featureFlagsMessagingService.init();
    this.configurationMessagingService.init();

    // FedUI Global messaging services
    this.editingShellHostService.init();
    this.mediaPickerSdkMessaging.init();
    this.datasourcePickerSdkMessaging.init();
    this.timedNotificationsSdkMessagingService.init();

    // Page composer messaging
    this.renderingPropertiesSdkMessaging.init();
    this.placeholderPropertiesSdkMessaging.init();
  }

  /**
   * Resolve and validate initial app context
   */
  private async initContext() {
    const routerContext = await this.routerStateService.initialize();
    const validContext = await this.contextValidator.getValidContext(routerContext).catch((error) => {
      if (error instanceof EmptySitesError) {
        this.showNotificationAboutNoSites();
      } else {
        this.showNotificationAboutInvalidContext();
      }

      return undefined;
    });

    if (!validContext) {
      return;
    }

    const contextHasCoercedValues = Object.values(validContext.resolvedValues).some((value) => value?.wasCoerced);
    if (contextHasCoercedValues) {
      this.showNotificationAboutDifferentContext();
    }

    await this.contextService.init(validContext.context);
  }

  private initLocale() {
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use(this.configurationService.clientLanguage);
  }

  private async showNotificationAboutInvalidContext() {
    const errorInContext = await firstValueFrom(this.translate.get('ERRORS.CONTEXT_NOT_FOUND'));
    const notification = new TimedNotification('errorInContext', errorInContext);
    notification.persistent = true;
    this.timedNotificationsService.pushNotification(notification);
  }

  private async showNotificationAboutNoSites() {
    const errorNoSites = await firstValueFrom(
      this.translate.get('ERRORS.NO_SITES_FOUND', {
        url: getDashboardAppUrl(this.staticConfigurationService.dashboardAppBaseUrl, 'sites'),
      }),
    );
    const notification = new TimedNotification('errorNoSites', '');
    notification.persistent = true;
    notification.innerHtml = errorNoSites;
    this.timedNotificationsService.pushNotification(notification);
  }

  private async showNotificationAboutDifferentContext() {
    const warningDifferentContext = await firstValueFrom(this.translate.get('ERRORS.CONTEXT_COERCED'));
    const notification = new TimedNotification('warningDifferentContext', warningDifferentContext, 'warning');
    this.timedNotificationsService.pushNotification(notification);
  }
}
