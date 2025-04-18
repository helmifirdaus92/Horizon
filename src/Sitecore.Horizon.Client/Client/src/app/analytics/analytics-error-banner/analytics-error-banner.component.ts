/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-analytics-error-banner',
  templateUrl: './analytics-error-banner.component.html',
  styleUrls: ['./analytics-error-banner.component.scss'],
})
export class AnalyticsErrorBannerComponent {
  @Input() title = '';
  @Input() text = '';
  @Input() linkText?: string;
  @Input() linkUrl?: string | SafeUrl;
  @Input() icon = '';
}
