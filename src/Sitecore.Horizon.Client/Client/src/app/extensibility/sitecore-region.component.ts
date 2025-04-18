/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { ExtensionFilterPredicate } from '@sitecore/page-composer-sdk';

@Component({
  selector: 'app-sitecore-region',
  template: `
    <sitecore-region [attr.name]="name" [style.display]="display" [filter]="filterFn" [input]="input"></sitecore-region>
  `,
})
export class SitecoreRegionComponent {
  @Input() name = '';
  @Input() display = 'initial';
  @Input() input: unknown;
  @Input() filterFn: ExtensionFilterPredicate<unknown> = () => true;
}
