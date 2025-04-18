/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  BadgeModule,
  BreadcrumbModule,
  ButtonModule,
  CheckboxModule,
  DialogModule,
  DroplistModule,
  IconButtonModule,
  InlineNotificationModule,
  InputLabelModule,
  ItemCardModule,
  ListModule,
  LoadingIndicatorModule,
  PopoverModule,
  SearchInputModule,
  TableModule,
  TabsModule,
} from '@sitecore/ng-spd-lib';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { DirectivesModule } from 'app/shared/directives/directives/directives.module';
import { NotificationsModule } from 'app/shared/notifications/notifications.module';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { DesignSearchComponent } from './design-search/design-search.component';
import { EmptyStateComponent } from './empty-state/empty-state.component';
import { CreatePageBranchDialogComponent } from './page-branches/create-page-branch-dialog/create-page-branch-dialog.component';
import { PageBranchesComponent } from './page-branches/page-branches.component';
import { CreatePageDesignDialogComponent } from './page-designs/create-page-design-dialog/create-page-design-dialog.component';
import { PageDesignsLhsPanelComponent } from './page-designs/page-designs-lhs-panel/page-designs-lhs-panel.component';
import { PageDesignsComponent } from './page-designs/page-designs.component';
import { InsertOptionsConfigurationsDialogComponent } from './page-templates/insert-options-configurations-dialog/insert-options-configurations-dialog.component';
import { PageTemplatesComponent } from './page-templates/page-templates.component';
import { PartialDesignsComponent } from './partial-designs/partial-designs.component';
import { CreateItemDialogComponent } from './shared/create-item-dialog/create-item-dialog.component';
import { DuplicateItemDialogComponent } from './shared/duplicate-item-dialog/duplicate-item-dialog.component';
import { InsertOptionsConfigurationComponent } from './shared/insert-options-configuration/insert-options-configuration.component';
import { ItemDetailsComponent } from './shared/item-details/item-details.component';
import { MoveItemDialogComponent } from './shared/move-item-dialog/move-item-dialog.component';
import { PageDesignRoutingService } from './shared/page-design-routing.service';
import { RenameItemDialogComponent } from './shared/rename-item-dialog/rename-item-dialog.component';
import { TemplatesSharedSitesTabsComponent } from './shared/templates-shared-sites-tabs/templates-shared-sites-tabs.component';
import { TemplatesLhsPanelComponent } from './templates-lhs-panel/templates-lhs-panel.component';
import { AssignPageDesignDialogComponent } from './templates-view/assign-page-design-dialog/assign-page-design-dialog.component';
import { FeatureNotAvailableDialogComponent } from './templates-view/feature-not-available-dialog/feature-not-available-dialog.component';
import { TemplatesViewComponent } from './templates-view/templates-view.component';

@NgModule({
  declarations: [
    TemplatesViewComponent,
    TemplatesLhsPanelComponent,
    PartialDesignsComponent,
    PageDesignsComponent,
    PageBranchesComponent,
    CreatePageBranchDialogComponent,
    ItemDetailsComponent,
    CreateItemDialogComponent,
    DuplicateItemDialogComponent,
    MoveItemDialogComponent,
    RenameItemDialogComponent,
    AssignPageDesignDialogComponent,
    PageDesignsLhsPanelComponent,
    TemplatesSharedSitesTabsComponent,
    FeatureNotAvailableDialogComponent,
    PageTemplatesComponent,
    DesignSearchComponent,
    CreatePageDesignDialogComponent,
    InsertOptionsConfigurationComponent,
    InsertOptionsConfigurationsDialogComponent,
  ],
  exports: [TemplatesLhsPanelComponent, PageDesignsLhsPanelComponent],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ListModule,
    RouterModule,
    AppLetModule,
    ItemCardModule,
    DialogModule,
    ButtonModule,
    IconButtonModule,
    InputLabelModule,
    PopoverModule,
    CmUrlModule,
    DirectivesModule,
    LoadingIndicatorModule,
    BreadcrumbModule,
    BadgeModule,
    TabsModule,
    NotificationsModule,
    SearchInputModule,
    PipesModule,
    FeatureFlagsModule,
    DroplistModule,
    InlineNotificationModule,
    CheckboxModule,
    A11yModule,
    TableModule,
    EmptyStateComponent,
  ],
  providers: [PageDesignRoutingService],
})
export class PageDesignModule {}
