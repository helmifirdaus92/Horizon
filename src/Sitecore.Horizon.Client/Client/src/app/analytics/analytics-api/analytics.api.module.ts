/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AnalyticsApiService, AnalyticsApiServiceFactory } from './analytics.api.service';

@NgModule({
  providers: [
    {
      provide: AnalyticsApiService,
      useFactory: AnalyticsApiServiceFactory,
      deps: [HttpClient],
    },
  ],
  imports: [HttpClientModule],
})
export class AnalyticsApiModule {}
