/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { OptimizeContentPanelService } from '../optimize-content-panel/optimize-content-panel.service';

@Component({
  selector: 'app-optimize-content-button',
  templateUrl: './optimize-content-button.component.html',
  styleUrls: ['./optimize-content-button.component.scss'],
})
export class OptimizeContentButtonComponent {
  @Input() hasTextFields = false;
  hasStreamTenant = false;

  constructor(private optimizeContentPanelService: OptimizeContentPanelService) {
    this.hasStreamTenant = !!ConfigurationService.xmCloudTenant?.aiEmbeddedTenantID;
  }

  openOptimizeContent() {
    this.optimizeContentPanelService.openPanel();
  }

  getOptimizeButtonTitle(): string {
    if (this.hasStreamTenant) {
      return this.hasTextFields
        ? 'CONTENT_OPTIMIZATION.DIALOG_HEADER'
        : 'CONTENT_OPTIMIZATION.CONTENT_OPTIMIZATION_NOT_SUPPORTED_MESSAGE';
    }
    return '';
  }
}
