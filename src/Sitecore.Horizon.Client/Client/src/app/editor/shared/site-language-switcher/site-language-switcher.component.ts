/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { LanguageService, SiteCollection, SiteService } from 'app/shared/site-language/site-language.service';
import { EMPTY, Observable, combineLatest, map } from 'rxjs';
import { TenantSwitcherInput } from './site-language-dropdowns/site-language-dropdowns.component';
import {
  Language,
  LanguageSwitcherService,
  SiteInSwitcher,
  SiteSwitcherService,
} from './site-language-switcher.service';

@Component({
  selector: 'app-site-language-switcher',
  styleUrls: ['./site-language-switcher.component.scss'],
  template: `
    <app-site-language-dropdowns
      [sites]="sites$ | async"
      [languages]="languages$ | async"
      [tenants]="getTenants()"
      (siteChange)="onSiteSelectionChange($event)"
      (languageChange)="onLanguageSelectionChange($event)"
      (tenantChange)="onTenantSelectionChange($event)"
    ></app-site-language-dropdowns>
  `,
})
export class SiteLanguageSwitcherComponent {
  sites$: Observable<{ definedSites: SiteInSwitcher[]; activeSite: SiteInSwitcher; collections: SiteCollection[] }> =
    EMPTY;
  languages$: Observable<{ definedLanguages: Language[]; activeLanguage: Language }> = EMPTY;

  tenants = ConfigurationService.tenants;
  constructor(
    private readonly siteSwitcherService: SiteSwitcherService,
    private readonly languageSwitcherService: LanguageSwitcherService,
    private readonly siteService: SiteService,
    private readonly languageService: LanguageService,
    private readonly authenticationService: AuthenticationService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {
    // Sites
    this.sites$ = this.siteSwitcherService.site.pipe(
      map((activeSite) => ({
        definedSites: this.siteService.getSites(),
        collections: this.siteService.getSiteCollections(),
        activeSite: this.siteService
          .getSites()
          .find((s) => s.name.toLocaleLowerCase() === activeSite.toLocaleLowerCase()) ?? {
          name: activeSite,
          displayName: activeSite,
          supportedLanguages: [],
          collectionId: activeSite,
        },
      })),
    );

    // Languages
    this.languages$ = combineLatest([
      this.languageService.getLanguages(),
      this.languageSwitcherService.language,
      this.siteSwitcherService.site,
    ]).pipe(
      map(([definedLanguages, activeLanguageName, activeSite]) => {
        return {
          definedLanguages: this.siteService.getSiteLanguages(activeSite),
          activeLanguage: definedLanguages.find((l) => l.name === activeLanguageName) ?? {
            name: activeLanguageName,
            displayName: activeLanguageName,
            nativeName: null,
            iso: null,
            englishName: null,
          },
        };
      }),
    );
  }

  onSiteSelectionChange(selection: string | null) {
    if (!selection) {
      return;
    }

    this.siteSwitcherService.selectSite(selection);
  }

  onLanguageSelectionChange(selection: string | null) {
    if (!selection) {
      return;
    }

    this.languageSwitcherService.selectLanguage(selection);
  }

  onTenantSelectionChange(tenantName: string | null) {
    if (!tenantName) {
      return;
    }

    this.authenticationService.changeAuthParams({
      organization: null,
      tenantName,
    });
  }

  getTenants(): TenantSwitcherInput | null {
    const isEnabledAndValid =
      this.featureFlagsService.isFeatureEnabled('pages_pocket-navigation') &&
      !!ConfigurationService.tenantName &&
      !!ConfigurationService.organization &&
      !!ConfigurationService.tenants;

    if (!isEnabledAndValid) {
      return null;
    }

    return ConfigurationService.tenants && ConfigurationService.tenantName
      ? { definedTenants: ConfigurationService.tenants, activeTenantName: ConfigurationService.tenantName }
      : null;
  }
}
