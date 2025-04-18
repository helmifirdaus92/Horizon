/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import {
  ExternalGeneralLink,
  GeneralLinkValue,
  InternalGeneralLink,
  MailGeneralLink,
  MediaGeneralLink,
} from './general-link.type';
import { ExternalLinkComponent } from './general-link/external-link/external-link.component';
import { InternalLinkComponent } from './general-link/internal-link/internal-link.component';
import { MediaLinkComponent } from './general-link/media-link/media-link.component';

export const externalLink: ExternalGeneralLink = {
  url: 'linkUrl',
  text: 'text',
  title: 'title',
  class: 'className',
  linktype: 'external',
};

export const internalLink: InternalGeneralLink = {
  text: 'text',
  title: 'title',
  class: 'className',
  linktype: 'internal',
  item: {
    id: 'id',
    displayName: 'name',
    url: '/some/path',
  },
};

export const mediaLink: MediaGeneralLink = {
  text: 'text',
  title: 'title',
  class: 'className',
  linktype: 'media',
  item: {
    id: 'id',
    displayName: 'name',
    url: '/some/path',
  },
};

export const mailLink: MailGeneralLink = {
  linktype: 'mailto',
  url: 'example@gmail.com',
  text: 'text',
};

@Component({
  selector: 'app-external-link',
  template: 'empty',
  providers: [{ provide: ExternalLinkComponent, useExisting: ExternalLinkTestingComponent }],
})
export class ExternalLinkTestingComponent {
  @Input() value?: ExternalGeneralLink;
  @Input() size: any;
  @Output() valueChange = new EventEmitter<ExternalGeneralLink>();
}

@Component({
  selector: 'app-internal-link',
  template: 'empty',
  providers: [{ provide: InternalLinkComponent, useExisting: InternalLinkTestingComponent }],
})
export class InternalLinkTestingComponent {
  @Input() value?: InternalGeneralLink;
  @Input() size: any;
  @Output() valueChange = new EventEmitter<GeneralLinkValue>();
}

@Component({
  selector: 'app-media-link',
  template: 'empty',
  providers: [{ provide: MediaLinkComponent, useExisting: MediaLinkTestingComponent }],
})
export class MediaLinkTestingComponent {
  @Input() value?: GeneralLinkValue;
  @Input() size: any;
  @Output() valueChange = new EventEmitter<GeneralLinkValue>();
}

@NgModule({
  declarations: [InternalLinkTestingComponent, MediaLinkTestingComponent, ExternalLinkTestingComponent],
  exports: [InternalLinkTestingComponent, MediaLinkTestingComponent, ExternalLinkTestingComponent], // Make available for tests
})
export class TestGeneralLinkModule {}
