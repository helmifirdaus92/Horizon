/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { RteLink } from './rich-text-editor.types';

class RteLinkDraft {
  static fromRteLink(link: RteLink | null): RteLinkDraft {
    return new RteLinkDraft(link?.url ?? '', link?.title ?? '', link?.target ?? null);
  }

  static empty(): RteLinkDraft {
    return RteLinkDraft.fromRteLink(null);
  }

  constructor(
    public url: string | '',
    public title: string | '',
    public target: string | null,
  ) {}

  public toRteLink(): RteLink | null {
    if (this.url === '') {
      return null;
    }

    return {
      url: this.url,
      target: this.target,
      title: this.title || null,
    };
  }
}

function isSameLink(left: RteLink | null, right: RteLink | null): boolean {
  if (left === right) {
    return true;
  }

  if (left === null || right === null) {
    return false;
  }

  return left.url === right.url && left.target === right.target && left.title === right.title;
}

@Component({
  selector: 'app-rich-text-link',
  templateUrl: './rich-text-link.component.html',
  styleUrls: ['./rich-text-link.component.scss'],
})
export class RichTextLinkComponent implements OnDestroy {
  private _link: RteLink | null = null;
  draftLink = RteLinkDraft.empty();

  @Input() set link(value: RteLink | null) {
    this._link = value;
    this.draftLink = RteLinkDraft.fromRteLink(value);
  }
  @Output() readonly linkChange = new EventEmitter<RteLink | null>();

  @HostListener('focusout', ['$event'])
  onFocuseOut(event: FocusEvent) {
    // When we save any link changes focus jumps from the link editor(RHS) to canvas.
    // It might confuse users when they switch between inputs.
    //
    // Example: user switches from the "Url" to the "Title" input, so that focus jumps to canvas instead of standing on the "Title" input.
    //
    // To fix this issue we save all changes only when editing fully is done and focus is out of the link editor.
    if (
      !!event.currentTarget &&
      !!event.relatedTarget &&
      (event.currentTarget as Node).contains(event.relatedTarget as Node)
    ) {
      return;
    }

    this.commitLinkChange();
  }

  ngOnDestroy(): void {
    this.commitLinkChange();
  }

  removeLink() {
    this.draftLink = RteLinkDraft.empty();
    this.commitLinkChange();
  }

  visitLink() {
    if (this.draftLink.url) {
      window.open(this.draftLink.url);
    }
  }

  private commitLinkChange(): void {
    const newValue = this.draftLink.toRteLink();

    if (isSameLink(this._link, newValue)) {
      return;
    }

    this._link = newValue;
    this.linkChange.emit(newValue);
  }
}
