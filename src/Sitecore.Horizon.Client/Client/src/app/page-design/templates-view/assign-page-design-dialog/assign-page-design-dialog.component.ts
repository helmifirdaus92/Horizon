/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener, OnInit } from '@angular/core';
import { ConfigurePageDesignsInput, ItemWithSite, TenantPageTemplate } from 'app/page-design/page-templates.types';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { BehaviorSubject, EMPTY, firstValueFrom, Observable, tap } from 'rxjs';

import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { CanvasUrlBuilder } from 'app/shared/canvas/url-builder';
import { ContextService, RequiredContext } from 'app/shared/client-state/context.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';

@Component({
  selector: 'app-assign-page-design-dialog',
  templateUrl: './assign-page-design-dialog.component.html',
  styleUrls: ['./assign-page-design-dialog.component.scss'],
})
export class AssignPageDesignDialogComponent implements OnInit {
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

  templateId = '';
  alreadyAssignedDesignId: string | undefined;
  selectedPageDesign$ = new BehaviorSubject<ItemWithSite | undefined>(undefined);
  pageDesigns$: Observable<ItemWithSite[]> = EMPTY;

  tenantPageTemplates: TenantPageTemplate[] = [];
  readonly onAssign = new EventEmitter<boolean>();

  get templateName(): string | undefined {
    return this.tenantPageTemplates.find((template) => template.template.templateId === this.templateId)?.template.name;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  ngOnInit() {
    this.pageDesigns$ = this.pageTemplatesService.getPageDesignsList(this.contextService.siteName).pipe(
      tap((designItems: ItemWithSite[]) => {
        const alreadySelectedDesign = designItems.find((design) => design.itemId === this.alreadyAssignedDesignId);
        this.selectedPageDesign$.next(alreadySelectedDesign);
      }),
    );
  }

  close() {
    this.closeHandle.close();
  }

  async assignPageDesign() {
    const selectedPageDesign = this.selectedPageDesign$?.value;
    const configurePageDesign: ConfigurePageDesignsInput = {
      siteName: this.contextService.siteName,
      mapping: [
        {
          templateId: this.templateId,
          pageDesignId: selectedPageDesign?.itemId,
        },
      ],
    };
    const result = await firstValueFrom(this.pageTemplatesService.configurePageDesign(configurePageDesign));

    if (!result.success) {
      this.showErrorMessage(result?.errorMessage);
    }

    this.onAssign.next(result.success ?? false);
    this.onAssign.complete();
    this.close();
  }

  getPageDesignUsageCount(pageDesignId?: string): number {
    return pageDesignId
      ? this.tenantPageTemplates.filter((template) => template.pageDesign?.itemId === pageDesignId).length
      : 0;
  }

  deselectPageDesign() {
    this.selectedPageDesign$.next(undefined);
  }

  previewSelectedPageDesign() {
    const pageDesign = this.selectedPageDesign$?.value;
    if (!pageDesign?.itemId) {
      return;
    }

    this.openPageDesignPreview(pageDesign?.itemId);
  }

  async openPageDesignPreview(pageDesignId?: string) {
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

  openPageDesigns() {
    this.close();
    this.router.navigate(['/templates/pagedesigns']);
  }

  private async showErrorMessage(errorMessage: string | null) {
    const errorInApiRequest = await firstValueFrom(
      this.translateService.get('PAGE_DESIGNS.WORKSPACE.BAD_REQUEST_ERROR_MESSAGE'),
    );

    const notification = new TimedNotification('pageTemplateAssignError', errorMessage || errorInApiRequest, 'error');
    this.timedNotificationsService.pushNotification(notification);
  }

  getSourceSite(pageDesign?: ItemWithSite | null): string | undefined {
    const siteName = pageDesign?.siteName;
    const isFromSharedSite = siteName !== this.contextService.siteName;
    return isFromSharedSite ? siteName : undefined;
  }
}
