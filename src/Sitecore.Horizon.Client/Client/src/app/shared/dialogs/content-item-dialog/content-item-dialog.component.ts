/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { SiteInSwitcher } from 'app/editor/shared/site-language-switcher/site-language-switcher.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { Language, SiteCollection, SiteService } from 'app/shared/site-language/site-language.service';
import { BehaviorSubject, EMPTY, Observable, firstValueFrom } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ContentItemDialogResult } from './content-item-dialog.service';

@Component({
  selector: 'app-content-item-dialog',
  templateUrl: './content-item-dialog.component.html',
  styleUrls: ['./content-item-dialog.component.scss'],
})
export class ContentItemDialogComponent implements OnInit {
  private readonly inputSite$ = new BehaviorSubject<string | null>(null);
  private readonly selectedSite$ = new BehaviorSubject<string | null>(null);
  private _site: string | null = null;

  private initialItemSelection: { id: string | null; language: string | null } | null = {
    id: null,
    language: null,
  };
  private _selection: { id: string | null; language: string | null; site: string | null } = {
    id: null,
    language: null,
    site: null,
  };

  readonly onSelect = new EventEmitter<ContentItemDialogResult>();

  get site(): string | null {
    return this._site;
  }

  get selection() {
    return this._selection;
  }
  set selection(value) {
    this._selection = value;

    this._site = value.site;
    this.selectedSite$.next(this._site);
    this.inputSite$.next(this._site);
  }

  showLanguageSelector = true;
  showPagesOnly = false;

  contextSite: SiteInSwitcher = { name: '', displayName: '', supportedLanguages: [] };
  contextLanguage: Language = {
    name: null,
    displayName: '',
    nativeName: null,
    iso: null,
    englishName: null,
  };

  get submitDisabled() {
    return !this.isSelectedItemBelongsToSelectedSite() || this.isInitialItemSelected();
  }

  sites$: Observable<{ definedSites: SiteInSwitcher[]; activeSite: SiteInSwitcher; collections: SiteCollection[] }> =
    EMPTY;
  languages$: Observable<{ definedLanguages: Language[]; activeLanguage: Language }> = EMPTY;

  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly siteService: SiteService,
    private readonly translateService: TranslateService,
    private readonly itemDalService: BaseItemDalService,
    private readonly contextService: ContextService,
  ) {
    this.sites$ = this.inputSite$.pipe(
      switchMap(() =>
        this.translateService.get('SITE_LANGUAGE.CONTEXT_SITE').pipe(
          map((name: string) => {
            this.contextSite.name = name;
            this.contextSite.displayName = name;
            return [this.contextSite, ...this.siteService.getSites()];
          }),
          map((definedSites) => ({
            definedSites,
            activeSite: definedSites.find((s) => s.name === this._site) ?? this.contextSite,
            collections: [],
          })),
        ),
      ),
    );

    this.languages$ = this.selectedSite$.pipe(
      switchMap((selectedSite) => {
        const siteSupportedLanguages = this.siteService.getSiteLanguages(selectedSite ?? this.contextService.siteName);
        return this.translateService.get('SITE_LANGUAGE.CONTEXT_LANGUAGE').pipe(
          map((displayName: string) => {
            this.contextLanguage.nativeName = displayName;
            const definedLanguages = [this.contextLanguage, ...siteSupportedLanguages];
            return {
              definedLanguages,
              activeLanguage: definedLanguages.find((l) => l.name === this.selection.language) ?? this.contextLanguage,
            };
          }),
        );
      }),
    );
  }

  ngOnInit() {
    this.initialItemSelection = { id: this.selection.id, language: this.selection.language };
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  close() {
    this.onSelect.complete();
    this.closeHandle.close();
  }

  async submit() {
    if (!this.selection.id) {
      return;
    }
    const itemDetails = await this.getItemDetails(this.selection.id, this.selection.site);
    if (!itemDetails) {
      throw Error('Content item dialog - can not get item details');
    }

    this.onSelect.next({
      id: this.selection.id,
      path: itemDetails.path,
      language: this.selection.language,
      site: this.selection.site,
      url: itemDetails.url,
      displayName: itemDetails.displayName,
    });
    this.onSelect.complete();
    this.closeHandle.close();
  }

  onItemChange(id: string) {
    this.selection.id = id;
    this.selection.site = this.site;
  }

  onLanguageChange(languageName: string | null) {
    this.selection.language = languageName === this.contextLanguage.name ? null : languageName;
  }

  onSiteChange(siteName: string | null) {
    this._site = siteName === this.contextSite.name ? null : siteName;
    this.selectedSite$.next(this._site);
  }

  private isSelectedItemBelongsToSelectedSite(): boolean {
    return !!this.selection.id && this.selection.site === this.site;
  }

  private isInitialItemSelected(): boolean {
    return (
      this.initialItemSelection?.id === this.selection.id &&
      this.initialItemSelection?.language === this.selection.language
    );
  }

  private async getItemDetails(
    id: string,
    siteName: string | null,
  ): Promise<{ displayName: string; url: string; path: string } | null> {
    // There's an issue that platform cannot render internal links with a display name different to context language.
    // To be consistent with the platform we won't show language specific display names
    siteName = await firstValueFrom(this.siteService.getValidSiteName(siteName));
    try {
      const itemDetails = await firstValueFrom(
        this.itemDalService.getRawItem(id, this.contextService.language, siteName),
      );

      return {
        displayName: itemDetails.displayName,
        url: itemDetails.url,
        path: itemDetails.path,
      };
    } catch {
      return null;
    }
  }
}
