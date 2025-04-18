/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { ContentItemDialogService } from 'app/shared/dialogs/content-item-dialog/content-item-dialog.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import {
  getSearchParams,
  parseParameterFromQueryString,
  setParameterIntoQueryString,
} from 'app/shared/utils/url.utils';
import { isEqualObject } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import { ContentItem, GeneralLinkValue, InternalGeneralLink } from '../../general-link.type';

class InternalLinkDraft {
  // classAttribute is not editable in UI, but it is required to preserve existing value
  constructor(
    public item: ContentItem,
    public anchor: string,
    public openInNewWindow: boolean,
    public text: string,
    public title: string,
    public querystring: string,
    private classAttribute?: string,
  ) {}

  static fromInternalLink(link: InternalGeneralLink | null): InternalLinkDraft {
    return new InternalLinkDraft(
      link?.item ?? { id: '', displayName: '', url: '' },
      link?.anchor ?? '',
      link?.target === '_blank',
      link?.text ?? '',
      link?.title ?? '',
      link?.querystring ?? '',
      link?.class,
    );
  }

  static empty(): InternalLinkDraft {
    return InternalLinkDraft.fromInternalLink(null);
  }

  public toInternalLink(): InternalGeneralLink | null {
    if (this.isEmptyValue()) {
      return null;
    }
    return {
      linktype: 'internal',
      item: this.item,
      querystring: this.querystring || undefined,
      anchor: this.anchor || undefined,
      target: this.openInNewWindow ? '_blank' : undefined,
      text: this.text || undefined,
      title: this.title || undefined,
      class: this.classAttribute,
    };
  }

  private isEmptyValue() {
    return (
      !this.item.id &&
      !this.item.url &&
      !this.item.displayName &&
      !this.querystring &&
      !this.anchor &&
      !this.classAttribute &&
      !this.text &&
      !this.title &&
      this.openInNewWindow === false
    );
  }
}

function isSameLink(left: InternalGeneralLink | null, right: InternalGeneralLink | null): boolean {
  if (left === right) {
    return true;
  }

  if (left === null || right === null) {
    return false;
  }

  return (
    isEqualObject(left.item, right.item) &&
    left.querystring === right.querystring &&
    left.anchor === right.anchor &&
    left.target === right.target &&
    left.class === right.class &&
    left.text === right.text &&
    left.title === right.title
  );
}

function typeGuard(value: GeneralLinkValue): value is InternalGeneralLink {
  return value.linktype === 'internal';
}

@Component({
  selector: 'app-internal-link',
  templateUrl: './internal-link.component.html',
  styleUrls: ['./internal-link.component.scss'],
})
export class InternalLinkComponent implements OnDestroy {
  private _link: InternalGeneralLink | null = null;
  draftLink = InternalLinkDraft.empty();

  @Input() set value(value: GeneralLinkValue | null) {
    // We expect that value here is always Internal link because it's filtered in the parent template.
    // The guard check here is for lint validation.
    if (value && !typeGuard(value)) {
      return;
    }

    if (isSameLink(this._link, value)) {
      return;
    }

    this._link = value;
    this.draftLink = InternalLinkDraft.fromInternalLink(value);

    if (this.draftLink.item && this.draftLink.item.id) {
      const site = parseParameterFromQueryString(this.draftLink.querystring, 'sc_site');
      this.getItemDetails(this.draftLink.item.id, site).then((itemDetails) => {
        this.path = itemDetails?.path ?? '';

        // Canvas updates the item information such as displayName and url from HTML element's text which is
        // no longer valid after changing text field, so it needs to be updated with valid value from beginning
        if (itemDetails) {
          this.draftLink.item.displayName = itemDetails.displayName;
          this.draftLink.item.url = itemDetails.url;
        }
      });
    } else {
      this.path = '';
    }
  }

  @Input() size: 'sm' | 'lg' = 'lg';

  path = '';

  @Output() valueChange = new EventEmitter<InternalGeneralLink | null>();
  @ViewChild('container', { static: false }) container!: ElementRef;

  constructor(
    private readonly contentItemDialogService: ContentItemDialogService,
    private readonly context: ContextService,
    private readonly itemDalService: BaseItemDalService,
    private readonly siteService: SiteService,
  ) {}

  ngOnDestroy() {
    this.saveCurrentValue();
  }

  checkPathLength(value?: string): boolean {
    return (value ?? '').length > 36;
  }

  onFocusOut(event: FocusEvent) {
    // Check if the newly focused element is outside the inputs container
    if (!this.container.nativeElement.contains(event.relatedTarget)) {
      this.saveCurrentValue();
    }
  }

  private saveCurrentValue(): void {
    const newValue = this.draftLink.toInternalLink();
    if (isSameLink(this._link, newValue)) {
      return;
    }

    this._link = newValue;
    this.valueChange.emit(this._link);
  }

  async selectPagePathFromDialog() {
    // Retrieve the 'sc_site' parameter by first checking the query string; if not present, look for it in the item URL.
    // Note: SXA sites item URLs are generated with 'sc_site' already present while others without.
    const site =
      parseParameterFromQueryString(this.draftLink.querystring, 'sc_site') ||
      getSearchParams(this.draftLink.item?.url)?.get('sc_site');

    const dialogResult = await firstValueFrom(
      this.contentItemDialogService.show({
        id: this.draftLink.item?.id ?? null,
        language: parseParameterFromQueryString(this.draftLink.querystring, 'sc_lang'),
        site,
        showPagesOnly: true,
      }),
    ).catch(() => undefined);

    if (!dialogResult) {
      return;
    }

    this.path = dialogResult.path;

    this.draftLink.item = {
      id: dialogResult.id,
      displayName: dialogResult.displayName,
      url: dialogResult.url,
    };

    this.draftLink.querystring = setParameterIntoQueryString(
      this.draftLink.querystring,
      'sc_lang',
      dialogResult.language,
    );

    // If 'sc_site' parameter exists in the item URL, we avoid adding it to the query string and reset it(normally for SXA sites)
    // It is to prevent duplicate 'sc_site' parameters in the generated link.
    const siteParamInItemUrl = getSearchParams(dialogResult.url)?.get('sc_site');
    this.draftLink.querystring = setParameterIntoQueryString(
      this.draftLink.querystring,
      'sc_site',
      !siteParamInItemUrl ? dialogResult.site : null,
    );

    this.saveCurrentValue();
  }

  private async getItemDetails(
    id: string,
    siteName: string | null,
  ): Promise<{ id: string; displayName: string; url: string; path: string } | null> {
    // There's an issue that platform cannot render internal links with a display name different to context language.
    // To be consistent with the platform we won't show language specific display names
    siteName = await firstValueFrom(this.siteService.getValidSiteName(siteName));
    try {
      const itemDetails = await firstValueFrom(this.itemDalService.getRawItem(id, this.context.language, siteName));

      return {
        id,
        displayName: itemDetails.displayName,
        url: itemDetails.url,
        path: itemDetails.path,
      };
    } catch {
      return null;
    }
  }
}
