/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { pagesAnimations } from 'app/pages/pages.animations';

@Component({
  selector: 'app-editor-header',
  templateUrl: './editor-header.component.html',
  styleUrls: ['./editor-header.component.scss'],
  animations: [pagesAnimations],
})
export class EditorHeaderComponent {
  isDirectRenderFeatureEnabled = false;

  constructor(private readonly featureFlagService: FeatureFlagsService) {
    this.isDirectRenderFeatureEnabled = this.featureFlagService.isFeatureEnabled('pages_rendering-host-flip');
  }
}
