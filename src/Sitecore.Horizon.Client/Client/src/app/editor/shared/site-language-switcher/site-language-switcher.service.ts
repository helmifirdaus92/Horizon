/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { ContextValidator } from 'app/shared/client-state/context-validator';
import { ContextService } from 'app/shared/client-state/context.service';
import { EMPTY, Observable } from 'rxjs';

export interface Language {
  name: string | null;
  displayName: string;
  nativeName: string | null;
  iso: string | null;
  englishName: string | null;
}

export interface SiteInSwitcher {
  name: string | null;
  displayName: string | null;
  supportedLanguages: string[];
  collectionId?: string;
}

@Injectable({ providedIn: 'root' })
export class SiteSwitcherService {
  /**
   * Emits the selected site.
   */
  site: Observable<string>;

  constructor(
    private readonly context: ContextService,
    private readonly contextValidator: ContextValidator,
  ) {
    this.site = this.context.siteName$;
  }

  /**
   * Select a site.
   */
  async selectSite(siteName: string) {
    // A new site selection needs to be validated because the current language may not be compatible with the new site.
    // We also need to reset the selected item for items are site specific.
    const validCtx = await this.contextValidator.getValidContext({
      siteName,
      language: this.context.language,
      itemId: '',
    });
    this.context.updateContext(validCtx.context);
  }
}

@Injectable({ providedIn: 'root' })
export class LanguageSwitcherService {
  /**
   * Emits the selected language name.
   */
  language: Observable<string> = EMPTY;

  constructor(private readonly context: ContextService) {
    this.language = this.context.language$;
  }

  /**
   * Select a language.
   */
  selectLanguage(languageName: string) {
    this.context.updateContext({ language: languageName });
  }
}
