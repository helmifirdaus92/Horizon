/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { Item, TenantPageTemplate } from 'app/page-design/page-templates.types';
import { ContextService } from 'app/shared/client-state/context.service';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { isSameGuid } from 'app/shared/utils/utils';
import { catchError, combineLatest, finalize, firstValueFrom, of, shareReplay, switchMap } from 'rxjs';

@Component({
  selector: 'app-page-designs-lhs-panel',
  templateUrl: './page-designs-lhs-panel.component.html',
  styleUrls: ['./page-designs-lhs-panel.component.scss'],
})
export class PageDesignsLhsPanelComponent implements OnInit, OnDestroy {
  pageDesign: { id: string; version: number | undefined } = { id: '', version: undefined };
  isLoading = false;

  allPartialDesignItems: Item[] = [];
  availablePartialDesignItems: Item[] = [];
  selectedPartialDesignItems: Item[] = [];
  highlightedItem?: Item;
  selectedHighlightedItem?: Item;
  templateWithPageDesign: TenantPageTemplate[] = [];

  originPageDesignPartialIds: string[] = [];
  updatedPageDesignPartialIds: string[] = [];

  draggingIndex: number | undefined;
  private readonly lifetime = new Lifetime();

  private readonly editingChannel: EditingMessagingChannel;

  constructor(
    private readonly pageTemplatesService: PageTemplatesService,
    private readonly contextService: ContextService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly router: Router,
    private readonly messagingService: MessagingService,
  ) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();
  }

  async ngOnInit() {
    const allPartialDesignItems$ = this.contextService.siteName$.pipe(
      switchMap((siteName) => {
        this.isLoading = true;
        return this.pageTemplatesService.getPartialDesignsList(siteName).pipe(
          takeWhileAlive(this.lifetime),
          catchError(() => {
            this.showErrorMessage();
            return of([]);
          }),
          finalize(() => (this.isLoading = false)),
        );
      }),
      shareReplay(1),
    );

    const pageDesignPartialIds$ = this.contextService.value$.pipe(
      switchMap(({ itemId, itemVersion }) => {
        this.isLoading = true;
        this.pageDesign = { id: itemId, version: itemVersion };

        return this.pageTemplatesService.getPageDesignPartials(itemId).pipe(
          takeWhileAlive(this.lifetime),
          catchError(() => {
            this.showErrorMessage();
            return of([]);
          }),
          finalize(() => (this.isLoading = false)),
        );
      }),
      shareReplay(1),
    );

    combineLatest([allPartialDesignItems$, pageDesignPartialIds$])
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(([allPartialDesignItems, pageDesignPartialIds]) => {
        this.updateLists(allPartialDesignItems, pageDesignPartialIds);
      });

    this.pageTemplatesService
      .getTenantPageTemplates(this.contextService.siteName)
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((pageTemplates) => {
        this.templateWithPageDesign = pageTemplates.filter((template) =>
          isSameGuid(template.pageDesign?.itemId, this.contextService.itemId),
        );
      });
  }

  ngOnDestroy() {
    this.lifetime.dispose();
    window.removeEventListener('click', this.clickHandler);
  }

  selectHighlightedItem(partialDesignItem: Item) {
    this.selectedHighlightedItem = partialDesignItem;
    window.addEventListener('click', this.clickHandler);
  }

  deselectHighlightPartialDesign() {
    window.removeEventListener('click', this.clickHandler);
    this.selectedHighlightedItem = undefined;
    this.unhighlightPartialDesignInCanvas();
  }

  clickHandler = () => {
    this.deselectHighlightPartialDesign();
  };

  async highlightPartialDesign(partialDesignItem: Item) {
    this.highlightedItem = partialDesignItem;

    this.editingChannel.rpc.highlightPartialDesign(partialDesignItem.itemId);
  }

  unhighlightPartialDesign() {
    if (this.selectedHighlightedItem && this.highlightedItem?.itemId !== this.selectedHighlightedItem?.itemId) {
      this.highlightPartialDesign(this.selectedHighlightedItem);
    } else if (!this.selectedHighlightedItem) {
      this.unhighlightPartialDesignInCanvas();
    }
  }

  unhighlightPartialDesignInCanvas() {
    this.editingChannel.rpc.unhighlightPartialDesign();
  }

  editPartialDesign(partialDesignItem: Item, pageDesign: { id: string; version: number | undefined }) {
    this.pageTemplatesService.setContextPageDesign(pageDesign);
    this.router.navigate(['/editpartialdesign'], {
      queryParams: {
        sc_itemid: partialDesignItem.itemId,
        sc_version: partialDesignItem.version,
      },
      queryParamsHandling: 'merge',
    });
  }

  async removeItem(itemId: string) {
    const index = this.originPageDesignPartialIds.indexOf(itemId);
    if (index === -1) {
      return;
    }

    this.updatedPageDesignPartialIds = this.originPageDesignPartialIds.filter((id) => id !== itemId);
    this.isLoading = true;

    const result = await firstValueFrom(
      this.pageTemplatesService.assignPageDesignPartials(this.pageDesign.id, this.updatedPageDesignPartialIds),
    );

    this.isLoading = false;
    if (!result.success) {
      this.showErrorMessage(result.errorMessage);
      this.updatedPageDesignPartialIds = [...this.originPageDesignPartialIds];
      return;
    }

    this.originPageDesignPartialIds.splice(index, 1);
    this.updateAvailablePartialDesignLists();
    this.updateSelectedPartialDesignLists();
    this.reloadIframe();
  }

  async selectItem(itemId: string) {
    const index = this.originPageDesignPartialIds.indexOf(itemId);
    if (index !== -1) {
      return;
    }

    this.updatedPageDesignPartialIds = [...this.originPageDesignPartialIds];
    this.updatedPageDesignPartialIds.push(itemId);
    this.isLoading = true;

    const result = await firstValueFrom(
      this.pageTemplatesService.assignPageDesignPartials(this.pageDesign.id, this.updatedPageDesignPartialIds),
    );

    this.isLoading = false;
    if (!result.success) {
      this.showErrorMessage(result.errorMessage);
      this.updatedPageDesignPartialIds = [...this.originPageDesignPartialIds];
      return;
    }

    this.originPageDesignPartialIds.push(itemId);
    this.updateAvailablePartialDesignLists();
    this.updateSelectedPartialDesignLists();
    this.reloadIframe();
  }

  onDragStart(event: DragEvent, index: number): void {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
    this.draggingIndex = index;
  }

  onDragEnter(event: DragEvent): void {
    const dragItem = event.target as HTMLElement;
    if (dragItem) {
      dragItem.classList.add('placeholder');
    }
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (this.draggingIndex !== undefined && this.draggingIndex !== index) {
      this.reorderItem(this.draggingIndex, index);
    }
  }

  onDragLeave(event: DragEvent): void {
    const dragItem = event.target as HTMLElement;
    if (dragItem) {
      dragItem.classList.remove('placeholder');
    }
  }

  onDrop(event: DragEvent) {
    const dragItem = event.target as HTMLElement;
    if (dragItem) {
      dragItem.classList.remove('placeholder');
    }

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  async onDragEnd(event: DragEvent) {
    this.draggingIndex = undefined;
    const dragItem = event.target as HTMLElement;
    if (dragItem) {
      dragItem.classList.remove('placeholder');
    }

    if (!event.dataTransfer) {
      return;
    }

    if (event.dataTransfer.dropEffect !== 'move') {
      this.updatedPageDesignPartialIds = [...this.originPageDesignPartialIds];
      this.updateSelectedPartialDesignLists();
      return;
    }

    this.isLoading = true;

    const result = await firstValueFrom(
      this.pageTemplatesService.assignPageDesignPartials(this.pageDesign.id, this.updatedPageDesignPartialIds),
    );

    this.isLoading = false;
    if (!result.success) {
      this.showErrorMessage(result.errorMessage);
      this.updatedPageDesignPartialIds = [...this.originPageDesignPartialIds];
      this.updateSelectedPartialDesignLists();
      return;
    }

    this.originPageDesignPartialIds = [...this.updatedPageDesignPartialIds];
    this.reloadIframe();
  }

  private updateLists(allPartialDesignItems: Item[], pageDesignPartialIds: string[]) {
    this.allPartialDesignItems = allPartialDesignItems;
    this.originPageDesignPartialIds = pageDesignPartialIds.filter((id) =>
      allPartialDesignItems.some((item) => item.itemId === id),
    );
    this.updatedPageDesignPartialIds = [...this.originPageDesignPartialIds];
    this.updateAvailablePartialDesignLists();
    this.updateSelectedPartialDesignLists();
  }

  private updateAvailablePartialDesignLists() {
    this.availablePartialDesignItems = this.allPartialDesignItems.filter((item) => {
      return !this.originPageDesignPartialIds.includes(item.itemId);
    });
  }

  private updateSelectedPartialDesignLists() {
    this.selectedPartialDesignItems = [];
    this.pageTemplatesService.setSelectedPartialDesignItems([]);
    this.updatedPageDesignPartialIds.forEach(async (id) => {
      const partial = this.allPartialDesignItems.find((item) => item.itemId === id);
      if (partial) {
        this.selectedPartialDesignItems.push(partial);
        this.pageTemplatesService.setSelectedPartialDesignItems(this.selectedPartialDesignItems);
      }
    });
  }

  private reloadIframe() {
    this.contextService.updateContext({});
  }

  private reorderItem(fromIndex: number, toIndex: number) {
    const itemToBeReordered = this.updatedPageDesignPartialIds.splice(fromIndex, 1)[0];
    this.updatedPageDesignPartialIds.splice(toIndex, 0, itemToBeReordered);
    this.draggingIndex = toIndex;

    this.updateSelectedPartialDesignLists();
  }

  private async showErrorMessage(errorMessage?: string | null) {
    const errorInApiRequest = await firstValueFrom(
      this.translateService.get('PAGE_DESIGNS.WORKSPACE.BAD_REQUEST_ERROR_MESSAGE'),
    );

    const notification = new TimedNotification('pageDesignRequestError', errorMessage || errorInApiRequest, 'error');
    this.timedNotificationsService.pushNotification(notification);
  }

  navigateToTemplatesView() {
    this.router.navigate(['/templates/pagetemplates'], {
      queryParams: {
        sc_itemid: this.contextService.itemId,
        sc_version: this.contextService.itemVersion,
      },
      queryParamsHandling: 'merge',
    });
  }
}
