/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { TableHeader } from 'app/analytics/analytics.types';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { LHSNavigationService } from 'app/pages/left-hand-side/lhs-navigation.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { XmCloudFeatureCheckerService } from 'app/shared/xm-cloud/xm-cloud-feature-checker.service';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  finalize,
  firstValueFrom,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { PageTemplatesService } from '../page-templates.service';
import { InsertOption, Item, TEMPLATE_ROOT_ITEM_ID, TenantPageTemplate } from '../page-templates.types';
import { DuplicateItemDialogService } from '../shared/duplicate-item-dialog/duplicate-item-dialog.service';
import { RenameItemDialogService } from '../shared/rename-item-dialog/rename-item-dialog.service';
import { AssignPageDesignDialogService } from '../templates-view/assign-page-design-dialog/assign-page-design-dialog.service';
import { FeatureNotAvailableDialogComponent } from '../templates-view/feature-not-available-dialog/feature-not-available-dialog.component';
import { InsertOptionsConfigurationsDialogService } from './insert-options-configurations-dialog/insert-options-configurations-dialog.service';

interface PageTemplateWithDetails {
  template: Item;
  pageDesign: Item | null;
  usageCount: number;
  insertOptions?: InsertOption[];
}

@Component({
  selector: 'app-page-templates',
  templateUrl: './page-templates.component.html',
  styleUrls: ['./page-templates.component.scss'],
})
export class PageTemplatesComponent implements OnInit, OnDestroy {
  activeNavigation$: Observable<string> = EMPTY;
  featureNotAvailable$: Observable<boolean> = EMPTY;

  pageTemplates: TenantPageTemplate[] = [];
  selectedTemplate$ = new BehaviorSubject<TenantPageTemplate | null>(null);
  private _refetchPageTemplates$ = new BehaviorSubject<boolean>(false);
  pageTemplatesWithDetails?: PageTemplateWithDetails[];

  headers?: TableHeader[];

  isLoadingDetails = false;
  isWaitingResult = false;
  isLoadingTemplates = true;

  unsubscribe$ = new Subject();

  isTemplateAccessFieldSupported = false;
  isTemplateStandardValuesAvailable = false;

  // Remove when new design is released
  useNewDesign = false;
  templateUsedByPagesCount?: number;
  templateDetails?: Item;

  constructor(
    private readonly lhsNavService: LHSNavigationService,
    private readonly pageTemplatesService: PageTemplatesService,
    private readonly contextService: ContextService,
    private readonly translateService: TranslateService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly assignPageDesignDialogService: AssignPageDesignDialogService,
    private readonly dialogService: DialogOverlayService,
    private readonly xmCloudFeatureCheckerService: XmCloudFeatureCheckerService,
    private readonly insertOptionsConfigurationsDialogService: InsertOptionsConfigurationsDialogService,
    private readonly renameItemDialogService: RenameItemDialogService,
    private readonly duplicateItemDialogService: DuplicateItemDialogService,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.headers = [
      {
        fieldName: 'name',
        label: 'PAGE_DESIGNS.WORKSPACE.TEMPLATES_TABLE.TEMPLATE_NAME',
      },
      {
        fieldName: 'assignedPageDesign',
        label: 'PAGE_DESIGNS.WORKSPACE.TEMPLATES_TABLE.ASSIGNED_PAGE_DESIGN',
      },
      {
        fieldName: 'insertOptions',
        label: 'PAGE_DESIGNS.WORKSPACE.TEMPLATES_TABLE.INSERT_OPTIONS',
      },
      {
        fieldName: 'numberOfPagesUsedOn',
        label: 'PAGE_DESIGNS.WORKSPACE.TEMPLATES_TABLE.NUMBER_OF_PAGES_USED_ON',
      },
      {
        fieldName: 'lastModified',
        label: 'PAGE_DESIGNS.WORKSPACE.TEMPLATES_TABLE.LAST_MODIFIED',
      },
    ];

    this.featureNotAvailable$ = this.pageTemplatesService.isPageTemplatesFeatureAvailable();
    this.isTemplateAccessFieldSupported = await this.xmCloudFeatureCheckerService.isTemplateAccessFieldAvailable();
    this.isTemplateStandardValuesAvailable =
      await this.xmCloudFeatureCheckerService.isTemplateStandardValuesAvailable();
    this.useNewDesign = this.featureFlagsService.isFeatureEnabled('pages_show-templates-design-updates');
    this.activeNavigation$ = this.lhsNavService.watchRouteSegment();

    combineLatest([this.contextService.siteName$, this._refetchPageTemplates$, this.featureNotAvailable$])
      .pipe(
        switchMap(([siteName, _, featureNotAvailable]) => {
          if (featureNotAvailable) {
            FeatureNotAvailableDialogComponent.show(this.dialogService);
            return of([]);
          } else {
            this.isLoadingTemplates = true;
            return this.pageTemplatesService.getTenantPageTemplates(siteName).pipe(
              catchError(() => {
                this.showRequestFailErrorMessage();
                return of([]);
              }),
              finalize(() => {
                this.isLoadingTemplates = false;
              }),
            );
          }
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(async (templates: TenantPageTemplate[]) => {
        this.pageTemplates = templates;

        if (this.useNewDesign) {
          this.pageTemplatesWithDetails = await this.getTemplateDetails(templates);
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$?.next(undefined);
    this.unsubscribe$?.complete();
  }

  async assignPageDesign(templateId: string, pageDesignItemId?: string) {
    const success = await firstValueFrom(
      this.assignPageDesignDialogService.show(templateId, this.pageTemplates, pageDesignItemId),
    );
    if (success) {
      this._refetchPageTemplates$.next(true);
    }
  }

  async showRequestFailErrorMessage() {
    const errorInApiRequest = await firstValueFrom(
      this.translateService.get('PAGE_DESIGNS.WORKSPACE.BAD_REQUEST_ERROR_MESSAGE'),
    );

    const notification = new TimedNotification('templateDesignRequestError', errorInApiRequest, 'error');
    this.timedNotificationsService.pushNotification(notification);
  }

  openTemplateInContentEditor(templateId: string = TEMPLATE_ROOT_ITEM_ID) {
    const platformUrl = ConfigurationService.xmCloudTenant?.url;
    const contentEditorTemplateLink = `${platformUrl}sitecore/shell/Applications/Content%20Editor.aspx?fo=${templateId}&lang=${this.contextService.language}`;
    window.open(contentEditorTemplateLink, '_blank');
  }

  async getTemplateDetails(templates: TenantPageTemplate[]): Promise<PageTemplateWithDetails[]> {
    return await Promise.all(
      templates.map(async (template) => {
        const detailedTemplateItem = await firstValueFrom(
          this.pageTemplatesService.getItemDetails(template.template.templateId, this.contextService.language),
        );

        const usageCount = await firstValueFrom(
          this.pageTemplatesService.getTemplateUsageCount(template.template.templateId),
        );
        return {
          template: detailedTemplateItem,
          pageDesign: template.pageDesign,
          usageCount,
          insertOptions: template.template.standardValuesItem?.insertOptions?.filter((option) =>
            templates.some((t) => t.template.templateId === option.templateId),
          ),
        };
      }),
    );
  }

  async renameTemplate(pageTemplate: PageTemplateWithDetails): Promise<void> {
    const renamedItem = await firstValueFrom(
      this.renameItemDialogService.show({
        itemId: pageTemplate.template.itemId,
        itemName: pageTemplate.template.name,
        existingNames: this.pageTemplates.map((item) => item.template.name),
      }),
    ).catch(() => undefined);

    if (renamedItem && this.pageTemplatesWithDetails) {
      const itemIndex = this.pageTemplates.findIndex(
        (template) => template.template.templateId === pageTemplate.template.itemId,
      );
      const tenantPageTemplate = {
        template: {
          templateId: renamedItem.itemId,
          name: renamedItem.name,
          access: renamedItem.access,
        },
        pageDesign: pageTemplate.pageDesign,
      };

      this.pageTemplates[itemIndex].template = tenantPageTemplate.template;

      if (this.pageTemplatesWithDetails) {
        const templateItemIndex = this.pageTemplatesWithDetails?.findIndex(
          (template) => template.template.itemId === pageTemplate.template.itemId,
        );
        this.pageTemplatesWithDetails[templateItemIndex] = (await this.getTemplateDetails([tenantPageTemplate]))[0];
      }
    }
  }

  async duplicateTemplate(pageTemplate: PageTemplateWithDetails): Promise<void> {
    const templateDetails = await firstValueFrom(
      this.pageTemplatesService.getItemDetails(pageTemplate.template.itemId, this.contextService.language),
    );

    const duplicatedItem = await firstValueFrom(
      this.duplicateItemDialogService.show({
        itemId: pageTemplate.template.itemId,
        parentId: templateDetails.parentId || '',
        name: pageTemplate.template.name,
        existingNames: this.pageTemplates.map((item) => item.template.name),
        pageDesignId: pageTemplate.pageDesign?.itemId,
      }),
    ).catch(() => undefined);

    if (duplicatedItem && this.pageTemplatesWithDetails) {
      const tenantPageTemplate = {
        template: {
          templateId: duplicatedItem.itemId,
          name: duplicatedItem.displayName,
          access: duplicatedItem.access,
        },
        pageDesign: pageTemplate.pageDesign,
      };
      this.pageTemplates.push(tenantPageTemplate);
      this.pageTemplatesWithDetails.push((await this.getTemplateDetails([tenantPageTemplate]))[0]);
    }
  }

  // Remove when new design is released
  async selectTemplate(pageTemplate: TenantPageTemplate) {
    this.selectedTemplate$.next(pageTemplate);

    this.isLoadingDetails = true;
    this.templateUsedByPagesCount = await firstValueFrom(
      this.pageTemplatesService.getTemplateUsageCount(pageTemplate.template.templateId),
    );

    // We need to fetch template details through item details, as template GraphQL field does not support querying
    // the individual fields, and fields also does not include created and updated dates
    this.templateDetails = await firstValueFrom(
      this.pageTemplatesService.getItemDetails(pageTemplate.template.templateId, this.contextService.language),
    );
    this.isLoadingDetails = false;
  }

  // Remove when new design is released
  async oldRenameTemplate(pageTemplate: TenantPageTemplate): Promise<void> {
    const renamedItem = await firstValueFrom(
      this.renameItemDialogService.show({
        itemId: pageTemplate.template.templateId,
        itemName: pageTemplate.template.name,
        existingNames: this.pageTemplates.map((item) => item.template.name),
      }),
    ).catch(() => undefined);

    if (renamedItem) {
      const itemIndex = this.pageTemplates.findIndex(
        (template) => template.template.templateId === pageTemplate.template.templateId,
      );
      this.pageTemplates[itemIndex].template = {
        templateId: renamedItem.itemId,
        name: renamedItem.name,
        access: renamedItem.access,
      };
    }
  }

  // Remove when new design is released
  async oldDuplicateTemplate(pageTemplate: TenantPageTemplate): Promise<void> {
    const templateDetails = await firstValueFrom(
      this.pageTemplatesService.getItemDetails(pageTemplate.template.templateId, this.contextService.language),
    );

    const duplicatedItem = await firstValueFrom(
      this.duplicateItemDialogService.show({
        itemId: pageTemplate.template.templateId,
        parentId: templateDetails.parentId || '',
        name: pageTemplate.template.name,
        existingNames: this.pageTemplates.map((item) => item.template.name),
        pageDesignId: pageTemplate.pageDesign?.itemId,
      }),
    ).catch(() => undefined);

    if (duplicatedItem) {
      this.pageTemplates.push({
        template: {
          templateId: duplicatedItem.itemId,
          name: duplicatedItem.displayName,
          access: duplicatedItem.access,
        },
        pageDesign: pageTemplate.pageDesign,
      });
    }
  }

  async configureInsertOptions(templateId: string) {
    const success = await firstValueFrom(
      this.insertOptionsConfigurationsDialogService.show({
        templateId,
        templatesList: this.pageTemplates,
      }),
    ).catch(() => undefined);

    if (success) {
      this._refetchPageTemplates$.next(true);
    }
  }

  async promptDeleteTemplate(templateId: string) {
    const { component: dialog } = WarningDialogComponent.show(this.dialogService);

    dialog.title = await firstValueFrom(this.translateService.get('COMMON.DELETE'));
    dialog.text = await firstValueFrom(
      this.translateService.get('PAGE_DESIGNS.WORKSPACE.DELETE_PAGE_TEMPLATE_DIALOG_TEXT'),
    );

    dialog.declineText = await firstValueFrom(this.translateService.get('COMMON.CANCEL'));
    dialog.confirmText = await firstValueFrom(this.translateService.get('COMMON.DELETE'));

    const result = await firstValueFrom(dialog.dialogResultEvent);
    if (result.confirmed) {
      await this.deleteTemplate(templateId);
    }
  }

  private async deleteTemplate(templateId: string) {
    this.isWaitingResult = true;

    const result = await firstValueFrom(this.pageTemplatesService.deleteItem(templateId, false));

    this.isWaitingResult = false;

    if (result.successful) {
      const itemIndex = this.pageTemplates.findIndex((template) => template.template.templateId === templateId);
      this.pageTemplates.splice(itemIndex, 1);

      if (this.useNewDesign && this.pageTemplatesWithDetails) {
        const templateItemIndex = this.pageTemplatesWithDetails?.findIndex(
          (template) => template.template.itemId === templateId,
        );
        this.pageTemplatesWithDetails.splice(templateItemIndex, 1);
      }
    } else {
      this.showErrorMessage(result.errorMessage);
    }
  }

  private async showErrorMessage(errorMessage: string | null) {
    const errorInApiRequest = await firstValueFrom(
      this.translateService.get('PAGE_DESIGNS.WORKSPACE.BAD_REQUEST_ERROR_MESSAGE'),
    );

    const notification = new TimedNotification('pageTemplateRequestError', errorMessage || errorInApiRequest, 'error');
    this.timedNotificationsService.pushNotification(notification);
  }
}
