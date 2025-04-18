/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, ElementRef, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
import { PagePaneComponent } from '../page/page-pane.component';
import { DragEvent } from './drag-event';

@Component({
  selector: 'ng-spd-split-pane',
  template: `
    <ng-content></ng-content>
    <div class="pane-divider" (mousedown)="startDragging($event)" (touchstart)="startDragging($event)"></div>
    <div class="overlay" *ngIf="isDragging"></div>
  `,
  styleUrls: ['./split-pane.component.scss'],
  host: {
    '[class.hide]': 'hide',
    '[class.static]': 'isStatic',
    '[class.dragging]': 'isDragging',
    '[style.width.px]': 'width',
  },
})
export class SplitPaneComponent extends PagePaneComponent {
  static readonly minWidth = 300;

  private _width: number = SplitPaneComponent.minWidth;
  @Input() set width(val: number) {
    this._width = val ?? SplitPaneComponent.minWidth;
  }
  get width(): number {
    return this._width;
  }

  @Input() isStatic = false;

  @Output() dragging = new EventEmitter<DragEvent>();

  isDragging = false;

  private dragListeners: Array<() => void> = [];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {
    super(el);
  }

  startDragging(event: MouseEvent | TouchEvent) {
    event.preventDefault();

    if (this.isStatic) {
      return;
    }
    this.isDragging = true;

    let start: number;
    if (event instanceof MouseEvent) {
      start = event.clientX;
    } else if (event instanceof TouchEvent) {
      start = event.touches[0].clientX;
    }

    const initialWidth = this.width;

    this.dragListeners.push(
      this.renderer.listen('document', 'mousemove', (e) => this.dragEvent(e, start, initialWidth)),
    );
    this.dragListeners.push(
      this.renderer.listen('document', 'touchmove', (e) => this.dragEvent(e, start, initialWidth)),
    );

    this.dragListeners.push(this.renderer.listen('document', 'mouseup', () => this.stopDragging()));
    this.dragListeners.push(this.renderer.listen('document', 'touchend', () => this.stopDragging()));
    this.dragListeners.push(this.renderer.listen('document', 'touchcancel', () => this.stopDragging()));

    this.dragging.emit({
      phase: 'began',
      width: initialWidth,
    });
  }

  stopDragging() {
    if (this.isStatic) {
      return;
    }
    if (!this.isDragging) {
      return;
    }

    while (this.dragListeners.length > 0) {
      const listener = this.dragListeners.pop();
      if (listener) {
        listener();
      }
    }
    this.width = this.el.nativeElement.offsetWidth;
    this.isDragging = false;

    this.dragging.emit({
      phase: 'ended',
      width: this.width,
    });
  }

  dragEvent(event: MouseEvent | TouchEvent, start: number, initialWidth: number) {
    let end = 0;
    if (event instanceof MouseEvent) {
      end = event.clientX;
    } else if (event instanceof TouchEvent) {
      end = event.touches[0].clientX;
    }

    this.width = initialWidth + end - start;
    if (this.width < SplitPaneComponent.minWidth) {
      this.width = SplitPaneComponent.minWidth;
    }

    this.dragging.emit({
      phase: 'move',
      width: this.width,
    });
  }
}
