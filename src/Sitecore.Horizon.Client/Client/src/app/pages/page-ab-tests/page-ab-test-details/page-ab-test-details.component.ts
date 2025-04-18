/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { ComponentFlowDefinitionWithPublishedStatus } from '../page-ab-tests-dialog.component';
import { AbTestAnalyticsService } from '../services/ab-test-analytics.service';
import { AB_TEST_FRIENDLY_ID_REGEX } from '../services/performance.types';

@Component({
  selector: 'app-page-ab-test-details',
  templateUrl: './page-ab-test-details.component.html',
  styleUrls: ['./page-ab-test-details.component.scss'],
})
export class PageAbTestDetailsComponent {
  @Input() pageAbTest: ComponentFlowDefinitionWithPublishedStatus;
  @Output() goBack = new EventEmitter<void>();
  @Input() showBackButton: boolean = true;

  tabSelected: 'performance' | 'configuration' = 'performance';

  private readonly editingChannel: EditingMessagingChannel;

  constructor(
    private readonly abTestAnalyticsService: AbTestAnalyticsService,
    private readonly messagingService: MessagingService,
  ) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();
  }

  navigateBack(): void {
    this.goBack.emit();
  }

  isTestEnded(): boolean {
    return this.pageAbTest.status === 'COMPLETED' && this.pageAbTest.isPagePublished;
  }

  async openAnalytics() {
    await this.abTestAnalyticsService.openAnalytics(this.pageAbTest.friendlyId);
  }

  selectTest() {
    const match = this.pageAbTest.friendlyId.match(AB_TEST_FRIENDLY_ID_REGEX);
    if (match && match[2]) {
      const renderingInstanceId = this.formatRenderingInstanceId(match[2]);
      this.editingChannel.rpc.selectRendering(renderingInstanceId, true);
    } else {
      console.warn('Invalid friendlyId format');
    }
  }

  private formatRenderingInstanceId(renderingInstanceId: string): string {
    return renderingInstanceId.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
  }
}
