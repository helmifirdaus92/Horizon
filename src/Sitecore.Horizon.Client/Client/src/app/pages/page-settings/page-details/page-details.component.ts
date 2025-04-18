/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Context, ContextService } from 'app/shared/client-state/context.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { Item } from 'app/shared/graphql/item.interface';
import { getExplorerAppUrl } from 'app/shared/utils/utils';

const MIN_DATE_TIME = '0001-01-01T00:00:00Z';

interface ItemVersion {
  language: string | null;
  versions: Item[];
}
interface ItemDetails {
  createdBy: string;
  creationDate: string;
  activeVersion: Item | undefined;
}
@Component({
  selector: 'app-page-details',
  templateUrl: './page-details.component.html',
  styleUrls: ['page-details.component.scss'],
})
export class PageDetailsComponent {
  @Input() context?: Context;
  @Input() isAccordionOpen = false;
  @Output() accordionOpenChange = new EventEmitter<boolean>();

  itemDetails?: ItemDetails;
  itemLanguageVersions: ItemVersion[] = [];

  // Backend returns DateTime min value when created by value is not set yet
  readonly minDateTime = MIN_DATE_TIME;

  get explorerUrl(): SafeUrl {
    const baseUrl = this.staticConfigurationService.explorerAppBaseUrl;
    return this.domSanitizer.bypassSecurityTrustUrl(
      getExplorerAppUrl(
        baseUrl,
        this.contextService.siteName,
        this.contextService.language,
        this.contextService.itemId,
      ),
    );
  }

  constructor(
    private readonly contextService: ContextService,
    private readonly domSanitizer: DomSanitizer,
    private readonly staticConfigurationService: StaticConfigurationService,
  ) {}

  async getDetails(isOpen: boolean): Promise<void> {
    if (this.context && this.isAccordionOpen) {
      const { itemVersion } = this.context;
      const item = await this.contextService.getItem(true);

      this.itemDetails = {
        createdBy: item.createdBy,
        creationDate: item.creationDate,
        activeVersion: item.versions?.find((v) => v.version === itemVersion),
      };
    } else {
      this.itemDetails = undefined;
    }
    this.accordionOpenChange.emit(isOpen);
  }
}
