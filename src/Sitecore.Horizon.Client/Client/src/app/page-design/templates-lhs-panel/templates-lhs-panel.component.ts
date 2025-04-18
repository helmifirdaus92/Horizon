/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnInit } from '@angular/core';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';

export interface TemplateNavigationItem {
  label: string;
  icon: string;
  routerLink: string;
  // Helper attribute for auto tests
  testid: string;
}

@Component({
  selector: 'app-templates-lhs-panel',
  templateUrl: './templates-lhs-panel.component.html',
  styleUrls: ['./templates-lhs-panel.component.scss'],
})
export class TemplatesLhsPanelComponent implements OnInit {
  private templatesBasePath = '/templates';
  isPageBranchesFeatureEnabled?: boolean;
  useNewDesign = false;

  @Input() activeNavigationState?: string;

  private readonly pageBranchesNavigationItem: TemplateNavigationItem = {
    label: 'PAGE_DESIGNS.LHS_PANEL.PAGE_BRANCHES',
    icon: 'source-branch',
    routerLink: `${this.templatesBasePath}/pagebranches`,
    testid: 'nav-page-branches',
  };
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  // Define static items for template lhs panel with routerLink.
  createDesignNavigationItem: TemplateNavigationItem[] = [
    {
      label: 'PAGE_DESIGNS.LHS_PANEL.PAGE_DESIGNS',
      icon: 'view-compact-outline',
      routerLink: `${this.templatesBasePath}/pagedesigns`,
      testid: 'nav-page-designs',
    },
    {
      label: 'PAGE_DESIGNS.LHS_PANEL.PARTIAL_DESIGNS',
      icon: 'page-layout-header',
      routerLink: `${this.templatesBasePath}/partialdesigns`,
      testid: 'nav-partial-designs',
    },
  ];

  ngOnInit() {
    this.useNewDesign = this.featureFlagsService.isFeatureEnabled('pages_show-templates-design-updates');
    this.isPageBranchesFeatureEnabled = this.featureFlagsService.isFeatureEnabled('pages_show-page-branches');
    if (
      this.isPageBranchesFeatureEnabled &&
      !this.createDesignNavigationItem.includes(this.pageBranchesNavigationItem)
    ) {
      this.createDesignNavigationItem.push(this.pageBranchesNavigationItem);
    }
  }
}
