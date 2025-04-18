/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogCloseHandle } from '@sitecore/ng-spd-lib';
import { TenantPageTemplate } from 'app/page-design/page-templates.types';
import { InsertOptionsConfigurationService } from 'app/page-design/shared/insert-options-configuration/insert-options-configuration.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-insert-options-configurations-dialog',
  templateUrl: './insert-options-configurations-dialog.component.html',
  styleUrls: ['./insert-options-configurations-dialog.component.scss'],
  providers: [InsertOptionsConfigurationService],
})
export class InsertOptionsConfigurationsDialogComponent implements OnInit {
  readonly onSave = new EventEmitter<{ success: boolean } | null>();

  templateId = '';
  templatesList: TenantPageTemplate[] = [];
  selectedTemplate: TenantPageTemplate | undefined = undefined;

  isLoading = false;

  updatedChildInsertOptions: string[] | undefined = undefined;
  updatedParentInsertOptions: string[] | undefined = undefined;

  constructor(
    private readonly closeHandle: DialogCloseHandle,
    private readonly insertOptionsConfigurationService: InsertOptionsConfigurationService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoading = true;

    this.templatesList = await this.insertOptionsConfigurationService.getTenantPageTemplatesWithStandardValues();
    this.selectedTemplate = this.templatesList.find((template) => template.template.templateId === this.templateId);

    this.isLoading = false;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  close() {
    this.onSave.complete();
    this.closeHandle.close();
  }

  updateChildInsertOptions(templateIds: string[]) {
    this.updatedChildInsertOptions = templateIds;
  }

  updateParentInsertOptions(templateIds: string[]) {
    this.updatedParentInsertOptions = templateIds;
  }

  async saveChanges() {
    this.isLoading = true;

    if (!this.selectedTemplate) {
      return;
    }

    let success = false;
    if (this.updatedParentInsertOptions || this.updatedChildInsertOptions) {
      success = await this.updateInsertOptions(this.selectedTemplate);
    }

    this.isLoading = false;
    this.onSave.next({ success });
    this.close();
  }

  private async updateInsertOptions(template: TenantPageTemplate) {
    const result = await this.insertOptionsConfigurationService.updateTemplateInsertOptions(
      template,
      this.templatesList,
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

    return result.success;
  }
}
