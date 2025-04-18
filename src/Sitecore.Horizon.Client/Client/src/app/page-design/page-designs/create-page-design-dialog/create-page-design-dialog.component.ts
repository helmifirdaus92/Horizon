/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { ConfigurePageDesignsInput, Item, TenantPageTemplate } from 'app/page-design/page-templates.types';
import { InsertOptionsConfigurationService } from 'app/page-design/shared/insert-options-configuration/insert-options-configuration.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { normalizeGuid } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-page-design-dialog',
  templateUrl: './create-page-design-dialog.component.html',
  styleUrls: ['./create-page-design-dialog.component.scss'],
  providers: [InsertOptionsConfigurationService],
})
export class CreatePageDesignDialogComponent implements AfterViewInit, OnInit {
  @ViewChild('designNameInput', { static: true, read: ElementRef }) inputEl?: ElementRef;
  @ViewChild('designNameInput', { read: NgModel }) designNameInput?: NgModel;
  @ViewChild('templateNameInput', { read: NgModel }) templateNameInput?: NgModel;

  private readonly apiDuplicateNameError = 'is already defined';
  PLACEHOLDER_TEMPLATE_ID = 'placeholder-template-id';
  step: 'create-design-and-assign-template' | 'configure-insert-options' = 'create-design-and-assign-template';
  assignTemplate = false;
  chooseTemplateOptions: 'create-new' | 'assign-existing' | 'copy-existing' = 'assign-existing';

  apiErrorMessage: string | null = null;
  isLoading = true;

  designName = '';
  templateName = '';
  selectedExistingTemplate: TenantPageTemplate | undefined = undefined;
  existingTemplates: TenantPageTemplate[] = [];

  existingDesignNames: string[] = [];
  pageDesignParentId = '';
  pageDesignTemplateId = '';
  language = '';

  createdPageDesign: Item | null = null;

  newTemplate: TenantPageTemplate = {
    pageDesign: null,
    template: {
      templateId: this.PLACEHOLDER_TEMPLATE_ID,
      name: this.templateName,
      standardValuesItem: {
        itemId: '',
        access: {
          canWrite: true,
          canCreate: true,
          canDelete: true,
          canDuplicate: true,
          canRename: true,
        },
        insertOptions: [],
      },
    },
  };

  updatedChildInsertOptions: string[] | undefined = undefined;
  updatedParentInsertOptions: string[] | undefined = undefined;

  get existingTemplateNames(): string[] {
    return this.existingTemplates.map((template) => template.template.name);
  }

  readonly onCreate = new EventEmitter<Item | null>();

  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly insertOptionsConfigurationService: InsertOptionsConfigurationService,
    private readonly pageTemplatesService: PageTemplatesService,
    private readonly contextService: ContextService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.existingTemplates = await this.insertOptionsConfigurationService.getTenantPageTemplatesWithStandardValues();
    this.isLoading = false;
  }

  ngAfterViewInit() {
    this.inputEl?.nativeElement.focus();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
    this.apiErrorMessage = null;
  }

  close() {
    this.onCreate.complete();
    this.closeHandle.close();
  }

  async selectTemplate(selectedTemplateId: string) {
    this.selectedExistingTemplate = this.existingTemplates.find(
      (template) => template.template.templateId === selectedTemplateId,
    );

    if (this.chooseTemplateOptions === 'copy-existing' && this.selectedExistingTemplate) {
      const prefix = await firstValueFrom(this.translateService.get('EDITOR.COPY_OF'));

      let defaultName = prefix + ' ' + this.selectedExistingTemplate.template.name;
      while (this.existingTemplateNames.includes(defaultName)) {
        defaultName = prefix + ' ' + defaultName;
      }
      this.templateName = defaultName;
    }
  }

  updateChildInsertOptions(templateIds: string[]) {
    this.updatedChildInsertOptions = templateIds;
  }

  updateParentInsertOptions(templateIds: string[]) {
    this.updatedParentInsertOptions = templateIds;
  }

  removeNewTemplate() {
    this.existingTemplates = this.existingTemplates.filter(
      (template) => template.template.templateId !== this.PLACEHOLDER_TEMPLATE_ID,
    );
  }

  addNewTemplateWithInsertOptions() {
    if (this.chooseTemplateOptions === 'assign-existing') {
      return;
    }

    this.newTemplate.template.name = this.templateName;
    if (
      this.chooseTemplateOptions === 'copy-existing' &&
      this.newTemplate.template.standardValuesItem &&
      this.selectedExistingTemplate?.template.standardValuesItem
    ) {
      this.newTemplate.template.standardValuesItem.insertOptions =
        this.selectedExistingTemplate.template.standardValuesItem?.insertOptions;
    }

    this.existingTemplates.unshift(this.newTemplate);
  }

  async create() {
    this.isLoading = true;
    const result = await this.createPageDesign();

    if (result.successful) {
      this.apiErrorMessage = null;
      this.createdPageDesign = result.item;
      this.onCreate.next(this.createdPageDesign);
      this.close();
      this.isLoading = false;
    } else {
      this.isLoading = false;
      if (result.errorMessage?.includes(this.apiDuplicateNameError)) {
        this.existingDesignNames.push(this.designName);
      } else {
        this.apiErrorMessage = result.errorMessage;
      }
    }
  }

  async saveChanges() {
    this.isLoading = true;

    if (!this.createdPageDesign) {
      const createPageDesignResult = await this.createPageDesign();
      if (!createPageDesignResult.successful) {
        this.isLoading = false;
        if (createPageDesignResult.errorMessage?.includes(this.apiDuplicateNameError)) {
          this.existingDesignNames.push(this.designName);
        } else {
          this.apiErrorMessage = createPageDesignResult.errorMessage;
        }
        return;
      }

      this.createdPageDesign = createPageDesignResult.item;
    }

    if (this.chooseTemplateOptions === 'assign-existing' && this.selectedExistingTemplate) {
      this.assignPageDesignToTemplate(
        this.createdPageDesign?.itemId,
        this.selectedExistingTemplate.template.templateId,
      );

      if (this.updatedParentInsertOptions || this.updatedChildInsertOptions) {
        this.updateInsertOptions(this.selectedExistingTemplate);
      }
    }

    if (this.chooseTemplateOptions === 'copy-existing' && this.selectedExistingTemplate) {
      const copyTemplateResult = await this.copyTemplateItem(this.selectedExistingTemplate?.template.templateId);

      if (!copyTemplateResult.successful || !copyTemplateResult.item) {
        this.isLoading = false;
        if (copyTemplateResult.errorMessage?.includes(this.apiDuplicateNameError)) {
          this.existingTemplateNames.push(this.templateName);
        } else {
          this.apiErrorMessage = copyTemplateResult?.errorMessage;
        }
        return;
      }

      this.newTemplate = this.toTemplateItem(copyTemplateResult.item);
      this.updateExistingTemplates();

      this.assignPageDesignToTemplate(this.createdPageDesign?.itemId, this.newTemplate?.template.templateId);

      if (this.updatedParentInsertOptions || this.updatedChildInsertOptions) {
        this.updateInsertOptions(this.newTemplate);
      }
    }

    this.isLoading = false;
    this.onCreate.next(this.createdPageDesign);
    this.close();
  }

  private toTemplateItem(item: Item): TenantPageTemplate {
    return {
      pageDesign: null,
      template: {
        templateId: item.itemId,
        name: item.name,
        access: item.access,
        standardValuesItem: item.standardValueItemId
          ? {
              itemId: normalizeGuid(item.standardValueItemId),
              insertOptions: this.selectedExistingTemplate?.template.standardValuesItem?.insertOptions,
            }
          : undefined,
      },
    };
  }

  private updateExistingTemplates() {
    this.existingTemplates = this.existingTemplates.filter(
      (t) => t.template.templateId !== this.PLACEHOLDER_TEMPLATE_ID,
    );

    this.existingTemplates.unshift(this.newTemplate);
  }

  private createPageDesign() {
    return firstValueFrom(
      this.pageTemplatesService.createItem(
        this.designName,
        this.pageDesignParentId,
        this.pageDesignTemplateId,
        this.language,
      ),
    );
  }

  private async assignPageDesignToTemplate(pageDesignId?: string, templateId?: string) {
    if (!templateId || !pageDesignId) {
      return;
    }

    const configurePageDesign: ConfigurePageDesignsInput = {
      siteName: this.contextService.siteName,
      mapping: [
        {
          templateId,
          pageDesignId,
        },
      ],
    };

    const result = await firstValueFrom(this.pageTemplatesService.configurePageDesign(configurePageDesign));

    if (!result.success) {
      const errorLabel = await firstValueFrom(
        this.translateService.get('PAGE_DESIGNS.WORKSPACE.ERROR_ASSIGN_DESIGN_TO_TEMPLATE'),
      );
      const errorInApiRequest = await firstValueFrom(
        this.translateService.get('PAGE_DESIGNS.WORKSPACE.BAD_REQUEST_ERROR_MESSAGE'),
      );

      const notification = new TimedNotification('pageTemplateAssignDesignError', '', 'warning');
      notification.innerHtml = errorLabel + '<br>' + (result.errorMessage || errorInApiRequest);
      notification.persistent = true;
      this.timedNotificationsService.pushNotification(notification);
    }
  }

  private copyTemplateItem(templateId: string) {
    return firstValueFrom(this.pageTemplatesService.copyItem(this.templateName, templateId, undefined, true));
  }

  private async updateInsertOptions(template: TenantPageTemplate) {
    if (this.updatedChildInsertOptions) {
      const tempTemplateIndex = this.updatedChildInsertOptions.findIndex((id) => id === this.PLACEHOLDER_TEMPLATE_ID);
      if (tempTemplateIndex !== -1) {
        this.updatedChildInsertOptions[tempTemplateIndex] = template.template.templateId;
      }
    }

    if (this.updatedParentInsertOptions) {
      const tempTemplateIndex = this.updatedParentInsertOptions.findIndex((id) => id === this.PLACEHOLDER_TEMPLATE_ID);
      if (tempTemplateIndex !== -1) {
        this.updatedParentInsertOptions[tempTemplateIndex] = template.template.templateId;
      }
    }

    const result = await this.insertOptionsConfigurationService.updateTemplateInsertOptions(
      template,
      this.existingTemplates,
      this.updatedChildInsertOptions,
      this.updatedParentInsertOptions,
    );

    if (!result.success) {
      const errorLabel = await firstValueFrom(
        this.translateService.get(
          'PAGE_DESIGNS.WORKSPACE.INSERT_OPTIONS_DIALOG.ERROR_CONFIGURE_TEMPLATE_INSERT_OPTIONS',
        ),
      );
      const errorInApiRequest = await firstValueFrom(
        this.translateService.get('PAGE_DESIGNS.WORKSPACE.BAD_REQUEST_ERROR_MESSAGE'),
      );

      const notification = new TimedNotification('templateInsertOptionsConfigError', '', 'warning');
      notification.innerHtml = errorLabel + '<br>' + (result.errorMessage || errorInApiRequest);
      notification.persistent = true;
      this.timedNotificationsService.pushNotification(notification);
    }
  }
}
