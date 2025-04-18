/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { SiteAnalytics } from 'app/analytics/analytics.types';
import {
  ANALYTICS_SITE_ANALYTICS_DEFAULT_DATA,
  ANALYTICS_SITE_ANALYTICS_DEFAULT_DURATION,
  ANALYTICS_SITE_ANALYTICS_DEFAULT_IS_LOADING,
  ANALYTICS_SITE_ANALYTICS_DEFAULT_IS_VALID_DATA,
} from 'app/analytics/site-analytics/site-analytics.component';

@Component({
  selector: 'app-site-analytics-graphs',
  templateUrl: './site-analytics-graphs.component.html',
  styleUrls: ['./site-analytics-graphs.component.scss'],
})
export class SiteAnalyticsGraphsComponent {
  @Input() siteAnalytics: SiteAnalytics | null = ANALYTICS_SITE_ANALYTICS_DEFAULT_DATA;
  @Input() isValidData = ANALYTICS_SITE_ANALYTICS_DEFAULT_IS_VALID_DATA;
  @Input() isLoading = ANALYTICS_SITE_ANALYTICS_DEFAULT_IS_LOADING;
  @Input() duration = ANALYTICS_SITE_ANALYTICS_DEFAULT_DURATION;
}
