/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnInit } from '@angular/core';
import { LhsPanelComponent } from 'app/editor/lhs-panel/lhs-panel.component';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { LhsPanelExtensionWrapperComponent } from './lhs-panel-extension-wrapper/lhs-panel-extension-wrapper.component';

export const MarketplaceAppsLocalStorageKey = 'Sitecore.Marketplace.LocalApps';

export interface MkpApplicationConfig {
  installationId: string;
  application: {
    id: string;
    name: string;
    type: string;
    url: string;
    iconUrl: string;
  };
  resources: Array<{
    resourceId: string;
    tenantId: string;
    contextId: string;
  }>;
}

@Component({
  selector: 'app-extension-lib',
  templateUrl: './extension-lib.component.html',
  styleUrl: './extension-lib.component.scss',
})
export class ExtensionLibComponent implements OnInit {
  extensions: MkpApplicationConfig[] = [];
  showExtensionsButton: boolean = false;

  constructor(private readonly featureFlagsService: FeatureFlagsService) {
    // uncomment to enable mocked plugins
    // registerMockedPlugins();
  }

  ngOnInit() {
    this.extensions = (() => {
      try {
        return JSON.parse(localStorage.getItem(MarketplaceAppsLocalStorageKey) ?? '[]');
      } catch {
        return [];
      }
    })();

    this.showExtensionsButton =
      this.featureFlagsService.isFeatureEnabled('pages_marketplace_integration') || this.extensions.length > 0;
  }

  selectExtension(extension: MkpApplicationConfig) {
    LhsPanelComponent.show(null);
    LhsPanelExtensionWrapperComponent.Extension = extension;
    LhsPanelComponent.show(LhsPanelExtensionWrapperComponent);
    LhsPanelComponent.HasExpand = true;
    LhsPanelComponent.Header = { iconUrl: extension.application.iconUrl, text: extension.application.name };
  }
}
