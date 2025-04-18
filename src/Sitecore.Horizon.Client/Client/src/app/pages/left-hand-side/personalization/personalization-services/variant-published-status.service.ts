/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, OnDestroy } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { PageApiService } from 'app/shared/rest/page/page.api.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { environment } from 'environments/environment';
import { BehaviorSubject, catchError, combineLatest, Observable, of, switchMap } from 'rxjs';
import { getComponentVariantId } from '../personalization-api/personalization.api.utils';
import { BXComponentFlowDefinition } from '../personalization.types';
import { CdpSiteDataService } from './cdp-site-data.service';

@Injectable({
  providedIn: 'root',
})
export class VariantPublishedStatusService implements OnDestroy {
  private readonly lifetime = new Lifetime();

  private _checkLivePageVariants$ = new BehaviorSubject<boolean>(false);

  private _variantsFetched$ = new BehaviorSubject<boolean>(false);
  variantsFetched$: Observable<boolean> = this._variantsFetched$.asObservable();

  private livePageVariants: string[] = [];
  get getLivePageVariants(): string[] {
    return this.livePageVariants;
  }

  constructor(
    private readonly pageApiService: PageApiService,
    private readonly contextService: ContextService,
    private readonly cdpSiteDataService: CdpSiteDataService,
  ) {
    combineLatest([
      this._checkLivePageVariants$,
      this.contextService.itemId$,
      this.contextService.language$,
      this.cdpSiteDataService.watchCdpSiteData(),
    ])
      .pipe(
        takeWhileAlive(this.lifetime),
        switchMap(([_, itemId, language, cdpSiteData]) => {
          // API calls does not work for CI runs, so skip call if in CI run
          if (environment.inventoryConnectedMode && cdpSiteData.hasPageWithAbTest(itemId, true)) {
            return this.pageApiService.getLivePageVariants(itemId, language).pipe(
              catchError(() => {
                return of([]);
              }),
            );
          } else {
            return of([]);
          }
        }),
        shareReplayLatest(),
      )
      .subscribe((variants) => {
        this.livePageVariants = variants;
        this._variantsFetched$.next(true);
      });
  }

  updateLivePageVariantsCheckStatus(status: boolean): void {
    this._checkLivePageVariants$.next(status);
  }

  isPagePublished(flow: BXComponentFlowDefinition): boolean {
    const variantIds = flow.variants
      .filter((v) => !v.isControl)
      ?.map((v) => getComponentVariantId(v))
      .filter((v): v is string => !!v);

    if (flow.status === 'COMPLETED') {
      // For a completed flow, ensure that none of the variantIds exist on the live page.
      return variantIds.every((variantId) => !this.livePageVariants.includes(variantId));
    }
    // For other statuses, ensure that all variantIds are present on the live page.
    return variantIds.every((variantId) => this.livePageVariants.includes(variantId));
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }
}
