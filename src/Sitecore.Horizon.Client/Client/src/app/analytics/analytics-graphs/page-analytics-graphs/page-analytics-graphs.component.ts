/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import {
  AnalyticsVariantFilterOption,
  AnalyticsVariantFilterValue,
  PageAnalyticsVariantsData,
} from 'app/analytics/analytics.types';
import {
  ANALYTICS_PAGE_ANALYTICS_DEFAULT_DATA,
  ANALYTICS_PAGE_ANALYTICS_DEFAULT_IS_LOADING,
} from 'app/analytics/page-analytics/page-analytics.component';
import { ANALYTICS_SITE_ANALYTICS_DEFAULT_DURATION } from 'app/analytics/site-analytics/site-analytics.component';

@Component({
  selector: 'app-page-analytics-graphs',
  templateUrl: './page-analytics-graphs.component.html',
  styleUrls: ['./page-analytics-graphs.component.scss'],
})
export class PageAnalyticsGraphsComponent {
  @Input() pageVariants: AnalyticsVariantFilterOption[] = [];
  @Input() pageAnalytics: PageAnalyticsVariantsData = {
    variantOne: ANALYTICS_PAGE_ANALYTICS_DEFAULT_DATA,
    variantTwo: ANALYTICS_PAGE_ANALYTICS_DEFAULT_DATA,
  };
  @Input() isValidData = ANALYTICS_PAGE_ANALYTICS_DEFAULT_IS_LOADING;
  @Input() isLoading = ANALYTICS_PAGE_ANALYTICS_DEFAULT_IS_LOADING;
  @Input() duration = ANALYTICS_SITE_ANALYTICS_DEFAULT_DURATION;
  @Input() variants: AnalyticsVariantFilterValue = {
    variantOne: {
      variantName: null,
      variantId: 'default',
    },
  };
}
