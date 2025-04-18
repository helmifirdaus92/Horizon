/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener, OnInit } from '@angular/core';
import { Item, PAGE_BRANCH_TEMPLATE_ID, TenantPageTemplate } from 'app/page-design/page-templates.types';
import { EMPTY, firstValueFrom, Observable, tap } from 'rxjs';

import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { CanvasUrlBuilder } from 'app/shared/canvas/url-builder';
import { ContextService, RequiredContext } from 'app/shared/client-state/context.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';

@Component({
  selector: 'app-create-page-branch-dialog',
  templateUrl: './create-page-branch-dialog.component.html',
  styleUrls: ['./create-page-branch-dialog.component.scss'],
})
export class CreatePageBranchDialogComponent implements OnInit {
  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly pageTemplatesService: PageTemplatesService,
    private readonly contextService: ContextService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly canvasUrlBuilder: CanvasUrlBuilder,
    private readonly itemDalService: BaseItemDalService,
    private readonly router: Router,
  ) {}

  existingNames: string[] = [];
  parentId = '';
  language = '';

  selectedTemplate: TenantPageTemplate | undefined = undefined;
  tenantTemplates$: Observable<TenantPageTemplate[]> = EMPTY;

  pageBranchItemName = '';
  isLoading = true;
  apiErrorMessage: string | null = null;

  readonly onCreate = new EventEmitter<{ branchItem: Item | null; rootPageItem: Item | null }>();

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
    this.apiErrorMessage = null;
  }

  ngOnInit() {
    this.tenantTemplates$ = this.pageTemplatesService
      .getTenantPageTemplates(this.contextService.siteName)
      .pipe(tap(() => (this.isLoading = false)));
  }

  close() {
    this.closeHandle.close();
  }

  async createPageBranch(templateId: string | undefined, branchName: string) {
    if (!templateId || !branchName) {
      throw Error('Template Id and branch name cannot be empty.');
    }

    this.isLoading = true;

    const createBranchResult = await firstValueFrom(
      this.pageTemplatesService.createItem(branchName, this.parentId, PAGE_BRANCH_TEMPLATE_ID, this.language),
    );

    if (!createBranchResult.successful || !createBranchResult.item) {
      this.apiErrorMessage = createBranchResult.errorMessage;
      this.showErrorMessage(this.apiErrorMessage);
      this.isLoading = false;
      return;
    }

    const createRootPageResult = await firstValueFrom(
      this.pageTemplatesService.createItem('$name', createBranchResult.item?.itemId, templateId, this.language),
    );

    if (!createRootPageResult.successful || !createRootPageResult.item) {
      this.apiErrorMessage = createRootPageResult.errorMessage;
      this.showErrorMessage(this.apiErrorMessage);
      this.isLoading = false;
      return;
    }

    this.onCreate.next({ branchItem: createBranchResult.item, rootPageItem: createRootPageResult.item });
    this.onCreate.complete();
    this.close();
  }

  async previewMappedPageDesign(pageDesignId?: string) {
    if (!pageDesignId) {
      return;
    }

    const pageDesignItem = await firstValueFrom(
      this.itemDalService.getItem(pageDesignId, this.contextService.language, this.contextService.siteName),
    );
    const context: RequiredContext = {
      itemId: pageDesignId,
      language: this.contextService.language,
      siteName: this.contextService.siteName,
    };
    const previewUrl = await this.canvasUrlBuilder.buildPreviewModeUrl(context, pageDesignItem.route);

    window.open(previewUrl, '_blank');
  }

  openPageTemplates() {
    this.close();
    this.router.navigate(['/templates/pagetemplates']);
  }

  private async showErrorMessage(errorMessage: string | null) {
    const errorInApiRequest = await firstValueFrom(
      this.translateService.get('PAGE_DESIGNS.WORKSPACE.BAD_REQUEST_ERROR_MESSAGE'),
    );

    const notification = new TimedNotification('createPageBranch', errorMessage || errorInApiRequest, 'error');
    this.timedNotificationsService.pushNotification(notification);
  }
}
