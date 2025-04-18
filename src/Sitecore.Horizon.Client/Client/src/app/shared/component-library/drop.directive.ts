/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { _dragndropDataFormat } from './draggable.directive';

type PayloadType = string;

export interface DropEvent {
  payload: PayloadType;
  offsetTop: number;
  offsetBottom: number;
}

/**
 * This directive needs global styles in order to handle the dragenter and dragleave phases in a predictable manner.
 * See `_dragndrop.directive.scss` imported in `styles.scss`.
 *
 * If the element doesn't have any child nodes then the global styles not required.
 */
@Directive({
  selector: '[appDrop]',
  host: {
    '(dragenter)': 'dragenter($event)',
    '(dragover)': 'dragover($event)',
    '(dragleave)': 'dragleave()',
    '(drop)': 'drop($event)',
    '[class._dragndrop_droptarget_]': 'true',
  },
  exportAs: 'drop',
})
export class DropDirective {
  @Input() canDrop = true;

  @Output('appDrop') dropEv = new EventEmitter<DropEvent>();

  private dragover$ = new Subject<boolean>();
  isDragover$ = this.dragover$.pipe(distinctUntilChanged());

  private _isDragover = false;

  /**
   * Indicates if there is an element being dragged over it.
   */
  get isDragover() {
    return this._isDragover;
  }

  offsetTop = Number.MAX_SAFE_INTEGER;
  offsetBottom = Number.MAX_SAFE_INTEGER;

  private height = 0;
  private clientTop = 0;

  constructor(private readonly el: ElementRef) {}

  dragenter(event: DragEvent) {
    this.setDragover(true);

    this.cacheElHeight();
    this.calculateVerticalOffset(event);
  }

  dragleave() {
    this.setDragover(false);
  }

  dragover(event: DragEvent) {
    this.calculateVerticalOffset(event);
    if (this.canDrop) {
      event.preventDefault();
    }
  }

  drop(event: DragEvent) {
    event.preventDefault();
    this.calculateVerticalOffset(event);
    this.setDragover(false);
    this.dropEv.emit({
      payload: this.getPayload(event),
      offsetTop: this.offsetTop,
      offsetBottom: this.offsetBottom,
    });
  }

  private setDragover(value: boolean) {
    this._isDragover = value;
    this.dragover$.next(value);
  }

  private getPayload(event: DragEvent): PayloadType {
    return event.dataTransfer?.getData(_dragndropDataFormat) || '';
  }

  private calculateVerticalOffset(event: DragEvent) {
    this.offsetTop = event.clientY - this.clientTop;
    this.offsetBottom = this.height - this.offsetTop;
  }

  // Cache el position so that further calculations are faster.
  private cacheElHeight() {
    const { height, top } = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    this.height = height;
    this.clientTop = top;
  }
}
