/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { parseSingleXmlTag } from 'app/shared/utils/utils';
import { ContentHubDamDALService, IframeMessageEventData } from './content-hub-dam-ext.dal.service';
import { parseAuthAndSiteData, parseContentDetailsResponse } from './content-hub-dam-provider.utils';

@Component({
  selector: 'app-content-hub-dam-provider',
  templateUrl: './content-hub-dam-provider.component.html',
  styleUrls: ['./content-hub-dam-provider.component.scss'],
})
export class ContentHubDamProviderComponent implements OnInit, OnDestroy {
  @Output() mediaSelect = new EventEmitter<MediaValue>();

  private iframeSelectEventListener!: (event: MessageEvent) => void;

  safeUrl: SafeResourceUrl | null = null;
  isInitialized = true;

  constructor(
    private readonly dalService: ContentHubDamDALService,
    private readonly domSanitizer: DomSanitizer,
  ) {}

  async ngOnInit() {
    try {
      // Need to assign onMessageReceived method to a variable to be able to re-use it in unmount method without binding 'this' again
      this.iframeSelectEventListener = (event) => this.onMessageReceived(event);
      window.addEventListener('message', this.iframeSelectEventListener, false);

      const [authenticationDetails, currentSiteId] = await Promise.all([
        this.dalService.getAuthenticationDetails(),
        this.dalService.getCurrentSiteId(),
      ]).catch(() => []);

      if (!authenticationDetails || !currentSiteId) {
        throw new Error('Cannot connect to CH instance');
      }

      const { baseUrl, url } = parseAuthAndSiteData(authenticationDetails, currentSiteId);

      if (!baseUrl || !url) {
        throw new Error('Cannot connect to CH instance');
      }

      this.safeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    } catch {
      this.isInitialized = false;
    }
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.iframeSelectEventListener, false);
  }

  private escapeSingleQuote(value: string) {
    // single quote in any field value breaks JSON parsing in XMC (ASP.NET particularity)
    return value.replace(/'/g, "\\'");
  }

  private async onMessageReceived(event: MessageEvent) {
    if (!event.data?.public_link) {
      return;
    }

    const fileTypePromise = this.getContentType(event);
    const embeddedHtmlPromise = this.dalService.getEmbeddedHtml(this.escapeSingleQuote(JSON.stringify(event.data)));
    const [fileType, embeddedHtml] = await Promise.all([fileTypePromise, embeddedHtmlPromise]);
    let attributes: Record<string, string | undefined> = {};

    const rawField = await this.dalService.getRawFieldWithMappedAttributes(fileType, {
      ...event.data,
      file_type: fileType,
    });

    if (fileType.toLowerCase() === 'image') {
      // only image tag supports attribute mapping
      const mappedAttributes = await this.dalService.mapDamPropsToXmcAttributes(
        fileType,
        this.escapeSingleQuote(
          JSON.stringify({
            ...event.data,
            file_type: fileType,
          }),
        ),
      );
      attributes = mappedAttributes ? parseSingleXmlTag(mappedAttributes) : {};
    } else {
      attributes = embeddedHtml ? parseSingleXmlTag(embeddedHtml) : {};
      attributes.src = attributes.href ?? attributes.src;
      delete attributes.href;
    }

    this.mediaSelect.next({
      rawValue: rawField ?? '',
      embeddedHtml: embeddedHtml ?? '',
      alt: attributes.alt,
      width: attributes.width ? parseInt(attributes.width, 10) : undefined,
      height: attributes.height ? parseInt(attributes.height, 10) : undefined,
      src: event.data.public_link,
      damExtraProperties: Object.entries(attributes).map(([name, value]) => ({ name, value: value ?? '' })),
      isDam: true,
    });
  }

  private async getContentType(event: MessageEvent) {
    const data: IframeMessageEventData = event.data;
    const getSelectionDetailsResponse = await this.dalService.getContentDetails(data.public_link + '&head=true');
    const { contentType } = parseContentDetailsResponse(getSelectionDetailsResponse);
    return contentType;
  }
}
