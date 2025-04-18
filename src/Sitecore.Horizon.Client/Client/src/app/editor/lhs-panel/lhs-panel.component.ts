/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, ElementRef, OnDestroy, OnInit, Renderer2, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { BehaviorSubject, distinctUntilChanged, tap } from 'rxjs';
import { LhsPanelStateService } from './lhs-panel.service';

const LHS_PANEL_WIDTH_KEY = 'hz-lhs-p-w';

@Component({
  selector: 'app-lhs-panel',
  templateUrl: './lhs-panel.component.html',
  styleUrl: './lhs-panel.component.scss',
  host: {
    '[style.width.px]': 'width',
    '[class.hidden]': 'width === 0',
    '[class.expanded]': 'width && isExpanded',
  },
})
export class LhsPanelComponent implements OnInit, OnDestroy {
  static readonly Content: BehaviorSubject<Type<unknown> | null> = new BehaviorSubject<Type<unknown> | null>(null);
  static HasExpand = false;
  static Header: { iconUrl: string; text: string } | null = null;

  static show(component: Type<unknown> | null): void {
    LhsPanelComponent.HasExpand = false;
    LhsPanelComponent.Header = null;
    LhsPanelComponent.Content.next(component);
  }

  getHeader = () => LhsPanelComponent.Header;
  hasExpand = () => LhsPanelComponent.HasExpand;
  isExpanded$ = this.lhsPanelStateService.isExpanded$.pipe(
    tap((val) => {
      this.isExpanded = LhsPanelComponent.HasExpand && val;
    }),
  );
  isExpanded = false;

  @ViewChild('viewContainerRef', { read: ViewContainerRef, static: true }) viewContainerRef!: ViewContainerRef;

  private readonly minWidth = 300;
  private readonly originalWidth = 480;

  private width: number;

  private dragListeners: Array<() => void> = [];
  isDragging = false;

  private readonly lifetime = new Lifetime();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private readonly lhsPanelStateService: LhsPanelStateService,
  ) {}

  ngOnInit(): void {
    LhsPanelComponent.Content.pipe(takeWhileAlive(this.lifetime), distinctUntilChanged()).subscribe((component) => {
      if (component === null) {
        this.width = 0;
        this.viewContainerRef?.clear();
      } else {
        this.viewContainerRef?.clear();
        this.viewContainerRef.createComponent(component);

        const widthLocalStorageValue = localStorage.getItem(LHS_PANEL_WIDTH_KEY);
        this.width = widthLocalStorageValue ? parseInt(widthLocalStorageValue, 10) : this.originalWidth;
      }
    });
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
    this.lhsPanelStateService.setExpand(false);
  }

  closePanel() {
    LhsPanelComponent.show(null);
    LhsPanelComponent.HasExpand = false;
    this.lhsPanelStateService.setExpand(false);
  }

  toggleExpand() {
    this.lhsPanelStateService.toggleExpand();
  }

  // --- Change panel size by drag & drop --- //
  startDragging(event: MouseEvent | TouchEvent) {
    event.preventDefault();

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
  }
  stopDragging() {
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
    localStorage.setItem(LHS_PANEL_WIDTH_KEY, this.width + '');
    this.isDragging = false;
  }
  dragEvent(event: MouseEvent | TouchEvent, start: number, initialWidth: number) {
    let end = 0;
    if (event instanceof MouseEvent) {
      end = event.clientX;
    } else if (event instanceof TouchEvent) {
      end = event.touches[0].clientX;
    }

    this.width = initialWidth + end - start;
    if (this.width < this.minWidth) {
      this.width = this.minWidth;
    }
  }
}
