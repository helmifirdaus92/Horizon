/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { MediaDialogService } from 'app/shared/dialogs/media-dialog/media-dialog.service';
import { MediaDalService } from 'app/shared/platform-media/media.dal.service';
import { isEqualObject } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import { ContentItem, ExternalGeneralLink, GeneralLinkValue, MediaGeneralLink } from '../../general-link.type';
import { ExternalLinkDraft } from '../external-link/external-link.component';

export interface MediaRawValue {
  mediaId: string;
  alt: string;
  src: string;
  width: number;
  height: number;
  contentType: 'Image' | 'Video' | 'Other';
  isContentHub: boolean;
}

export const CONTENT_HUB_PREFIX = 'stylelabs';

class MediaLinkDraft {
  // classAttribute is not editable in UI, but it is required to preserve existing value
  constructor(
    public item: ContentItem,
    public openInNewWindow: boolean,
    public text: string,
    public title: string,
    public classAttribute?: string,
  ) {}

  static fromMediaLink(link: MediaGeneralLink | null): MediaLinkDraft {
    return new MediaLinkDraft(
      link?.item ?? { id: '', displayName: '', url: '' },
      link?.target === '_blank',
      link?.text ?? '',
      link?.title ?? '',
      link?.class,
    );
  }

  static empty(): MediaLinkDraft {
    return MediaLinkDraft.fromMediaLink(null);
  }

  public toMediaLink(): MediaGeneralLink | null {
    if (this.isEmptyValue()) {
      return null;
    }

    return {
      linktype: 'media',
      item: this.item,
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
      !this.classAttribute &&
      !this.text &&
      !this.title &&
      this.openInNewWindow === false
    );
  }
}

function isSameLink(
  left: MediaGeneralLink | ExternalGeneralLink | null,
  right: MediaGeneralLink | ExternalGeneralLink | null,
): boolean {
  if (left === right) {
    return true;
  }

  if (left === null || right === null) {
    return false;
  }

  if (right?.linktype === 'media' && left?.linktype === 'media') {
    return (
      isEqualObject(left.item, right.item) &&
      left.target === right.target &&
      left.class === right.class &&
      left.text === right.text &&
      left.title === right.title
    );
  }

  return false;
}

function typeGuard(value: GeneralLinkValue): value is MediaGeneralLink {
  return value.linktype === 'media';
}

@Component({
  selector: 'app-media-link',
  templateUrl: './media-link.component.html',
  styleUrls: ['./media-link.component.scss'],
})
export class MediaLinkComponent implements OnDestroy {
  private _link: MediaGeneralLink | ExternalGeneralLink | null = null;
  draftLink: MediaLinkDraft = MediaLinkDraft.empty();

  @Input() set value(value: GeneralLinkValue | null) {
    if (value && !typeGuard(value)) {
      return;
    }

    this._link = value;

    this.draftLink = MediaLinkDraft.fromMediaLink(value);

    if (this.draftLink.item && this.draftLink.item.id) {
      this.getMediaItemDetails(this.draftLink.item.id).then((itemDetails) => {
        this.path = itemDetails?.path ?? '';

        // Canvas updates the item information such as displayName and url from HTML element's text which is
        // no longer valid after changing text field, so it needs to be updated with valid value from beginning
        if (itemDetails) {
          this.draftLink.item.displayName = itemDetails.displayName;
          this.draftLink.item.url = itemDetails.url;
        }
      });
    } else if (this.draftLink.item.url) {
      this.path = this.draftLink.item.url;
    } else {
      this.path = '';
    }
  }

  @Input() size: 'sm' | 'lg' = 'lg';

  path = '';

  @Output() valueChange = new EventEmitter<GeneralLinkValue | null>();
  @ViewChild('container', { static: false }) container!: ElementRef;

  constructor(
    private readonly mediaDialogService: MediaDialogService,
    private readonly context: ContextService,
    private readonly mediaService: MediaDalService,
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
    const newValue = this.draftLink.toMediaLink();

    if (isSameLink(this._link, newValue)) {
      return;
    }

    this._link = newValue;
    this.valueChange.emit(this._link);
  }

  async selectItemPathFromDialog() {
    const dialogResult = await firstValueFrom(
      this.mediaDialogService.show({
        currentValue: {
          rawValue: `<image mediaid="${this.draftLink.item.id}" />`,
          embeddedHtml: '',
          alt: this.draftLink.title,
          mediaId: this.draftLink.item.id,
          src: this.draftLink.item.url,
        },
        sources: [],
        mediaTypes: ['image', 'file'],
      }),
    ).catch(() => undefined);

    if (!dialogResult) {
      return;
    }

    if (dialogResult.isDam) {
      let text: string | undefined = undefined;
      if (dialogResult.embeddedHtml) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(dialogResult.embeddedHtml, 'text/html');
        text = doc.body.textContent || '';
      }
      const newExternalLink = ExternalLinkDraft.fromExternalLink({
        linktype: 'external',
        url: dialogResult.src ?? '',
        text,
      });

      if (dialogResult.damExtraProperties) {
        dialogResult.damExtraProperties.forEach((item) => {
          newExternalLink.value[item.name] = item.value;
        });
      }

      this.valueChange.next(newExternalLink.value);

      return;
    }

    const itemDetails = await this.getMediaItemDetails(dialogResult.mediaId ?? '');
    if (!itemDetails) {
      return;
    }

    this.path = itemDetails.url;
    this.draftLink.text ||= itemDetails.displayName;

    this.draftLink.item = {
      id: itemDetails.id,
      displayName: itemDetails.displayName,
      url: itemDetails.url,
    };

    this.saveCurrentValue();
  }

  private async getMediaItemDetails(
    id: string,
  ): Promise<{ id: string; displayName: string; url: string; path: string } | null> {
    try {
      const itemDetails = await firstValueFrom(
        this.mediaService.getMediaItem({
          path: id,
          language: this.context.language,
          site: this.context.siteName,
          sources: [],
        }),
      );

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
