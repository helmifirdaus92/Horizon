/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterOutlet } from '@angular/router';
import { AnalyticsContextService } from 'app/analytics/analytics-context.service';
import { PagePaneComponent } from 'app/component-lib/page/page-pane.component';
import { SplitPaneComponent } from 'app/component-lib/split-pane/split-pane.component';
import { LhsPanelStateService } from 'app/editor/lhs-panel/lhs-panel.service';
import { RHS_DRAG_HANDLE_ELEMENT_ID } from 'app/editor/right-hand-side/editor-rhs.component';
import { RhsPositionService } from 'app/editor/right-hand-side/rhs-position.service';
import { LHSNavigationService } from 'app/pages/left-hand-side/lhs-navigation.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { ItemChangeService } from 'app/shared/client-state/item-change-service';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { Language, LanguageService } from 'app/shared/site-language/site-language.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { Observable, combineLatest, firstValueFrom, map, startWith, switchMap } from 'rxjs';
import { pagesAnimations } from './pages.animations';
import { PagesService } from './pages.service';

const RHS_DRAG_LIMITS = {
  topMin: 70,
  topMaxOffset: 200,
  bottomPadding: 50,
};

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
  animations: pagesAnimations,
})
export class PagesComponent implements OnInit, OnDestroy {
  contextItemDisplayName$?: Observable<string>;
  siteName$?: Observable<string | undefined>;
  language$?: Observable<string | undefined>;
  languages$?: Observable<Language[]>;
  hideLHS$?: Observable<boolean>;
  isLhsPanelExpanded$ = this.lhsPanelStateService.isExpanded$;

  showBtnLHS = false;
  showBtnRHS = false;

  navigationSegment?: string;
  queryParams?: Params;

  rhsIsDocked$ = this.rhsPositionService.isDocked$;

  dragStart = { clientX: 0, clientY: 0 };
  dragTarget: EventTarget | null = null;

  @ViewChild('rhs') rhs?: PagePaneComponent;
  @ViewChild('lhs') lhs?: SplitPaneComponent;
  @ViewChild(RouterOutlet) routerOutlet?: RouterOutlet;

  private editingChannel: EditingMessagingChannel;

  private readonly lifetime = new Lifetime();

  private dragRhsOverlay?: HTMLDivElement;

  private canvasResizeObserver: ResizeObserver = new ResizeObserver(() => {
    this.zone.run(async () => {
      const rhsEl = this.rhs?.elementRef.nativeElement;
      const isDocked = await firstValueFrom(this.rhsIsDocked$);

      if (isDocked || !rhsEl || !this.editorWorkspaceEl) {
        return;
      }

      const left = rhsEl.offsetLeft;
      const top = rhsEl.offsetTop - rhsEl.height;

      if (this.editorWorkspaceEl.clientWidth <= rhsEl.offsetWidth) {
        this.rhsPositionService.setDockState(true);
        return;
      }

      await this.adjustRhsElementPositionAfterMove(left, top);
      await this.adjustRhsElementSizeAfterMove();
    });
  });

  private editorWorkspaceEl: Element | null;

  constructor(
    private readonly context: ContextService,
    private readonly analyticsContextService: AnalyticsContextService,
    private readonly lhsService: LHSNavigationService,
    private readonly languageService: LanguageService,
    private readonly itemChangeService: ItemChangeService,
    private readonly messagingService: MessagingService,
    private readonly pagesService: PagesService,
    route: ActivatedRoute,
    router: Router,
    private readonly lhsPanelStateService: LhsPanelStateService,
    private readonly rhsPositionService: RhsPositionService,
    private readonly zone: NgZone,
  ) {
    this.lhsService.provideRouter(router, route);
  }
  ngOnDestroy() {
    this.removeDragCatchOverlay();
    this.canvasResizeObserver.disconnect();
    this.lifetime.dispose();
  }

  ngOnInit() {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();

    this.initRhsDocking();

    this.contextItemDisplayName$ = combineLatest([
      this.context.value$,
      this.itemChangeService.watchForChanges({ scopes: ['display-name'] }).pipe(startWith([])),
    ]).pipe(
      switchMap(() => this.context.getItem()),
      map((item) => item.displayName),
    );

    this.siteName$ = this.context.siteName$;

    this.language$ = combineLatest([this.languageService.getLanguages(), this.context.language$]).pipe(
      map(
        ([languages, currentLanguage]) =>
          languages.find((language) => language.name === currentLanguage)?.englishName ?? undefined,
      ),
    );

    this.hideLHS$ = this.analyticsContextService
      .watchActiveRoute()
      .pipe(map((selectedComponent) => selectedComponent === 'site'));

    this.lhsService
      .watchRouteSegmentWithQueryParams()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((navigation) => {
        this.navigationSegment = navigation.segment;
        this.queryParams = navigation.queryParams;
      });
  }

  getRouterOutletState() {
    return this.routerOutlet?.activatedRouteData['state'];
  }

  deselectChrome() {
    this.editingChannel.rpc.deselectChrome();
  }

  onDragStart(e: DragEvent) {
    if (!((this.dragTarget as HTMLElement) || null)?.closest('#' + RHS_DRAG_HANDLE_ELEMENT_ID)) {
      e.preventDefault();
      e.stopImmediatePropagation();

      return;
    }

    if (e.dataTransfer) {
      // workaround for firefox, which otherwise ignores the event.
      e.dataTransfer.setData('Text', '');
    }

    const currentTarget = e.currentTarget as HTMLElement;
    this.dragStart.clientX = e.clientX - currentTarget?.offsetLeft;
    this.dragStart.clientY = e.clientY - currentTarget?.offsetTop;

    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.dropEffect = 'move';

    this.initDragCatchingOverlay();
  }

  async onDragEnd(e: DragEvent) {
    if (e.clientX <= 0 || e.clientY <= 0) {
      return;
    }

    e.preventDefault();

    const left = e.clientX - this.dragStart.clientX;
    const top = e.clientY - this.dragStart.clientY;

    await this.adjustRhsElementPositionAfterMove(left, top);
    await this.adjustRhsElementSizeAfterMove();
  }

  private initDragCatchingOverlay() {
    const dragOverlay = document.createElement('div');
    dragOverlay.style.width = '100vw';
    dragOverlay.style.height = '100vh';
    dragOverlay.style.position = 'absolute';
    dragOverlay.style.top = '0';
    dragOverlay.style.left = '0';
    dragOverlay.style.zIndex = '1';
    dragOverlay.style.cursor = 'move';
    dragOverlay.addEventListener('dragover', function (e) {
      e.preventDefault();
    });

    (this.rhs?.elementRef.nativeElement as HTMLElement).parentElement?.prepend(dragOverlay);
    this.dragRhsOverlay = dragOverlay;

    this.rhs?.elementRef.nativeElement.addEventListener('dragend', () => {
      this.removeDragCatchOverlay();
    });
  }

  private removeDragCatchOverlay() {
    this.dragRhsOverlay?.remove();
  }

  private async adjustRhsElementPositionAfterMove(left: number, top: number) {
    if (!this.rhs?.elementRef.nativeElement) {
      return;
    }

    const isDocked = await firstValueFrom(this.rhsIsDocked$);
    if (isDocked) {
      return;
    }

    if (top > window.innerHeight - RHS_DRAG_LIMITS.topMaxOffset) {
      top = window.innerHeight - RHS_DRAG_LIMITS.topMaxOffset;
    }
    if (top < RHS_DRAG_LIMITS.topMin) {
      top = RHS_DRAG_LIMITS.topMin;
    }
    if (left > window.innerWidth - (this.rhs.elementRef.nativeElement as HTMLElement).offsetWidth) {
      left = window.innerWidth - this.rhs.elementRef.nativeElement.offsetWidth;
    }
    if (left < 0 || (this.lhs?.elementRef.nativeElement && left < this.lhs.elementRef.nativeElement.offsetWidth)) {
      left = this.lhs?.elementRef.nativeElement.offsetWidth || 0;
    }

    this.rhs!.elementRef.nativeElement!.style.left = `${left}px`;
    this.rhs!.elementRef.nativeElement!.style.top = `${top}px`;
  }

  private async adjustRhsElementSizeAfterMove() {
    if (!this.rhs?.elementRef.nativeElement) {
      return;
    }
    const isDocked = await firstValueFrom(this.rhsIsDocked$);
    if (isDocked) {
      return;
    }

    const top = this.rhs.elementRef.nativeElement.offsetTop;
    this.rhs.elementRef.nativeElement.style.maxHeight = `calc(100vh - ${RHS_DRAG_LIMITS.bottomPadding}px - ${top}px)`;
  }

  private async initRhsDocking() {
    this.pagesService.rhsStateChange$.pipe(takeWhileAlive(this.lifetime)).subscribe((state) => {
      if (!this.rhs) {
        return;
      }

      switch (state) {
        case 'close':
          this.rhs.hide = true;
          this.rhs.show = false;
          break;

        case 'open':
          this.rhs.hide = false;
          this.rhs.show = true;
          break;

        case 'toggle':
          this.rhs.hide = !this.rhs.hide;
          this.rhs.show = !this.rhs.hide;
          break;
      }
    });

    this.rhsIsDocked$.pipe(takeWhileAlive(this.lifetime)).subscribe((isDocked) => {
      if (isDocked && this.rhs?.elementRef.nativeElement) {
        this.rhs.elementRef.nativeElement.style.top = 'auto';
        this.rhs.elementRef.nativeElement.style.left = 'auto';
        this.rhs.elementRef.nativeElement.style.maxHeight = 'unset';
      }
    });

    // Wait for Canvas to appear
    await firstValueFrom(this.context.value$);
    this.editorWorkspaceEl = document.querySelector('app-editor-workspace');
    if (this.editorWorkspaceEl) {
      this.canvasResizeObserver.observe(this.editorWorkspaceEl);
    }
  }
}
