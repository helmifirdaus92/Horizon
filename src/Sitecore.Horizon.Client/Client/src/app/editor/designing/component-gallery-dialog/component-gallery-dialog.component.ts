/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, ElementRef, EventEmitter, HostListener, OnInit, ViewChild } from '@angular/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { ElementDimensions, setElementPosition } from 'app/shared/utils/utils';
import { ComponentGalleryComponent } from '../component-gallery/component-gallery.component';

@Component({
  selector: 'app-component-gallery-dialog',
  templateUrl: './component-gallery-dialog.component.html',
  styleUrls: ['./component-gallery-dialog.component.scss'],
})
export class ComponentGalleryDialogComponent implements OnInit {
  allowedRenderingIds: readonly string[] = [];
  chromeDimension?: ElementDimensions;
  readonly onSelect = new EventEmitter<string>();
  @ViewChild(ComponentGalleryComponent) componentGallery?: ComponentGalleryComponent;

  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private elementRef: ElementRef,
    private readonly messagingService: MessagingService,
  ) {}

  ngOnInit(): void {
    setElementPosition(this.chromeDimension as ElementDimensions);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target) && !this.componentGallery?.popoverIsActive()) {
      event.preventDefault();
      this.close();
    }
  }

  close() {
    this.onSelect.complete();
    this.closeHandle.close();
    this.messagingService.getDesigningChannel().emit('addRenderingDialog:close');
  }

  selectRendering(id: string) {
    this.onSelect.next(id);
    this.onSelect.complete();
    this.close();
  }
}
