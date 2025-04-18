/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { SiteDalService } from '../graphql/sites/solutionSite.dal.service';
import { Site, SiteCollection } from './site-language.service';

@Injectable({ providedIn: 'root' })
export class SiteRepositoryService {
  private _definedSites: Site[] = [];
  private _siteCollections: SiteCollection[] = [];

  constructor(private readonly siteDalService: SiteDalService) {}

  async init(): Promise<void> {
    const [sites, collections] = await Promise.all([
      firstValueFrom(this.siteDalService.getSites()),
      firstValueFrom(this.siteDalService.getCollections()),
    ]);

    this._definedSites = sites.sort((s1, s2) => s1.name.localeCompare(s2.name));
    this._siteCollections = collections;
  }

  getSites(): Site[] {
    return this._definedSites;
  }

  getSiteCollections(): SiteCollection[] {
    return this._siteCollections;
  }

  getSiteByName(name?: string): Site | undefined {
    return this._definedSites.find((s) => s.name.toLowerCase() === name?.toLowerCase());
  }

  getStartItem(siteId: string, name: string, language: string): Observable<{ id: string; version: number }> {
    return this.siteDalService.getStartItem(siteId, name, language);
  }

  getDefaultSite(siteId?: string, siteName?: string, language?: string): Observable<Pick<Site, 'id' | 'name'>> {
    return siteId
      ? this.siteDalService.getDefaultSite(siteId, siteName, language)
      : this.siteDalService.getDefaultSite();
  }

  getSiteId(siteName: string): string {
    const siteId = this.getSiteByName(siteName)?.id;
    if (!siteId) {
      throw Error('site could not be found');
    }
    return siteId;
  }
}
