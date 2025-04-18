/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { SiteSwitcherService } from 'app/editor/shared/site-language-switcher/site-language-switcher.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, map, Observable, of, switchMap } from 'rxjs';
import { AnalyticsRoute, AnalyticsTimeFilterOption, AnalyticsVariantFilterValue } from './analytics.types';

export const analyticsDurationFilterOptions: AnalyticsTimeFilterOption[] = [
  { id: '1H', value: '1h' },
  { id: '3H', value: '3h' },
  { id: '1D', value: '1d' },
  { id: '7D', value: '7d' },
  { id: '14D', value: '14d' },
  { id: '30D', value: '30d' },
];

const DEFAULT_ANALYTICS_FILTER_OPTION: AnalyticsTimeFilterOption = analyticsDurationFilterOptions[3];

const DEFAULT_ANALYTICS_VARIANT_FILTER_VALUE: AnalyticsVariantFilterValue = {
  variantOne: {
    variantName: null,
    variantId: 'default',
  },
};

@Injectable({
  providedIn: 'root',
})
export class AnalyticsContextService {
  private _activeRoute$ = new BehaviorSubject<AnalyticsRoute>('site');

  private _duration$ = new BehaviorSubject<AnalyticsTimeFilterOption>(DEFAULT_ANALYTICS_FILTER_OPTION);

  private _variantFilter$ = new BehaviorSubject<AnalyticsVariantFilterValue>(DEFAULT_ANALYTICS_VARIANT_FILTER_VALUE);

  constructor(
    private readonly contextService: ContextService,
    private readonly siteService: SiteService,
    private readonly siteSwitcherService: SiteSwitcherService,
  ) {
    combineLatest([
      this.contextService.siteName$,
      this.contextService.itemId$,
      this.contextService.language$,
    ]).subscribe(() => {
      this.setVariantFilterValue();
    });
  }

  // Active route
  setActiveRoute(value: AnalyticsRoute) {
    this._activeRoute$.next(value);
  }
  watchActiveRoute(): Observable<AnalyticsRoute> {
    return this._activeRoute$.asObservable().pipe(distinctUntilChanged(), shareReplayLatest());
  }

  // Duration filter
  setDuration(value: AnalyticsTimeFilterOption['value']) {
    const result = analyticsDurationFilterOptions.find((item) => item.value === value);
    if (!result) {
      return;
    }
    this._duration$.next(result);
  }

  watchDuration(): Observable<AnalyticsTimeFilterOption> {
    return this._duration$.asObservable().pipe(
      distinctUntilChanged((oldValue, newValue) => oldValue.id === newValue.id),
      shareReplayLatest(),
    );
  }

  // Variant filter
  setVariantFilterValue(value?: AnalyticsVariantFilterValue) {
    this._variantFilter$.next(value ?? DEFAULT_ANALYTICS_VARIANT_FILTER_VALUE);
  }

  watchVariantFilterChanges(): Observable<AnalyticsVariantFilterValue> {
    return this._variantFilter$.asObservable().pipe(
      distinctUntilChanged(
        (oldValue, newValue) =>
          oldValue.variantOne.variantId === newValue?.variantOne?.variantId &&
          oldValue?.variantTwo?.variantId === newValue?.variantTwo?.variantId &&
          newValue !== DEFAULT_ANALYTICS_VARIANT_FILTER_VALUE,
      ),
      shareReplayLatest(),
    );
  }

  getPointOfSale(): Observable<string | null> {
    return combineLatest([this.contextService.siteName$, this.contextService.language$]).pipe(
      switchMap(async () => await this.siteService.getPointOfSale()),
      distinctUntilChanged(),
      shareReplayLatest(),
    );
  }

  getSiteInformation(): Observable<{ collectionId?: string; id: string; hostId: string } | null> {
    //Sites
    return this.siteSwitcherService.site.pipe(
      catchError((error) => {
        console.error('Error fetching site information:', error);
        return of({
          collectionId: '',
          id: '',
          hostId: '',
        });
      }),
      map((activeSite) => {
        const site = this.siteService
          .getSites()
          .find(
            (s) => typeof activeSite === 'string' && s.name.toLocaleLowerCase() === activeSite.toLocaleLowerCase(),
          ) ?? {
          collectionId: '',
          id: '',
          hostId: '',
        };
        return {
          collectionId: site.collectionId,
          id: site.id,
          hostId: site.hostId,
        };
      }),
    );
  }
}
