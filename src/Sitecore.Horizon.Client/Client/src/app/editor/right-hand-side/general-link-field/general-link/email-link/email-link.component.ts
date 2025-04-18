/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputLabelModule } from '@sitecore/ng-spd-lib';
import { GeneralLinkValue, MailGeneralLink } from '../../general-link.type';

export class EmailLinkDraft {
  // Using the whole object "value" to preserve non-editable properties
  constructor(public value: MailGeneralLink) {}

  static fromEmailLink(link: MailGeneralLink | null): EmailLinkDraft {
    return new EmailLinkDraft(link ?? { url: '', linktype: 'mailto' });
  }

  static empty(): EmailLinkDraft {
    return EmailLinkDraft.fromEmailLink(null);
  }

  toEmailLink(): MailGeneralLink | null {
    if (this.isEmptyValue()) {
      return null;
    }

    return this.value;
  }

  private isEmptyValue() {
    return !this.value.url && !this.value.class && !this.value.text && !this.value.title;
  }
}

function isSameLink(left: MailGeneralLink | null, right: MailGeneralLink | null): boolean {
  if (left === right) {
    return true;
  }

  if (left === null || right === null) {
    return false;
  }

  return left.url === right.url && left.text === right.text;
}

function typeGuard(value: GeneralLinkValue): value is MailGeneralLink {
  return value.linktype === 'mailto';
}

@Component({
  selector: 'app-email-link',
  templateUrl: './email-link.component.html',
  styleUrls: ['./email-link.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, InputLabelModule],
})
export class EmailLinkComponent {
  private _link: MailGeneralLink | null = null;
  draftLink = EmailLinkDraft.empty();
  isFormInValid?: boolean;

  @Input() set value(value: GeneralLinkValue | null) {
    // We expect that value here is always email link because it's filtered in the parent template.
    // The guard check here is for lint validation.
    if (value && !typeGuard(value)) {
      return;
    }

    this._link = value ? { ...value } : value;
    this.draftLink = EmailLinkDraft.fromEmailLink(value);
  }

  @Input() size: 'sm' | 'lg' = 'lg';

  @Output() valueChange = new EventEmitter<MailGeneralLink | null>();
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
    const newValue = this.draftLink.toEmailLink();

    if (isSameLink(this._link, newValue)) {
      return;
    }

    this._link = newValue;

    this.valueChange.emit(this._link);
  }
}
