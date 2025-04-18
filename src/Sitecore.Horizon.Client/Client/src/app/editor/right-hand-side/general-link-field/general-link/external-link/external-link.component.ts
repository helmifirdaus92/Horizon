/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ExternalGeneralLink, GeneralLinkValue } from 'app/editor/right-hand-side/general-link-field/general-link.type';
import { isEqualObject } from 'app/shared/utils/utils';

export class ExternalLinkDraft {
  // Using the whole object "value" to preserve non-editable properties
  constructor(public value: ExternalGeneralLink) {}

  static fromExternalLink(link: ExternalGeneralLink | null): ExternalLinkDraft {
    return new ExternalLinkDraft(link ?? { url: '', linktype: 'external' });
  }

  static empty(): ExternalLinkDraft {
    return ExternalLinkDraft.fromExternalLink(null);
  }

  toExternalLink(): ExternalGeneralLink | null {
    if (this.isEmptyValue()) {
      return null;
    }

    return this.value;
  }

  private isEmptyValue() {
    return !this.value.url && !this.value.class && !this.value.text && !this.value.title && !this.value.target;
  }
}

function isSameLink(left: ExternalGeneralLink | null, right: ExternalGeneralLink | null): boolean {
  if (left === right) {
    return true;
  }

  if (left === null || right === null) {
    return false;
  }

  return isEqualObject(removeEmptyFields(left), removeEmptyFields(right));
}

function removeEmptyFields(link: ExternalGeneralLink | null): ExternalGeneralLink | null {
  if (!link) {
    return link;
  }

  const result = { ...link };
  Object.keys(result).forEach((key) => {
    if (!result[key]) {
      delete result[key];
    }
  });

  return result;
}

function typeGuard(value: GeneralLinkValue): value is ExternalGeneralLink {
  return value.linktype === 'external';
}

@Component({
  selector: 'app-external-link',
  templateUrl: './external-link.component.html',
  styleUrls: ['./external-link.component.scss'],
})
export class ExternalLinkComponent implements OnDestroy {
  private _link: ExternalGeneralLink | null = null;
  draftLink = ExternalLinkDraft.empty();

  @Input() set value(value: GeneralLinkValue | null) {
    // We expect that value here is always External link because it's filtered in the parent template.
    // The guard check here is for lint validation.
    if (value && !typeGuard(value)) {
      return;
    }

    this._link = value ? { ...value } : value;
    this.draftLink = ExternalLinkDraft.fromExternalLink(value);
  }

  @Input() size: 'sm' | 'lg' = 'lg';

  @Output() valueChange = new EventEmitter<ExternalGeneralLink | null>();
  @ViewChild('container', { static: false }) container!: ElementRef;

  ngOnDestroy() {
    this.saveValue();
  }

  onFocusOut(event: FocusEvent) {
    // Check if the newly focused element is outside the inputs container
    if (!this.container.nativeElement.contains(event.relatedTarget)) {
      this.saveValue();
    }
  }

  private saveValue(): void {
    const newValue = this.draftLink.toExternalLink();

    if (isSameLink(this._link, newValue)) {
      return;
    }

    this._link = newValue;

    this.valueChange.emit(this._link);
  }
}
