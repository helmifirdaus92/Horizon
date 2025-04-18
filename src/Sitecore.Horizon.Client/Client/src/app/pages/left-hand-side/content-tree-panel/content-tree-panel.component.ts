/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ContextNavigationService } from 'app/shared/client-state/context-navigation.sevice';
import { ContextService } from 'app/shared/client-state/context.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { isSameGuid } from 'app/shared/utils/utils';
import { EMPTY, Observable, distinctUntilChanged, firstValueFrom, map, switchMap } from 'rxjs';
import { CreateFolderService } from '../create-page/create-folder.service';
import { TemplateSelectionDialogService } from '../create-page/template-selection-dialog/template-selection-dialog.service';
import { panelAnimations } from './lhs-slide-in-panel.animations';

@Component({
  selector: 'app-content-tree-area',
  template: `
    <div class="heading-xs px-md pt-xs">{{ 'NAV.SITE_TREE' | translate }}</div>
    <div [hidden]="searchEnabled" class="tree-panel" [class.show-border]="hasScroll">
      <div class="header">
        <ng-spd-header-with-button
          class="p-0 header-create-page"
          [btnText]="'EDITOR.CREATE_PAGE' | translate"
          [icon]="'plus'"
          [isDisabled]="!(canCreate$ | async)"
          size="sm"
          (btnClick)="createPageClick()"
        ></ng-spd-header-with-button>
        <button
          *ngIf="routeSegment !== 'editpagebranch'"
          ngSpdIconButton
          [icon]="'magnify'"
          class="header-search"
          (click)="searchEnabled = true; $event.stopPropagation()"
        ></button>
      </div>
    </div>
    <app-content-tree-container [hidden]="searchEnabled" (scroll)="setScrollState($event)"></app-content-tree-container>

    <app-content-tree-search
      *ngIf="searchEnabled"
      (selectItem)="selectItem($event.id)"
      (closeSearch)="searchEnabled = false"
    ></app-content-tree-search>

    <app-create-folder
      *ngIf="createFolderOn"
      [parentId]="createFolderItem"
      (back)="createFolderOn = false"
      @lhsSlideInPanel
    ></app-create-folder>
  `,
  styleUrls: ['./content-tree-panel.component.scss'],
  animations: panelAnimations,
})
export class ContentTreePanelComponent implements OnInit, OnDestroy {
  createFolderItem = '';
  createFolderOn = false;
  hasScroll = false;
  canCreate$: Observable<boolean> = EMPTY;
  searchEnabled = false;
  routeSegment = '';

  private readonly lifetime = new Lifetime();

  constructor(
    private readonly context: ContextService,
    private readonly contextNavigationService: ContextNavigationService,
    private readonly createFolderService: CreateFolderService,
    private readonly templateSelectionDialogService: TemplateSelectionDialogService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.canCreate$ = this.watchCanCreateItem();

    this.createFolderService.startCreateOperation$
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(({ parentId }) => this.openCreateFolderPanel(parentId));

    this.contextNavigationService.mostInnerRouteSegment$.pipe(takeWhileAlive(this.lifetime)).subscribe((segment) => {
      this.routeSegment = segment;
    });
  }

  ngOnDestroy() {
    this.lifetime.dispose();
  }

  selectItem(itemId: string) {
    this.context.updateContext({ itemId });
  }

  async createPageClick() {
    await firstValueFrom(
      this.templateSelectionDialogService.show(this.context.itemId, (await this.context.getItem()).name),
    );
  }

  setScrollState(event: Event) {
    this.hasScroll = (event.target as HTMLElement).scrollTop > 0;
  }

  private async openCreateFolderPanel(parentId: string) {
    const insertOptions = await firstValueFrom(this.createFolderService.getInsertOptions(parentId));
    if (!insertOptions.length) {
      this.showCreateFolderWarningNotifiction();
      return;
    }
    this.createFolderItem = parentId;
    this.createFolderOn = true;
  }

  private async showCreateFolderWarningNotifiction() {
    const helpLinkUrl = 'https://doc.sitecore.com/xmc/en/developers/xm-cloud/assign-or-copy-insert-options.html';
    const helpLinkText = await firstValueFrom(
      this.translateService.get('PAGE_DESIGNS.WORKSPACE.INSERT_OPTIONS_DIALOG.INSERT_OPTIONS'),
    );
    const baseText = await firstValueFrom(this.translateService.get('WARNING.CREATE_FOLDER_WARNING'));
    const link = `<a href="${helpLinkUrl}" target="_blank">${helpLinkText}</a>`;
    const notificationText = baseText.replace(helpLinkText, link);
    const notification = new TimedNotification('folderInsertOptionsWarning', '');
    notification.innerHtml = notificationText;
    this.timedNotificationsService.pushNotification(notification);
  }

  private watchCanCreateItem(): Observable<boolean> {
    return this.context.value$.pipe(
      distinctUntilChanged((v1, v2) => isSameGuid(v1.itemId, v2.itemId)),
      switchMap(() => this.context.getItem()),
      map((item) => item.permissions.canCreate),
    );
  }
}
