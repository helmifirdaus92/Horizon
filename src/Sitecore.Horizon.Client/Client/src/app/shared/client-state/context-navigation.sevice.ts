/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { watchMostInnerRouteSnapshot } from '../utils/utils';

@Injectable({ providedIn: 'root' })
export class ContextNavigationService {
  mostInnerRoute$: Observable<ActivatedRouteSnapshot>;
  mostInnerRouteSegment$: Observable<string>;

  constructor(private readonly route: ActivatedRoute, private readonly router: Router) {
    this.mostInnerRoute$ = watchMostInnerRouteSnapshot(this.router, this.route);
    this.mostInnerRouteSegment$ = this.mostInnerRoute$.pipe(map((r) => r.url[0].path));
  }
}
