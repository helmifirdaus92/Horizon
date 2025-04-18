/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnInit } from '@angular/core';
import { LhsPanelComponent } from 'app/editor/lhs-panel/lhs-panel.component';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { getJsonValueFromLocalStorage } from 'app/shared/utils/utils';

const PAGE_SETTINGS_ACCORDION_NAME_CONST = 'hz-acc-ps';

@Component({
  selector: 'app-page-details-dialog',
  templateUrl: './page-settings-dialog.component.html',
  styleUrls: ['./page-settings-dialog.component.scss'],
})
export class PageSettingsDialogComponent implements OnInit {
  static canWrite = true;
  static show() {
    LhsPanelComponent.show(PageSettingsDialogComponent);
  }

  showPageDesign = false;
  showInsertOptions = false;

  contextValue$ = this.contextService.value$;

  canWrite = () => PageSettingsDialogComponent.canWrite;

  private _accordionHeaderOpenList: Record<string, boolean> = getJsonValueFromLocalStorage(
    PAGE_SETTINGS_ACCORDION_NAME_CONST,
  );
  accordionHeaderOpenList = {
    get: (key: string) => this._accordionHeaderOpenList[key],
    set: (key: string, value: boolean) => {
      this._accordionHeaderOpenList[key] = value;
      localStorage.setItem(PAGE_SETTINGS_ACCORDION_NAME_CONST, JSON.stringify(this._accordionHeaderOpenList));
    },
  };

  constructor(
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly contextService: ContextService,
  ) {}

  ngOnInit() {
    this.showPageDesign = this.featureFlagsService.isFeatureEnabled('pages_show-templates-design-updates');
    this.showInsertOptions = this.featureFlagsService.isFeatureEnabled('pages_page-insert-options');
  }
}
