/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

export type ContentAlignment =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center-center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type Direction = 'horizontal' | 'vertical';
export type DistributeAlignment = 'distributed-start' | 'distributed-center' | 'distributed-end';

@Component({
  selector: 'app-layout-alignment',
  templateUrl: './layout-alignment.component.html',
  styleUrls: ['./layout-alignment.component.scss'],
})
export class LayoutAlignmentComponent implements OnChanges {
  constructor() {}
  isDistribute = false;

  @Input() position: ContentAlignment | DistributeAlignment = 'top-right';
  @Input() direction: Direction = 'horizontal';
  @Input() isWrapped = false;

  @Output() positionChanged = new EventEmitter<ContentAlignment | DistributeAlignment>();
  @Output() directionChanged = new EventEmitter<Direction>();
  @Output() isWrappedChanged = new EventEmitter<boolean>();

  currentPosTranslationKey = '';
  currentBaseAligTranslationKey = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes.position || changes.direction) {
      if (
        this.position === 'distributed-start' ||
        this.position === 'distributed-center' ||
        this.position === 'distributed-end'
      ) {
        this.isDistribute = true;
      }
      this.currentBaseAligTranslationKey = this.mapDirectionToTranslationKey(this.direction);
      this.currentPosTranslationKey = this.mapPositionToTranslationKey(this.position, this.direction);
    }
  }

  toggleDistributeAlignment(value: boolean) {
    this.isDistribute = value;
    this.distributeOrFallbackPosition(this.position);
  }

  distributeOrFallbackPosition(position: ContentAlignment | DistributeAlignment) {
    if (this.direction === 'horizontal') {
      if (
        position === 'top-left' ||
        position === 'top-center' ||
        position === 'top-right' ||
        position === 'distributed-start'
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.isDistribute ? this.positionChanged.emit('distributed-start') : this.positionChanged.emit('top-left');
      }
      if (
        position === 'center-left' ||
        position === 'center-center' ||
        position === 'center-right' ||
        position === 'distributed-center'
      ) {
        this.isDistribute ? this.positionChanged.emit('distributed-center') : this.positionChanged.emit('center-left');
      }
      if (
        position === 'bottom-left' ||
        position === 'bottom-center' ||
        position === 'bottom-right' ||
        position === 'distributed-end'
      ) {
        this.isDistribute ? this.positionChanged.emit('distributed-end') : this.positionChanged.emit('bottom-left');
      }
    }
    if (this.direction === 'vertical') {
      if (
        position === 'top-left' ||
        position === 'center-left' ||
        position === 'bottom-left' ||
        position === 'distributed-start'
      ) {
        this.isDistribute ? this.positionChanged.emit('distributed-start') : this.positionChanged.emit('top-left');
      }
      if (
        position === 'top-center' ||
        position === 'center-center' ||
        position === 'bottom-center' ||
        position === 'distributed-center'
      ) {
        this.isDistribute ? this.positionChanged.emit('distributed-center') : this.positionChanged.emit('top-center');
      }
      if (
        position === 'top-right' ||
        position === 'center-right' ||
        position === 'bottom-right' ||
        position === 'distributed-end'
      ) {
        this.isDistribute ? this.positionChanged.emit('distributed-end') : this.positionChanged.emit('top-right');
      }
    }
  }

  setPosition(position: ContentAlignment) {
    this.position = position;
    if (this.isDistribute) {
      this.distributeOrFallbackPosition(this.position);
    } else {
      this.positionChanged.emit(this.position);
    }
  }

  setDirection(alignment: Direction) {
    this.direction = alignment;
    if (this.isDistribute) {
      this.distributeOrFallbackPosition(this.position);
    }
    this.directionChanged.emit(alignment);
  }

  private mapDirectionToTranslationKey(alignment: Direction) {
    switch (alignment) {
      case 'horizontal':
        return 'RHS.SUPER_LAYOUT.HORIZONTAL';
      case 'vertical':
        return 'RHS.SUPER_LAYOUT.VERTICAL';
    }
  }

  private mapPositionToTranslationKey(position: ContentAlignment | DistributeAlignment, direction: Direction) {
    switch (position) {
      case 'top-left':
        return 'RHS.SUPER_LAYOUT.TOP_LEFT';
      case 'top-center':
        return 'RHS.SUPER_LAYOUT.TOP_CENTER';
      case 'top-right':
        return 'RHS.SUPER_LAYOUT.TOP_RIGHT';
      case 'center-left':
        return 'RHS.SUPER_LAYOUT.CENTER_LEFT';
      case 'center-center':
        return 'RHS.SUPER_LAYOUT.CENTER_CENTER';
      case 'center-right':
        return 'RHS.SUPER_LAYOUT.CENTER_RIGHT';
      case 'bottom-left':
        return 'RHS.SUPER_LAYOUT.BOTTOM_LEFT';
      case 'bottom-center':
        return 'RHS.SUPER_LAYOUT.BOTTOM_CENTER';
      case 'bottom-right':
        return 'RHS.SUPER_LAYOUT.BOTTOM_RIGHT';
      case 'distributed-start':
        return direction === 'horizontal' ? 'RHS.SUPER_LAYOUT.TOP' : 'RHS.SUPER_LAYOUT.LEFT';
      case 'distributed-center':
        return 'RHS.SUPER_LAYOUT.CENTER';
      case 'distributed-end':
        return direction === 'horizontal' ? 'RHS.SUPER_LAYOUT.BOTTOM' : 'RHS.SUPER_LAYOUT.RIGHT';
      default:
        return '';
    }
  }
}
