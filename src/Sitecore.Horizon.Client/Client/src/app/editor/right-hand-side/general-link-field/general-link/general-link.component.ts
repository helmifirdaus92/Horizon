/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { GeneralLinkValue, Linktype } from '../general-link.type';

export const DAM_SEARCHPAGE_VARIABLE_NAME = 'Sitecore_ConnectionStrings_DAM_dot_SearchPage';

@Component({
  selector: 'app-general-link',
  templateUrl: './general-link.component.html',
  styleUrls: ['./general-link.component.scss'],
})
export class GeneralLinkComponent implements OnChanges {
  @Input() value: GeneralLinkValue | null = null;
  @Output() valueChange = new EventEmitter<GeneralLinkValue | null>();
  @Input() size?: 'sm' | 'lg';

  linkType: Linktype = 'internal';

  isDamLink = false;
  isLoading = false;

  get currentValue(): GeneralLinkValue | null {
    // If the value doesn't correspond with the selected link type
    // then act as if current value was empty.
    // But if the value link type is external and is a DAM external link returns the value
    // so can be read by media link component

    if (this.value && this.value.linktype === this.linkType) {
      return this.value;
    } else if (this.value && this.value.linktype === 'external' && this.isDamLink) {
      return this.value;
    }

    return null;
  }

  constructor() {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.value && this.value) {
      this.linkType = this.value.linktype;
    }
  }

  emitValue(newValue: GeneralLinkValue | null) {
    this.value = newValue;
    this.valueChange.emit(newValue);
  }

  selectedValueChange(value: string) {
    this.linkType = value as Linktype;
  }
}
