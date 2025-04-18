/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  AccordionModule,
  BadgeModule,
  ButtonModule,
  CheckboxModule,
  DroplistModule,
  EmptyStateModule,
  IconButtonModule,
  InputLabelModule,
  ItemCardModule,
  LoadingIndicatorModule,
  PopoverModule,
  TabsModule,
} from '@sitecore/ng-spd-lib';
import { ExperimentStatusComponent } from 'app/editor/right-hand-side/test-component/experiment-status/experiment-status.component';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { EmptyStateComponent } from 'app/page-design/empty-state/empty-state.component';
import { DateDifferenceModule } from 'app/shared/pipes/date-difference/date-difference.pipe';
import { LocalTimeZoneDateModule } from 'app/shared/pipes/local-time-zone/local-time-zone-date.pipe';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { AssetsPipeModule } from '../../shared/utils/assets.module';
import { PageAbTestConfigurationComponent } from './page-ab-test-configuration/page-ab-test-configuration.component';
import { PageAbTestDetailsComponent } from './page-ab-test-details/page-ab-test-details.component';
import { PageAbPerformanceComponent } from './page-ab-test-performance/page-ab-test-performance.component';
import { PageAbTestsDialogComponent } from './page-ab-tests-dialog.component';
import { PageAbTestsListComponent } from './page-ab-tests-list/page-ab-tests-list.component';

@NgModule({
  imports: [
    CommonModule,
    IconButtonModule,
    TranslateModule,
    ItemCardModule,
    CmUrlModule,
    DroplistModule,
    InputLabelModule,
    ButtonModule,
    PopoverModule,
    LoadingIndicatorModule,
    AccordionModule,
    FormsModule,
    FormsModule,
    CheckboxModule,
    RouterModule,
    BadgeModule,
    ExperimentStatusComponent,
    EmptyStateComponent,
    TabsModule,
    DateDifferenceModule,
    LocalTimeZoneDateModule,
    IconButtonModule,
    FeatureFlagsModule,
    EmptyStateModule,
    AssetsPipeModule,
  ],
  declarations: [
    PageAbTestsDialogComponent,
    PageAbTestsListComponent,
    PageAbTestDetailsComponent,
    PageAbTestConfigurationComponent,
    PageAbPerformanceComponent,
  ],
  exports: [PageAbTestsDialogComponent],
})
export class PageAbTestsDialogModule {}
