/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GeneralLinkValue, Linktype } from 'app/editor/right-hand-side/general-link-field/general-link.type';
import { buildGeneralLinkRawValue, LinkFieldValue, parseGeneralLinkRawValue } from './general-link.utils';

@Component({
  selector: 'app-general-link-field',
  templateUrl: './general-link-field.component.html',
  styleUrls: ['./general-link-field.component.scss'],
})
export class GeneralLinkFieldComponent {
  private _generalLinkValue: GeneralLinkValue | null = null;

  @Input({ required: true }) set rawValue(value: string) {
    this._generalLinkValue = parseGeneralLinkRawValue(value);
    if (this._generalLinkValue) {
      this.linkType = this._generalLinkValue.linktype;
    }
  }

  @Input() size: 'sm' | 'lg' = 'lg';

  @Output() valueChange = new EventEmitter<LinkFieldValue>();

  linkType: Linktype = 'internal';

  get generalLinkValue(): GeneralLinkValue | null {
    return this._generalLinkValue;
  }

  emitValue(link: GeneralLinkValue | null) {
    const generalLinkRawValue = buildGeneralLinkRawValue(link);
    const linkValue = { rawValue: generalLinkRawValue, model: link };
    this.valueChange.emit(linkValue);
  }

  selectedValueChange(value: string) {
    this.linkType = value as Linktype;
  }
}
