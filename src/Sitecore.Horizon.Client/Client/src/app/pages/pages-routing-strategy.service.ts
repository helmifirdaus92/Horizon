/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

/**
 * Custom loading strategy allows to pass "data: { reuse: true }" property for a route,
 * so it can recreate the component or not when switching the route pointing to the same component
 */
@Injectable()
export class PagesRouteReuseStrategy extends RouteReuseStrategy {
  public shouldDetach(_route: ActivatedRouteSnapshot): boolean {
    return false;
  }
  public store(_route: ActivatedRouteSnapshot, _detachedTree: DetachedRouteHandle): void {}
  public shouldAttach(_route: ActivatedRouteSnapshot): boolean {
    return false;
  }
  public retrieve(_route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null;
  }
  public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig || (future.data.reuse && curr.data.reuse);
  }
}
