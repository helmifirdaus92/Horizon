/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';

@Component({ template: '' })
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class AnalyticsModeBase {
  @Input() mode: 'siteAnalytics' | 'pageAnalytics' = 'siteAnalytics';
}
