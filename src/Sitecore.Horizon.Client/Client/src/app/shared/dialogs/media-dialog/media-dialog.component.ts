/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener, OnInit } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { MediaType } from './media-dialog.service';

@Component({
  selector: 'app-media-dialog',
  templateUrl: './media-dialog.component.html',
  styleUrls: ['./media-dialog.component.scss'],
})
export class MediaDialogComponent implements OnInit {
  readonly onSelect = new EventEmitter<MediaValue>();

  mediaTypes: MediaType[] = ['image'];
  sources: readonly string[] = [];
  selection: MediaValue | null = null;
  private initialSelect: MediaValue | null = null;

  get submitDisabled() {
    return this.selection === this.initialSelect;
  }

  constructor(private readonly closeHandle: DialogCloseHandle) {}

  ngOnInit() {
    this.initialSelect = this.selection;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  close() {
    this.onSelect.complete();
    this.closeHandle.close();
  }

  submit() {
    if (this.selection === null) {
      return;
    }

    this.onSelect.next(this.selection);
    this.onSelect.complete();
    this.closeHandle.close();
  }

  selectionChanged(image: MediaValue | null) {
    this.selection = image;
  }
}
