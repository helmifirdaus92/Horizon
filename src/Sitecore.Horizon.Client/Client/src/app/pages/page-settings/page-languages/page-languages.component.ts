/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Context } from 'app/shared/client-state/context.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { firstValueFrom } from 'rxjs';

interface ItemVersion {
  language: string | null;
  versions: Item[];
}

@Component({
  selector: 'app-page-languages',
  templateUrl: './page-languages.component.html',
  styleUrls: ['page-languages.component.scss'],
})
export class PageLanguagesComponent {
  @Input() context?: Context;
  @Input() isAccordionOpen = false;
  @Output() accordionOpenChange = new EventEmitter<boolean>();

  itemLanguageVersions: ItemVersion[] = [];

  constructor(
    private readonly itemDalService: BaseItemDalService,
    private readonly siteService: SiteService,
  ) {}

  async getItemLangaugeVersions(isOpen: boolean): Promise<void> {
    if (this.context && this.isAccordionOpen) {
      const definedLanguages = this.siteService.getSiteLanguages(this.context.siteName);
      const result = definedLanguages.map(async (language) => {
        const getItemVersions$ = this.itemDalService.getItemVersions(
          this.context?.itemId || '',
          language.name,
          this.context?.siteName || '',
          this.context?.itemVersion,
        );
        const itemLanguageVersions = await firstValueFrom(getItemVersions$);
        return { ...itemLanguageVersions, language: language.englishName };
      });
      const resolveItemLanguageVersions = await Promise.all(result);
      this.itemLanguageVersions = resolveItemLanguageVersions;
    } else {
      this.itemLanguageVersions = [];
    }
    this.accordionOpenChange.emit(isOpen);
  }
}
