/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ContentChild, Directive, EventEmitter, Input, OnDestroy, Optional, Output } from '@angular/core';
import { DragndropDragimageDirective } from './dragimage.directive';
import { DragndropContainerDirective } from './dragndrop-container.directive';

export const _dragndropDataFormat = 'Text';

@Directive({
  selector: '[appDraggable]',
  host: {
    draggable: 'true',
    '(dragstart)': 'dragstart($event)',
    '(dragend)': 'dragend()',
  },
  exportAs: 'draggable',
})
export class DraggableDirective implements OnDestroy {
  @Input('appDraggable') payload = '';
  @ContentChild(DragndropDragimageDirective) dragImage?: DragndropDragimageDirective;
  @Output() draggableDragstart = new EventEmitter();

  private _isDragging = false;
  get isDragging() {
    return this._isDragging;
  }

  private dragImageClone?: HTMLElement;

  constructor(@Optional() private readonly container?: DragndropContainerDirective) {}

  ngOnDestroy() {
    // Cleanup if the element is in dragging mode.
    if (this.isDragging) {
      this.dragend();
    }
  }

  dragstart(event: DragEvent) {
    this._isDragging = true;
    this.container?.dragstart();

    event.dataTransfer?.setData(_dragndropDataFormat, this.payload);
    this.assignDragImage(event);

    this.draggableDragstart.emit();
  }

  dragend() {
    this._isDragging = false;
    this.container?.dragend();
    this.dragImageClone?.remove();
  }

  private assignDragImage(event: DragEvent) {
    if (!this.dragImage || !event.dataTransfer) {
      return;
    }

    const imageEl = this.dragImage.element.nativeElement.cloneNode(true) as HTMLElement;
    imageEl.style.position = 'absolute';
    imageEl.style.left = '-1000px';
    this.dragImage.styles.forEach(([key, value]) => (imageEl.style[key] = value));
    document.body.appendChild(imageEl);

    event.dataTransfer.setDragImage(imageEl, 0, 0);
    this.dragImageClone = imageEl;
  }
}
