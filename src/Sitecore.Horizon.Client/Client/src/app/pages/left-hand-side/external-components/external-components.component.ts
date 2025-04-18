/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'app-external-components',
  template: `<app-sitecore-region
    *ifFeatureEnabled="'pages_feaas-components-regions'"
    name="EditingShell.LHS.Components"
  ></app-sitecore-region>`,
  styleUrls: ['./external-components.component.scss'],
})
export class ExternalComponentsComponent {
  constructor() {}
}
