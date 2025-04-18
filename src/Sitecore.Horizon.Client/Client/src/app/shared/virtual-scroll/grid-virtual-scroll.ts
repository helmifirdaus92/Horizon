/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

// eslint-disable-next-line max-classes-per-file
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { CdkVirtualScrollViewport, VIRTUAL_SCROLL_STRATEGY, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { Directive, Input, OnChanges, forwardRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/** Virtual scrolling strategy for lists with rows and columns of known fixed size. */
export class GridVirtualScrollStrategy implements VirtualScrollStrategy {
  private _scrolledIndexChange = new Subject<number>();

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  scrolledIndexChange: Observable<number> = this._scrolledIndexChange.pipe(distinctUntilChanged());

  /** The attached viewport. */
  private _viewport: CdkVirtualScrollViewport | null = null;

  /** The size of the rows in the virtually scrolling list. */
  private _rowSize: number;

  /** The minimum amount of buffer rendered beyond the viewport (in pixels). */
  private _minBufferPx: number;

  /** The number of buffer rows to render beyond the edge of the viewport (in pixels). */
  private _maxBufferPx: number;

  /** The number of columns */
  private _columnLength = 1;

  /** The number of rows */
  get _rowLengt() {
    if (!this._viewport) {
      return 0;
    }
    return Math.ceil(this._viewport.getDataLength() / this._columnLength);
  }

  /**
   * @param rowSize The size of the rows in the virtually scrolling list.
   * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
   * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
   */
  constructor(rowSize: number, minBufferPx: number, maxBufferPx: number, columnSize: number) {
    this._rowSize = rowSize;
    this._minBufferPx = minBufferPx;
    this._maxBufferPx = maxBufferPx;
    this._columnLength = columnSize;
  }

  /**
   * Attaches this scroll strategy to a viewport.
   * @param viewport The viewport to attach this strategy to.
   */
  attach(viewport: CdkVirtualScrollViewport) {
    this._viewport = viewport;
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }

  /** Detaches this scroll strategy from the currently attached viewport. */
  detach() {
    this._scrolledIndexChange.complete();
    this._viewport = null;
  }

  /**
   * Update the row size and buffer size.
   * @param rowSize The size of the rows in the virtually scrolling list.
   * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
   * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
   */
  updateRowColumnAndBufferSize(rowSize: number, minBufferPx: number, maxBufferPx: number, columnLength: number) {
    if (maxBufferPx < minBufferPx) {
      throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
    }
    this._rowSize = rowSize;
    this._minBufferPx = minBufferPx;
    this._maxBufferPx = maxBufferPx;
    this._columnLength = columnLength;
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onContentScrolled() {
    this._updateRenderedRange();
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onDataLengthChanged() {
    this._updateTotalContentSize();
    this._updateRenderedRange();
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onContentRendered() {
    /* no-op */
  }

  /** @docs-private Implemented as part of VirtualScrollStrategy. */
  onRenderedOffsetChanged() {
    /* no-op */
  }

  /**
   * Scroll to the offset for the given index.
   * @param index The index of the element to scroll to.
   * @param behavior The ScrollBehavior to use when scrolling.
   */
  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    if (this._viewport) {
      const rowIndex = Math.ceil(index / this._columnLength);
      this._viewport.scrollToOffset(rowIndex * this._rowSize, behavior);
    }
  }

  /** Update the viewport's total content size. */
  private _updateTotalContentSize() {
    if (!this._viewport) {
      return;
    }
    this._viewport.setTotalContentSize(this._rowLengt * this._rowSize);
  }

  /** Update the viewport's rendered range. */
  private _updateRenderedRange() {
    if (!this._viewport) {
      return;
    }

    const scrollOffset = this._viewport.measureScrollOffset();
    const firstVisibleRow = scrollOffset / this._rowSize;
    const renderedRange = this._viewport.getRenderedRange();

    // In theory rowStart should divide evenly, so math.floor should not be necessary.
    let rowStart = renderedRange.start / this._columnLength;
    if (!Number.isInteger(rowStart)) {
      rowStart = Math.floor(rowStart);
    }
    const rowEnd = Math.floor(renderedRange.end / this._columnLength);

    const newRange = { start: rowStart, end: rowEnd };
    const viewportSize = this._viewport.getViewportSize();

    const startBuffer = scrollOffset - rowStart * this._rowSize;
    if (startBuffer < this._minBufferPx && rowStart !== 0) {
      const expandStart = Math.ceil((this._maxBufferPx - startBuffer) / this._rowSize);
      newRange.start = Math.max(0, rowStart - expandStart);
      newRange.end = Math.min(
        this._rowLengt,
        Math.ceil(firstVisibleRow + (viewportSize + this._minBufferPx) / this._rowSize),
      );
    } else {
      const endBuffer = rowEnd * this._rowSize - (scrollOffset + viewportSize);
      if (endBuffer < this._minBufferPx && rowEnd !== this._rowLengt) {
        const expandEnd = Math.ceil((this._maxBufferPx - endBuffer) / this._rowSize);
        if (expandEnd > 0) {
          newRange.end = Math.min(this._rowLengt, rowEnd + expandEnd);
          newRange.start = Math.max(0, Math.floor(firstVisibleRow - this._minBufferPx / this._rowSize));
        }
      }
    }

    // Convert rows to indexes
    this._viewport.setRenderedRange({
      start: newRange.start * this._columnLength,
      end: newRange.end * this._columnLength,
    });

    this._viewport.setRenderedContentOffset(this._rowSize * newRange.start);
    this._scrolledIndexChange.next(Math.floor(firstVisibleRow) * this._columnLength);
  }
}

/**
 * Provider factory for `GridVirtualScrollStrategy` that simply extracts the already created
 * `GridVirtualScrollStrategy` from the given directive.
 * @param gridDir The instance of `CdkGridVirtualScroll` to extract the
 *     `GridVirtualScrollStrategy` from.
 */
export function _gridVirtualScrollStrategyFactory(gridDir: GridVirtualScrollDirective) {
  return gridDir._scrollStrategy;
}

/** A virtual scroll strategy that supports fixed-size items. */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'cdk-virtual-scroll-viewport[rowSize]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: _gridVirtualScrollStrategyFactory,
      deps: [forwardRef(() => GridVirtualScrollDirective)],
    },
  ],
})
export class GridVirtualScrollDirective implements OnChanges {
  /** The size of the items in the list (in pixels). */
  @Input()
  get rowSize(): number {
    return this._rowSize;
  }
  set rowSize(value: number) {
    this._rowSize = coerceNumberProperty(value);
  }
  private _rowSize = 20;

  /**
   * The minimum amount of buffer rendered beyond the viewport (in pixels).
   * If the amount of buffer dips below this number, more items will be rendered. Defaults to 100px.
   */
  @Input()
  get minBufferPx(): number {
    return this._minBufferPx;
  }
  set minBufferPx(value: number) {
    this._minBufferPx = coerceNumberProperty(value);
  }
  private _minBufferPx = 100;

  /**
   * The number of pixels worth of buffer to render for when rendering new items. Defaults to 200px.
   */
  @Input()
  get maxBufferPx(): number {
    return this._maxBufferPx;
  }
  set maxBufferPx(value: number) {
    this._maxBufferPx = coerceNumberProperty(value);
  }
  private _maxBufferPx = 200;

  @Input()
  get columnLength() {
    return this._colLenth;
  }
  set columnLength(value) {
    this._colLenth = coerceNumberProperty(value);
  }
  private _colLenth = 1;

  /** The scroll strategy used by this directive. */
  _scrollStrategy = new GridVirtualScrollStrategy(this.rowSize, this.minBufferPx, this.maxBufferPx, this.columnLength);

  ngOnChanges() {
    this._scrollStrategy.updateRowColumnAndBufferSize(
      this.rowSize,
      this.minBufferPx,
      this.maxBufferPx,
      this.columnLength,
    );
  }
}
