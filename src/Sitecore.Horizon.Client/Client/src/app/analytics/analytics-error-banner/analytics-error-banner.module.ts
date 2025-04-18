/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { AnalyticsErrorBannerComponent } from './analytics-error-banner.component';
@NgModule({
  imports: [CommonModule, TranslateModule, PipesModule],
  declarations: [AnalyticsErrorBannerComponent],
  exports: [AnalyticsErrorBannerComponent],
})
export class AnalyticsErrorBannerModule {}
