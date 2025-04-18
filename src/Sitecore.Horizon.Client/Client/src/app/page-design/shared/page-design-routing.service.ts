/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { watchMostInnerRouteSegment } from 'app/shared/utils/utils';
import { BehaviorSubject } from 'rxjs';

interface DesigningQueryParams {
  folder_id: string | null;
  site_type: string | null;
  branch_name?: string | null;
}

@Injectable()
export class PageDesignRoutingService {
  private readonly lifetime = new Lifetime();

  readonly removeDesignParams$ = new BehaviorSubject<boolean>(false);
  constructor(private readonly route: ActivatedRoute, private readonly router: Router) {}

  init() {
    this.watchRouteSegmentChange();
  }

  private watchRouteSegmentChange(): void {
    watchMostInnerRouteSegment(this.router, this.route)
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(({ segment }) => {
        if (
          segment !== 'pagebranches' &&
          segment !== 'editpagebranch' &&
          segment !== 'pagedesigns' &&
          segment !== 'partialdesigns' &&
          segment !== 'editpagedesign' &&
          segment !== 'editpartialdesign' &&
          segment !== 'pagetemplates'
        ) {
          const queryParams: DesigningQueryParams = {
            folder_id: null,
            site_type: null,
          };
          if (segment !== 'editpagebranch') {
            queryParams.branch_name = null;
          }

          const updatedQueryParam: NavigationExtras = {
            queryParams,
            queryParamsHandling: 'merge',
          };
          this.router.navigate([], updatedQueryParam);
        }
      });
  }
}
