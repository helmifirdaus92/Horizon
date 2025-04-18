/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tenant } from 'app/authentication/library/tenant/tenant.types';
import { SiteCollection } from 'app/shared/site-language/site-language.service';
import { Language, SiteInSwitcher } from '../site-language-switcher.service';

type CollectionInSwitcher = SiteCollection & {
  sites: SiteInSwitcher[];
};

export interface TenantSwitcherInput {
  definedTenants: Tenant[];
  activeTenantName: string;
}

@Component({
  selector: 'app-site-language-dropdowns',
  templateUrl: './site-language-dropdowns.component.html',
  styleUrls: ['./site-language-dropdowns.component.scss'],
})
export class SiteLanguageDropdownsComponent {
  @Input()
  set sites(val: { definedSites: SiteInSwitcher[]; activeSite: SiteInSwitcher; collections: SiteCollection[] } | null) {
    this.definedSites = Array.from(val?.definedSites ?? []);
    this.activeSite = Object.assign({}, val?.activeSite ?? null);
    this.definedCollections = Array.from(val?.collections ?? []);

    this.applySearch('');
  }

  @Input() languages: { definedLanguages: Language[]; activeLanguage: Language } | null = null;
  @Input() tenants: TenantSwitcherInput | null = null;

  @Output() siteChange = new EventEmitter<string | null>();
  @Output() languageChange = new EventEmitter<string | null>();
  @Output() tenantChange = new EventEmitter<string | null>();

  private definedCollections: SiteCollection[] = [];
  definedSites: SiteInSwitcher[] = [];
  activeSite: SiteInSwitcher | null = null;
  collections: CollectionInSwitcher[] = [];

  get activeTenantDisplayName(): string {
    const activeTenant = this.tenants?.definedTenants.find((tenant) => tenant.name === this.tenants?.activeTenantName);
    return activeTenant ? activeTenant.displayName : '';
  }

  applySearch(searchValue: string): void {
    searchValue = searchValue.trim().toLowerCase();

    const matchedSites = this.definedSites.filter((item) =>
      (item.displayName?.toLowerCase() || item.name?.toLowerCase())?.includes(searchValue),
    );

    const defaultCollection = {
      id: '',
      name: '',
      displayName: '',
      sites: [],
    };
    const definedCollectionsMapped = this.mapToCollectionsInSwitcher(this.definedCollections);
    const matchedCollections: CollectionInSwitcher[] = [];
    matchedSites.forEach((site) => {
      const collection =
        definedCollectionsMapped.find((collection) => collection.id === site.collectionId) ?? defaultCollection;
      collection.sites.push(site);

      if (!matchedCollections.includes(collection)) {
        matchedCollections.push(collection);
      }
    });

    this.collections = matchedCollections;
  }

  selectSite(site: SiteInSwitcher) {
    if (!this.definedSites) {
      return;
    }
    if (site.name !== this.activeSite?.name) {
      this.activeSite = site;
      this.siteChange.emit(site.name);
    }
  }

  selectLanguage(language: Language) {
    if (!this.languages) {
      return;
    }
    if (language.name !== this.languages.activeLanguage.name) {
      this.languages.activeLanguage = language;
      this.languageChange.emit(language.name);
    }
  }

  selectTenant(name: string) {
    if (!this.tenants?.definedTenants?.length || this.tenants.activeTenantName === name) {
      return;
    }

    this.tenantChange.next(name);
  }

  private mapToCollectionsInSwitcher(definedCollections: SiteCollection[] | undefined): CollectionInSwitcher[] {
    const mappedSiteCollections: CollectionInSwitcher[] = (definedCollections ?? []).map((collection) => {
      return {
        id: collection.id,
        name: collection.name,
        displayName: collection.displayName,
        sites: [],
      };
    });
    return mappedSiteCollections;
  }
}
