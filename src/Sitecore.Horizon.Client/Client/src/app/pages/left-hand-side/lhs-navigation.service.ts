/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { watchMostInnerRouteSegment } from 'app/shared/utils/utils';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LHSNavigationService {
  private router?: Router;
  private route?: ActivatedRoute;

  provideRouter(router: Router, route: ActivatedRoute) {
    this.router = router;
    this.route = route;
  }

  watchRouteSegment(): Observable<string> {
    if (!this.router || !this.route) {
      throw Error(`Failed to get active route. Router is not provided to LeftHandSiteService`);
    }

    return watchMostInnerRouteSegment(this.router, this.route).pipe(map((route) => route.segment));
  }

  watchRouteSegmentWithQueryParams(): Observable<{
    segment: string;
    queryParams: Params;
  }> {
    if (!this.router || !this.route) {
      throw Error(`Failed to get active route. Router is not provided to LeftHandSiteService`);
    }

    return watchMostInnerRouteSegment(this.router, this.route);
  }
}
