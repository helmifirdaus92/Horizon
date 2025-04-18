/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Padding } from '@sitecore/ng-spd-lib';
import { MediaItemInfo } from 'app/shared/platform-media/media.interface';
import { isSameGuid } from 'app/shared/utils/utils';
import { ReplaySubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-media-content',
  template: `
    <ng-content></ng-content>
    <cdk-virtual-scroll-viewport
      [style.visibility]="!!(length$ | async) ? 'visible' : 'hidden'"
      [rowSize]="rowHeight"
      [columnLength]="colCount"
      [minBufferPx]="rowHeight * 4"
      [maxBufferPx]="rowHeight * 6"
    >
      <app-media-card
        *cdkVirtualFor="let item of items; let i = index"
        [src]="item.url | resizeMedia: thumbnailDimension : thumbnailDimension | cmUrl"
        [fileExtension]="item.extension"
        [text]="item.displayName"
        [select]="isSameId(item.id, select)"
        (click)="onSelect(item.id)"
      ></app-media-card>
      <div *ngIf="hasMoreItems" class="limit" [style.grid-column]="'span ' + colCount">
        <ng-spd-inline-notification
          severity="info"
          [text]="(limitReachedText$ | async) || ''"
        ></ng-spd-inline-notification>
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styleUrls: ['./media-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'calculateNumberOfColumns()',
  },
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
})
export class MediaContentComponent implements AfterViewInit, OnChanges {
  @ViewChild(CdkVirtualScrollViewport, { read: ElementRef }) viewportEl?: ElementRef;
  @ViewChild(CdkVirtualScrollViewport) scrollViewport?: CdkVirtualScrollViewport;

  @Input() hasMoreItems = false;
  @Input() items: MediaItemInfo[] | null = null;

  @Input() select = '';
  @Output() selectChange = new EventEmitter<string>();

  readonly length$ = new ReplaySubject<number | null>(1);

  limitReachedText$ = combineLatest([this.translateService.get('MEDIA.LIMIT_REACHED'), this.length$]).pipe(
    map(([translation, length]) => (length ? translation.replace('{{limit}}', length.toString()) : '') as string),
  );

  readonly thumbnailDimension = 158;

  // thumbnailDimension + 2px border
  readonly colWidth = this.thumbnailDimension + 2;

  // thumbnailDimension + 20px text + 2px border + 20px padding
  readonly rowHeight = this.thumbnailDimension + 42;

  private _colCount = 1;
  get colCount() {
    return this._colCount;
  }
  set colCount(value: number) {
    this._colCount = value > 0 ? value : 1;
  }

  constructor(private translateService: TranslateService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items) {
      this.length$.next(this.items ? this.items.length : null);
    }
  }

  ngAfterViewInit() {
    this.calculateNumberOfColumns();
  }

  /**
   * Set the number of columns based on the avaiable width
   * Set the css-grid number of columns
   */
  calculateNumberOfColumns() {
    if (!this.viewportEl) {
      return;
    }

    // 2x large padding -1/2 normal padding for each first and last items in a row (because they only have padding on one side) -20px for scrollbar
    // It's better to assume there is a scroll bar, otherwise it needs to recalculate after items rendered to see if scroll bar was added or when items change
    // The content wrapper has a custom padding of 40px.
    const availableWidth = (this.viewportEl.nativeElement as HTMLElement).offsetWidth - 2 * 80 + Padding.default - 20;
    this.colCount = Math.floor(availableWidth / (this.colWidth + Padding.default));
    this.setScrollColumns(this.colCount);
  }

  onSelect(value: string) {
    this.select = value;
    this.selectChange.emit(this.select);
  }

  isSameId(id1: string, id2: string) {
    return isSameGuid(id1, id2);
  }

  private setScrollColumns(count: number) {
    if (!this.scrollViewport) {
      return;
    }

    // eslint-disable-next-line max-len
    this.scrollViewport._contentWrapper.nativeElement.style.gridTemplateColumns = `repeat(${count}, ${this.colWidth}px)`;
  }
}
