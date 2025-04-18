/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { DroplistComponent } from '@sitecore/ng-spd-lib';
import { ItemTypesUtilityService } from 'app/editor/editor-pages-utilities.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { PersonalizationAPIService } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { getAnalyticsIdentifierUrl, getDashboardAppUrl } from 'app/shared/utils/utils';
import { environment } from 'environments/environment';
import { BehaviorSubject, combineLatest, EMPTY, map, Observable, switchMap } from 'rxjs';
import { AnalyticsApiService } from '../analytics-api/analytics.api.service';
import { AnalyticsContextService, analyticsDurationFilterOptions } from '../analytics-context.service';
import {
  checkAnalyticsHasData,
  checkCdpIsConfigured,
  checkPosIdentifierIsDefined,
} from '../analytics-util/analytics-utils';
import {
  AnalyticsTimeFilterOption,
  AnalyticsVariantFilterOption,
  PageAnalytics,
  PageAnalyticsState,
  PageAnalyticsVariantsData,
} from '../analytics.types';

export const HISTOGRAM_RECORDS_TO_DISPLAY = 5;
export const ANALYTICS_PAGE_ANALYTICS_DEFAULT_IS_LOADING = false;
export const ANALYTICS_PAGE_ANALYTICS_DEFAULT_IS_VALID_DATA = true;
export const ANALYTICS_PAGE_ANALYTICS_DEFAULT_DURATION = '7d';
export const ANALYTICS_PAGE_ANALYTICS_DEFAULT_DATA = null;

@Component({
  selector: 'app-page-analytics',
  templateUrl: './page-analytics.component.html',
  styleUrls: ['./page-analytics.component.scss'],
})
export class PageAnalyticsComponent implements OnInit {
  @ViewChild('secondDroplist') secondDroplist!: DroplistComponent;

  dashboardSettingUrl$: Observable<SafeUrl> = EMPTY;
  state$: Observable<PageAnalyticsState> = EMPTY;
  isLoading$ = new BehaviorSubject<boolean>(false);
  pageVariants$: Observable<AnalyticsVariantFilterOption[]> = EMPTY;

  durationFilterOptions: AnalyticsTimeFilterOption[] = analyticsDurationFilterOptions;
  isPosIdentifierDefined?: boolean;

  showSecondVariantDropdown$: Observable<boolean> = EMPTY;

  isFeatureEnabled = () => this.featureFlagService.isFeatureEnabled('pages_site-analytics-identifier');

  isCdpAppConfigured = () =>
    checkCdpIsConfigured(environment.personalizationIntegrationConnectedMode, {
      cdpApiUrl: ConfigurationService.cdpTenant?.apiUrl,
      cdpAppUrl: ConfigurationService.cdpTenant?.appUrl,
    });

  constructor(
    private readonly contextService: ContextService,
    private readonly analyticApiService: AnalyticsApiService,
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly timedNotificationService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly personalizationApiService: PersonalizationAPIService,
    private readonly analyticsContextService: AnalyticsContextService,
    private readonly domSanitizer: DomSanitizer,
    private readonly utilities: ItemTypesUtilityService,
    private readonly featureFlagService: FeatureFlagsService,
  ) {}

  async ngOnInit() {
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
      this.analyticsContextService.watchVariantFilterChanges(),
    ]).pipe(
      switchMap(async ([pointOfSale, durationFilter, variantFilter]) => {
        this.isPosIdentifierDefined = checkPosIdentifierIsDefined(pointOfSale);
        const pageAnalyticsData: PageAnalyticsVariantsData = { variantOne: null, variantTwo: null };
        let hasData = true;

        if (this.isCdpAppConfigured() && this.isPosIdentifierDefined) {
          this.isLoading$.next(true);
          pageAnalyticsData.variantOne = await this.loadPageAnalytics(
            durationFilter.value,
            pointOfSale,
            variantFilter.variantOne.variantId,
          );
          if (variantFilter.variantTwo) {
            pageAnalyticsData.variantTwo = await this.loadPageAnalytics(
              durationFilter.value,
              pointOfSale,
              variantFilter.variantTwo.variantId,
            );
          }

          if (
            !checkAnalyticsHasData(pageAnalyticsData.variantOne) &&
            !checkAnalyticsHasData(pageAnalyticsData.variantTwo)
          ) {
            hasData = false;
          } else if (!checkAnalyticsHasData(pageAnalyticsData.variantOne)) {
            this.timedNotificationService.push(
              'noDataForFirstVariant',
              this.translateService.get('ANALYTICS.PAGE_ANALYTICS.VARIANT_IS_MISSING_DATA', {
                variantName: variantFilter.variantOne.variantName,
              }),
              'info',
            );
          } else if (pageAnalyticsData.variantTwo && !checkAnalyticsHasData(pageAnalyticsData.variantTwo)) {
            this.timedNotificationService.push(
              'noDataForSecondVariant',
              this.translateService.get('ANALYTICS.PAGE_ANALYTICS.VARIANT_IS_MISSING_DATA', {
                variantName: variantFilter.variantTwo?.variantName,
              }),
              'info',
            );
          }
        }
        this.isLoading$.next(false);

        return {
          durationFilter,
          variantFilter,
          pageAnalyticsData,
          hasData,
          isPosIdentifierDefined: this.isPosIdentifierDefined,
        };
      }),
      shareReplayLatest(),
    );

    const sitePageItemId$ = this.utilities.ensureFirstEmitIsSitePage(
      this.contextService.itemId$,
      () => this.contextService.value,
    );

    this.pageVariants$ = combineLatest([sitePageItemId$, this.contextService.language$]).pipe(
      switchMap(() => this.getVariants()),
      shareReplayLatest(),
    );

    this.showSecondVariantDropdown$ = combineLatest([
      this.analyticsContextService.watchVariantFilterChanges(),
      this.pageVariants$,
    ]).pipe(
      map(([variantFilter]) => (variantFilter.variantTwo ? true : false)),
      shareReplayLatest(),
    );
  }

  openSecondVariantDroplist(): void {
    this.secondDroplist.onShowSelection(new Event(''));
  }

  selectDuration(duration: string): void {
    this.analyticsContextService.setDuration(duration as AnalyticsTimeFilterOption['value']);
  }

  selectVariants(firstVariant: string, secondVariant: string, pageVariants: AnalyticsVariantFilterOption[]): void {
    const variantOne = pageVariants.find((variant) => variant.variantId === firstVariant);
    const variantTwo = pageVariants.find((variant) => variant.variantId === secondVariant);

    if (variantOne) {
      this.analyticsContextService.setVariantFilterValue({ variantOne, variantTwo });
    }
  }

  handleVariantOptions(
    pageVariants: AnalyticsVariantFilterOption[],
    variantsToExclude: Array<string | null>,
  ): AnalyticsVariantFilterOption[] {
    return pageVariants.filter(
      (variant) => !variantsToExclude.some((variantToExclude) => variant.variantId === variantToExclude),
    );
  }

  private async getPageVariantId(variantId: string): Promise<string> {
    let personalizationScopeValue = await this.personalizationApiService.getPersonalizationScope();
    personalizationScopeValue = personalizationScopeValue ? `${personalizationScopeValue}_` : '';

    const { itemId, language } = this.contextService.value;

    // for analytics we do not have embedded_ as prefix
    const friendlyId = `${personalizationScopeValue}${itemId.replace(/-/g, '')}_${language}`
      .toLowerCase()
      .replace(/-/g, '_');

    return `${friendlyId}_${variantId}`;
  }

  private async loadPageAnalytics(
    duration: string,
    pointOfSale: string | null,
    pageVariantId: string,
  ): Promise<PageAnalytics | null> {
    const filter = {
      duration,
      pointOfSale,
      pageVariantId: await this.getPageVariantId(pageVariantId),
      timezoneOffset: (new Date().getTimezoneOffset() / 60) * -1,
    };

    const { apiIsBroken, requestIsInvalid, data } = await this.analyticApiService.loadPageAnalytics(filter);

    if (apiIsBroken || requestIsInvalid) {
      this.timedNotificationService.push(
        'chartApiError',
        this.translateService.get('ANALYTICS.SITE_ANALYTICS.API_ERROR_MESSAGE'),
        'error',
      );
    }

    return data;
  }

  private async getVariants(): Promise<AnalyticsVariantFilterOption[]> {
    const pageVariants: AnalyticsVariantFilterOption[] = [{ variantName: null, variantId: 'default' }];

    if (this.isCdpAppConfigured() && this.isPosIdentifierDefined) {
      const flowDefinition = await this.personalizationApiService.getActivePersonalizeFlowDefinition();

      flowDefinition.data?.traffic.splits.map((variant) => {
        if (variant) {
          pageVariants.push({ variantName: variant.variantName, variantId: variant.variantId });
        }
      });
    }

    return pageVariants;
  }
}
