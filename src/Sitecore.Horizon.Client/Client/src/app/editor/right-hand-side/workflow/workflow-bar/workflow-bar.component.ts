/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { VersionsWorkflowService } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { ItemWorkflow, WorkflowCommand, WorkflowErrorCode } from 'app/shared/graphql/item.interface';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { take } from 'rxjs';
import { WorkflowConfirmationDialogService } from '../workflow-confirmation-dialog/workflow-confirmation-dialog.service';
import { WorkflowNotificationService } from '../workflow-notification.service';

@Component({
  selector: 'app-workflow-bar',
  templateUrl: './workflow-bar.component.html',
  styleUrls: ['./workflow-bar.component.scss'],
})
export class WorkflowBarComponent implements OnInit, OnDestroy {
  private readonly lifetime = new Lifetime();
  workflowInProgress = false;
  workflow: ItemWorkflow | null = null;
  warning = '';
  isLoading = true;

  constructor(
    private readonly versionsWorkflowService: VersionsWorkflowService,
    private readonly context: ContextService,
    private readonly workflowConfirmationDialogService: WorkflowConfirmationDialogService,
    private readonly workflowNotificationsService: WorkflowNotificationService,
  ) {}

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  ngOnInit(): void {
    this.context.value$.pipe(takeWhileAlive(this.lifetime)).subscribe(() => this.onContextChange());
    this.watchItemWorkflowInfo();
  }

  executeCommand(command: WorkflowCommand) {
    if (command.suppressComment) {
      this.runWorkflowCommand(command, '');
      return;
    }
    this.workflowConfirmationDialogService
      .show()
      .pipe(take(1))
      .subscribe(async ({ state, comment }) => {
        if (state === 'submitted') {
          this.runWorkflowCommand(command, comment);
        }
      });
  }

  private async runWorkflowCommand(command: WorkflowCommand, comment: string): Promise<void> {
    try {
      this.workflowInProgress = true;
      const result = await this.versionsWorkflowService.executeCommand(command.id, comment, this.context.value);
      const pageItemResultError = result?.error;
      const dsItemResultError = result?.datasourcesCommandResult?.find((r) => r.error)?.error;
      if (pageItemResultError) {
        await this.workflowNotificationsService.showExecuteCommandErrorNotification(
          command.id,
          pageItemResultError,
          'page',
        );
      } else if (dsItemResultError) {
        await this.workflowNotificationsService.showExecuteCommandErrorNotification(
          command.id,
          dsItemResultError,
          'datasource',
        );
      }
      if (result?.pageWorkflowValidationResult) {
        await this.workflowNotificationsService.showValidationResultErrorsNotification(
          result.pageWorkflowValidationResult,
        );
      }
    } finally {
      this.workflowInProgress = false;
    }
  }

  private watchItemWorkflowInfo() {
    this.versionsWorkflowService
      .watchVersionsAndWorkflow()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(({ workflow }) => {
        this.isLoading = false;
        this.setWorkflowInfo(workflow);
      });
  }

  private onContextChange() {
    // Reset in progress state when the context changes.
    this.workflowInProgress = false;
    this.isLoading = true;
  }

  private setWorkflowInfo(workflow: ItemWorkflow | null) {
    this.workflow = workflow;

    if (!workflow) {
      return;
    }

    // Show the first warning message as backend always returns a single warning.
    if (workflow.warnings.length !== 0) {
      this.warning = this.resolveWarningMessageFromErrorCode(workflow.warnings[0].errorCode);
    }
  }

  private resolveWarningMessageFromErrorCode(errorCode: WorkflowErrorCode): string {
    switch (errorCode) {
      case 'ItemLockedByAnotherUser':
        return 'EDITOR.WORKFLOW.WARNINGS.ITEM_LOCKED_BY_ANOTHER_USER';
      case 'SomeDatasourcesAreLocked':
        return 'EDITOR.WORKFLOW.WARNINGS.DATASOURCE_LOCKED_BY_ANOTHER_USER';
      case 'NoAccessRightItemWrite':
        return 'EDITOR.WORKFLOW.WARNINGS.NO_WRITE_ACCESS';
      case 'NoAccessRightWorkflowWrite':
      case 'NoAccessRightWorkflowCommandExecute':
        return 'EDITOR.WORKFLOW.WARNINGS.NO_WORKFLOW_WRITE_ACCESS';
      default:
        return 'EDITOR.WORKFLOW.WARNINGS.UNKNOWN_SERVER_ERROR';
    }
  }
}
