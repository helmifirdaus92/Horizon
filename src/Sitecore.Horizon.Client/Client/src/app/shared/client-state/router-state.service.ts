/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationExtras, Router, RoutesRecognized } from '@angular/router';
import { PageDesignRoutingService } from 'app/page-design/shared/page-design-routing.service';
import { Observable } from 'rxjs';
import { filter, map, shareReplay, skip, startWith, withLatestFrom } from 'rxjs/operators';
import { getSearchParams } from '../utils/url.utils';
import { normalizeGuid } from '../utils/utils';
import { ContextHelper } from './context.helper';
import { Context, ContextService } from './context.service';

/**
 * This service keeps the router state (URL) in sync with the application state management (apollo client).
 * If store state changes in any field that has a url parameter defined the service will update the url.
 * If values in the url parameters change those are forwarded to the store.
 */
@Injectable({ providedIn: 'root' })
export class RouterStateService {
  private routerState?: Observable<Context>;

  constructor(
    private readonly router: Router,
    private readonly location: Location,
    private readonly context: ContextService,
    private readonly pageDesignRouteService: PageDesignRoutingService,
  ) {}

  /**
   * Sets the initial router state and returns the inital context
   */
  initialize() {
    const initialRouterState = this.getContextFromPath(this.location.path());
    this.routerState = this.watchRouterState().pipe(startWith(initialRouterState), shareReplay(1));
    return initialRouterState;
  }

  watchAndSyncAll() {
    if (!this.routerState) {
      throw Error('routerState is not initialized');
    }

    // Ignore first value as we are only interested in changes, not initial state.
    this.watchAndSyncRouteToContext(this.routerState.pipe(skip(1)));

    this.watchAndSyncContextStateToRoute(this.routerState);
  }

  private watchAndSyncRouteToContext(routerChanges: Observable<Context>) {
    routerChanges
      .pipe(
        // Prevent feeding back route state to context.
        // Solves an issue that: context changes => updates route => updates context.
        // Which is an issue because the source of the 2nd change is different than the original source.
        // For example when the initial context change is from 'BEACON' later when route updates context source is unset.
        withLatestFrom(this.context.value$),
        filter(([routeContext, clientContext]) => ContextHelper.areDifferent(clientContext, routeContext)),
        map(([routeContext, _clientContext]) => routeContext),
      )
      .subscribe((routerContext) => this.context.updateContext(ContextHelper.removeEmptyFields(routerContext)));
  }

  /**
   * Watch the client context and forward any changes to the router state
   */
  private watchAndSyncContextStateToRoute(routerState: Observable<Context>) {
    this.context.valueChanges$
      .pipe(
        withLatestFrom(routerState),
        filter(([clientContext, routeContext]) => ContextHelper.areDifferent(clientContext.context, routeContext)),
        map(([context]) => context),
      )
      .subscribe(({ context, options }) => this.setContextToUrl(context, options?.eventSource === 'CANVAS_BEACON'));
  }

  private getContextFromPath(path: string): Context {
    const params = getSearchParams(path);
    return {
      itemId: normalizeGuid(params.get('sc_itemid') || ''),
      language: params.get('sc_lang') || '',
      siteName: params.get('sc_site') || '',
      deviceLayoutId: params.get('sc_device') || '',
      itemVersion: params.get('sc_version') ? Number(params.get('sc_version')) : undefined,
    };
  }

  private setContextToUrl(context: Context, replaceUrl: boolean) {
    const queryParams = this.router.routerState.snapshot.root.queryParams;
    const navigationExtras: NavigationExtras = {
      queryParams: {
        sc_itemid: context.itemId || null,
        sc_lang: context.language || null,
        sc_site: context.siteName || null,
        sc_device: context.deviceLayoutId || null,
        sc_version: context.itemVersion || null,
        // Remove design params only if needed. We need to keep them in the url for the design editor.
        // but need to reomve them when site or language changes.
        folder_id: this.pageDesignRouteService.removeDesignParams$.value ? null : queryParams.folder_id,
        site_type: this.pageDesignRouteService.removeDesignParams$.value ? null : queryParams.site_type,
      },
      queryParamsHandling: 'merge',
      replaceUrl,
    };
    return this.router.navigate([], navigationExtras);
  }

  private watchRouterState(): Observable<Context> {
    return this.router.events.pipe(
      filter((ev) => ev instanceof RoutesRecognized),
      map((ev) => (ev as RoutesRecognized).state.root.queryParamMap),
      map((params) => ({
        itemId: normalizeGuid(params.get('sc_itemid') || ''),
        language: params.get('sc_lang') || '',
        siteName: params.get('sc_site') || '',
        deviceLayoutId: params.get('sc_device') || '',
        itemVersion: params.get('sc_version') ? Number(params.get('sc_version')) : undefined,
      })),
    );
  }
}
