/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { getAnalyticsIdentifierUrl, getDashboardAppUrl } from 'app/shared/utils/utils';
import { environment } from 'environments/environment.dev';
import { BehaviorSubject, EMPTY, Observable, combineLatest, switchMap } from 'rxjs';
import { AnalyticsApiService } from '../analytics-api/analytics.api.service';
import { AnalyticsContextService, analyticsDurationFilterOptions } from '../analytics-context.service';
import {
  checkAnalyticsHasData,
  checkCdpIsConfigured,
  checkPosIdentifierIsDefined,
} from '../analytics-util/analytics-utils';
import { AnalyticsTimeFilterOption, SiteAnalyticsState } from '../analytics.types';

export const HISTOGRAM_RECORDS_TO_DISPLAY = 5;
export const ANALYTICS_SITE_ANALYTICS_DEFAULT_IS_LOADING = false;
export const ANALYTICS_SITE_ANALYTICS_DEFAULT_IS_VALID_DATA = true;
export const ANALYTICS_SITE_ANALYTICS_DEFAULT_DURATION = '7d';
export const ANALYTICS_SITE_ANALYTICS_DEFAULT_DATA = null;

@Component({
  selector: 'app-site-analytics',
  templateUrl: './site-analytics.component.html',
  styleUrls: ['./site-analytics.component.scss'],
})
export class SiteAnalyticsComponent implements OnInit {
  dashboardSettingUrl$: Observable<SafeUrl> = EMPTY;
  state$: Observable<SiteAnalyticsState> = EMPTY;
  siteName$ = this.contextService.siteName$;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  durationFilterOptions: AnalyticsTimeFilterOption[] = analyticsDurationFilterOptions;
  isCdpAppConfigured = checkCdpIsConfigured(environment.personalizationIntegrationConnectedMode, {
    cdpApiUrl: ConfigurationService.cdpTenant?.apiUrl,
    cdpAppUrl: ConfigurationService.cdpTenant?.appUrl,
  });

  isFeatureEnabled = () => this.featureFlagService.isFeatureEnabled('pages_site-analytics-identifier');

  constructor(
    private readonly contextService: ContextService,
    private readonly analyticApiService: AnalyticsApiService,
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly timedNotificationService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly analyticsContextService: AnalyticsContextService,
    private readonly domSanitizer: DomSanitizer,
    private readonly featureFlagService: FeatureFlagsService,
  ) {}

  ngOnInit() {
    if (this.isFeatureEnabled()) {
      this.dashboardSettingUrl$ = this.analyticsContextService.getSiteInformation().pipe(
        switchMap(async (site) => {
          return this.domSanitizer.bypassSecurityTrustUrl(
            getAnalyticsIdentifierUrl(
              this.staticConfigurationService.dashboardAppBaseUrl,
              site?.collectionId,
              site?.id,
              site?.hostId,
            ),
          );
        }),
        shareReplayLatest(),
      );
    } else {
      this.dashboardSettingUrl$ = this.contextService.siteName$.pipe(
        switchMap(async (siteName) =>
          this.domSanitizer.bypassSecurityTrustUrl(
            getDashboardAppUrl(this.staticConfigurationService.dashboardAppBaseUrl, 'settings', siteName),
          ),
        ),
        shareReplayLatest(),
      );
    }

    this.state$ = combineLatest([
      this.analyticsContextService.getPointOfSale(),
      this.analyticsContextService.watchDuration(),
    ]).pipe(
      switchMap(async ([pointOfSale, duration]) => {
        const isPosIdentifierDefined = checkPosIdentifierIsDefined(pointOfSale);
        let siteAnalyticsData = null;
        let hasData = true;

        if (this.isCdpAppConfigured && isPosIdentifierDefined) {
          this.isLoading$.next(true);

          const filter = {
            duration: duration.value,
            pointOfSale,
            // getTimezoneOffset() returns a negative number when you are ahead of UTC and vice versa. Adjusting the difference to make it compatible with boxever api.
            timezoneOffset: (new Date().getTimezoneOffset() / 60) * -1,
          };

          const { apiIsBroken, requestIsInvalid, data } = await this.analyticApiService.loadSiteAnalytics(filter);
          if (apiIsBroken || requestIsInvalid) {
            this.timedNotificationService.push(
              'chartApiError',
              this.translateService.get('ANALYTICS.SITE_ANALYTICS.API_ERROR_MESSAGE'),
              'error',
            );
          }

          siteAnalyticsData = data;

          hasData = checkAnalyticsHasData(data);

          this.isLoading$.next(false);
        } else {
          siteAnalyticsData = null;
        }
        return { duration: duration.value, siteAnalyticsData, hasData, isPosIdentifierDefined };
      }),
    );
  }

  selectDuration(duration: string) {
    this.analyticsContextService.setDuration(duration as AnalyticsTimeFilterOption['value']);
  }
}
