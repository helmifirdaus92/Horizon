/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { VersionsWorkflowService } from 'app/editor/shared/versions-workflow/versions-workflow.service';

import { VariantPublishedStatusService } from 'app/pages/left-hand-side/personalization/personalization-services/variant-published-status.service';
import { ContextHelper } from 'app/shared/client-state/context.helper';
import { Context, ContextService } from 'app/shared/client-state/context.service';
import { PublishingService } from 'app/shared/graphql/publishing.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { WorkflowNotificationService } from '../workflow-notification.service';

type ContextWithDisplayName = Context & { displayName: string };

export type PublishableStatus = 'noAccessRights' | 'notPublishableVersion' | 'notLatestPublishable' | 'publishable';

export interface PublishButtonState {
  enabled: boolean;
  title?: string;
  titleArgs?: Record<string, any>;
}

@Component({
  selector: 'app-publish-button',
  templateUrl: './publish-button.component.html',
  styleUrls: ['./publish-button.component.scss'],
})
export class PublishButtonComponent implements OnInit, OnDestroy {
  private readonly lifetime = new Lifetime();
  publishInProgress = false;
  isLoading = true;
  buttonState: PublishButtonState = {
    enabled: false,
  };
  withSubpages: boolean;
  withLanguages: boolean;

  constructor(
    private readonly publishingService: PublishingService,
    private readonly workflowNotificationsService: WorkflowNotificationService,
    private readonly context: ContextService,
    private readonly versionsWorkflowService: VersionsWorkflowService,
    private readonly variantPublishedStatusService: VariantPublishedStatusService,
    private readonly siteService: SiteService,
  ) {}

  ngOnInit(): void {
    this.context.value$.pipe(takeWhileAlive(this.lifetime)).subscribe(() => this.onContextChange());
    this.versionsWorkflowService
      .watchVersionsAndWorkflow()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(({ permissions, publishing, isLatestPublishableVersion, versions }) => {
        this.isLoading = false;
        if (!permissions.canPublish) {
          this.setPublishButtonState('noAccessRights');
          return;
        }

        if (!publishing.hasPublishableVersion || !publishing.isPublishable) {
          this.setPublishButtonState('notPublishableVersion');
          return;
        }

        if (!isLatestPublishableVersion) {
          const otherLatestPublishableVersion = versions.filter((version) => version.isLatestPublishableVersion)[0];
          if (otherLatestPublishableVersion) {
            this.setPublishButtonState('notLatestPublishable', {
              version: otherLatestPublishableVersion.versionNumber,
              versionName: otherLatestPublishableVersion.name,
            });
          } else {
            this.setPublishButtonState('notPublishableVersion');
          }

          return;
        }

        this.setPublishButtonState('publishable');
      });
  }

  ngOnDestroy() {
    this.lifetime.dispose();
  }

  async publish() {
    // Copy the context at the moment the action is performed.
    const { displayName } = await this.context.getItem();
    const boundContext: ContextWithDisplayName = { ...this.context.value, ...{ displayName } };

    const publishFailed = () => {
      this.clearPublishInProgress(boundContext);
      this.onPublishFailed(boundContext.itemId);
    };

    this.publishInProgress = true;

    // eslint-disable-next-line max-len
    const siteLanguages = this.siteService
      .getSiteLanguages(boundContext.siteName)
      .map((lang) => lang?.name)
      .filter((name): name is string => !!name);

    const availableLanguages: string[] = this.withLanguages ? siteLanguages : [boundContext.language];

    this.publishingService
      .publishItem({
        rootItemId: boundContext.itemId,
        publishSubItems: this.withSubpages,
        languages: availableLanguages,
        publishRelatedItems: true,
        publishItemMode: 'SMART',
      })
      .subscribe({
        next: ({ operationId }) =>
          operationId ? this.trackPublishingStatus(operationId, this.withSubpages, boundContext) : publishFailed(),
        error: () => publishFailed(),
      });
  }

  private trackPublishingStatus(operationId: string, publishSubItems: boolean, context: ContextWithDisplayName) {
    this.publishingService
      .watchPublishingStatus(operationId)
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe({
        next: ({ isDone, isFailed, processed }) => {
          if (isDone) {
            this.clearPublishInProgress(context);
            this.workflowNotificationsService.showSuccessNotification(
              context.itemId,
              context.displayName,
              publishSubItems ? processed : undefined,
            );
            this.variantPublishedStatusService.updateLivePageVariantsCheckStatus(true);
          } else if (isFailed) {
            this.clearPublishInProgress(context);
            this.onPublishFailed(context.itemId);
          }
        },

        error: () => {
          this.clearPublishInProgress(context);
          this.onPublishFailed(context.itemId);
        },
      });
  }

  private setPublishButtonState(state: PublishableStatus, titleArgs?: Record<string, any>) {
    switch (state) {
      case 'noAccessRights':
        this.buttonState = {
          enabled: false,
          title: 'EDITOR.WORKFLOW.NO_ACCESS_RIGHTS_TO_PUBLISH',
        };
        break;
      case 'notPublishableVersion':
        this.buttonState = {
          enabled: false,
          title: 'EDITOR.WORKFLOW.NOT_PUBLISHABLE_VERSION_WARNING_TEXT',
        };
        break;
      case 'notLatestPublishable':
        this.buttonState = {
          enabled: false,
          title: 'EDITOR.WORKFLOW.NOT_LATEST_PUBLISHABLE',
          titleArgs,
        };
        break;
      case 'publishable':
        this.buttonState = {
          enabled: true,
        };
        break;
    }
  }

  private clearPublishInProgress(context: Context) {
    // Check the context hasn't changed.
    // If it changed then inProgress state doesnt have to do with this context and should be ignored
    if (ContextHelper.areEqual(this.context.value, context)) {
      this.publishInProgress = false;
    }
  }

  private onPublishFailed(itemId: string) {
    this.workflowNotificationsService.showOnPublishFailedNotification(itemId);
  }

  private onContextChange() {
    // Reset in progress state when the context changes.
    this.publishInProgress = false;
    this.isLoading = true;
    this.withLanguages = false;
    this.withSubpages = false;
  }
}
