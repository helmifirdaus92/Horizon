/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { ContextService } from '../client-state/context.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { SiteService } from '../site-language/site-language.service';

@Injectable({ providedIn: 'root' })
export class RenderingHostResolverService {
  private localRenderingHostUrlKey = `Sitecore.Pages.LocalRenderingHostUrl|${ConfigurationService.xmCloudTenant?.id?.toLowerCase()}`;
  private _localHostUrl: string | null = null;
  private _hostUrl$ = new BehaviorSubject<string | undefined>(undefined);
  readonly hostUrl$ = this._hostUrl$.asObservable().pipe(distinctUntilChanged());
  readonly errorState$ = new BehaviorSubject<boolean>(false);

  get hostUrl() {
    return this.resolveHost();
  }

  constructor(
    private readonly siteService: SiteService,
    private readonly contextService: ContextService,
  ) {
    this._localHostUrl =
      localStorage
        .getItem(this.localRenderingHostUrlKey)
        ?.replace(`|${ConfigurationService.xmCloudTenant?.id.toLowerCase()}`, '') ?? null;

    this.contextService.siteName$
      .pipe(
        map(() => this.resolveHost()),
        distinctUntilChanged(),
      )
      .subscribe((url) => this._hostUrl$.next(url));
  }

  notifyErrorState(isError: boolean) {
    this.errorState$.next(isError);
  }

  public setLocalRenderingHost(url: string) {
    localStorage.setItem(this.localRenderingHostUrlKey, url);

    this._localHostUrl = url;
    this._hostUrl$.next(this.resolveHost());
  }

  public removeLocalRenderingHost() {
    localStorage.removeItem(this.localRenderingHostUrlKey);

    this._localHostUrl = null;
    this._hostUrl$.next(this.resolveHost());
  }

  public isLocalRenderingHostSelected() {
    return this._localHostUrl != null;
  }

  private resolveHost() {
    return this._localHostUrl ?? this.siteService.getContextSite().renderingEngineApplicationUrl;
  }
}
