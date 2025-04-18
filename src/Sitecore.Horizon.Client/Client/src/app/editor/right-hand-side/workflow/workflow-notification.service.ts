/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  ItemValidationRecord,
  ItemValidationResult,
  ValidationResult,
} from 'app/editor/shared/versions-workflow/workflow.dal.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkflowNotificationService {
  constructor(
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
  ) {}

  async showOnPublishFailedNotification(itemId: string): Promise<void> {
    const text$ = this.translateService.get('EDITOR.WORKFLOW.PUBLISH_FAILED');
    await this.timedNotificationsService.push('WorkflowPublishFail-' + itemId, text$, 'error');
  }

  async showSuccessNotification(itemId: string, displayName: string, processedItemsCount: number = -1): Promise<void> {
    if (processedItemsCount !== -1) {
      const text$ = this.translateService.get('EDITOR.WORKFLOW.PUBLISH_WITH_SUBITEMS_SUCCESSFUL', {
        itemName: displayName,
        processedItemsCount,
      });
      await this.timedNotificationsService.push('WorkflowPublishWithSubitemsSuccess-' + itemId, text$, 'success');
    } else {
      const text$ = this.translateService.get('EDITOR.WORKFLOW.PUBLISH_SUCCESSFUL', {
        itemName: displayName,
      });
      await this.timedNotificationsService.push('WorkflowPublishSuccess-' + itemId, text$, 'success');
    }
  }

  async showExecuteCommandErrorNotification(
    selectedCommandId: string,
    error: string,
    source: 'page' | 'datasource',
  ): Promise<void> {
    const pageWasNotMovedByWorkflow = await firstValueFrom(
      this.translateService.get('EDITOR.WORKFLOW.WARNINGS.THE_PAGE_WAS_NOT_MOVED_TO_THE_NEW_WORKFLOW_STATE'),
    );
    const datasourceItemError = await firstValueFrom(
      this.translateService.get('EDITOR.WORKFLOW.WARNINGS.DATA_SOURCE_ITEM_ERROR'),
    );

    const errorWord = await firstValueFrom(this.translateService.get('EDITOR.WORKFLOW.WARNINGS.ERROR'));
    const innerHtml =
      source === 'page'
        ? `<div>${pageWasNotMovedByWorkflow}<p>${errorWord} ${error}</div>`
        : `<div>${pageWasNotMovedByWorkflow}<p>${datasourceItemError} ${error}</div>`;

    const notification = new TimedNotification('WorkflowExecuteCommand-' + selectedCommandId, '', 'warning');
    notification.persistent = true;
    notification.innerHtml = innerHtml;

    this.timedNotificationsService.pushNotification(notification);
  }

  async showValidationResultErrorsNotification(validationResult: ValidationResult): Promise<void> {
    if (!this.pageHasValidationErrors(validationResult)) {
      return;
    }

    // show similar notification for page item and each DS item which have validation errors
    // to do - build advanced dialog and group errors separately for page, DSs and personalized DSs
    let itemsWithErrors: ItemValidationResult[] = [];

    if (validationResult.pageItemResult) {
      itemsWithErrors = itemsWithErrors.concat(validationResult.defaultDatasourceItemsResult);
    }

    if (validationResult.personalizedDatasourceItemsResult) {
      itemsWithErrors = itemsWithErrors.concat(validationResult.personalizedDatasourceItemsResult);
    }

    const filteredItemsWithErrors = this.filterErrorRecords(itemsWithErrors);

    filteredItemsWithErrors.forEach((item) => {
      const notification = new TimedNotification(item.itemId, '', 'warning');
      notification.persistent = true;
      notification.innerHtml = this.buildItemValidationErrorsHtml(item);

      this.timedNotificationsService.pushNotification(notification);
    });
  }

  private buildItemValidationErrorsHtml(result: ItemValidationResult): string {
    let html = 'Workflow validation errors';
    html += `<p><b>Item</b>: [${result.itemName}], <b>ID</b>: [${result.itemId}]`;
    html = this.buildErrorRecordHtml(result.itemRulesResult, html);
    result.fieldRulesResult.forEach((field) => {
      html += `<p><b>Field</b>: [${field.fieldName}], <b>ID</b>: [${field.fieldItemId}]`;
      html = this.buildErrorRecordHtml(field.records, html);
    });
    return html;
  }

  private buildErrorRecordHtml(records: ItemValidationRecord[], html: string) {
    records.forEach((record) => {
      html += `<p>-- ${record.validatorText} (Rule: ${record.validatorTitle} - ${record.validatorDescription})`;
    });
    return html;
  }

  private pageHasValidationErrors(validationResult: ValidationResult): boolean {
    const itemHasValidationErrors = (itemResult: ItemValidationResult) =>
      itemResult.itemRulesResult.some((r) => this.isErrorRecord(r)) ||
      itemResult.fieldRulesResult.some((f) => f.records.some((r) => this.isErrorRecord(r)));

    const pageItemHasErrors = validationResult.pageItemResult
      ? itemHasValidationErrors(validationResult.pageItemResult)
      : false;
    const defaultDatasourcesHaveErrors = validationResult.defaultDatasourceItemsResult.some((i) =>
      itemHasValidationErrors(i),
    );
    const personalizedDatasourcesHaveErrors = validationResult.personalizedDatasourceItemsResult?.some((i) =>
      itemHasValidationErrors(i),
    );

    return pageItemHasErrors || defaultDatasourcesHaveErrors || (personalizedDatasourcesHaveErrors ?? false);
  }

  private filterErrorRecords(results: ItemValidationResult[]): ItemValidationResult[] {
    results.forEach((result) => {
      result.itemRulesResult = result.itemRulesResult.filter((r) => this.isErrorRecord(r));
      result.fieldRulesResult = result.fieldRulesResult
        .map((fr) => {
          return {
            fieldName: fr.fieldName,
            fieldItemId: fr.fieldItemId,
            records: fr.records.filter((r) => this.isErrorRecord(r)),
          };
        })
        .filter((fr) => fr.records.length);
    });

    const filteredResults = results.filter((result) => {
      const hasErros = result.itemRulesResult.length || result.fieldRulesResult.length;
      return hasErros;
    });
    return filteredResults;
  }

  private isErrorRecord(record: ItemValidationRecord) {
    const result =
      record.validatorResult === 'Error' ||
      record.validatorResult === 'CriticalError' ||
      record.validatorResult === 'FatalError';
    return result;
  }
}
