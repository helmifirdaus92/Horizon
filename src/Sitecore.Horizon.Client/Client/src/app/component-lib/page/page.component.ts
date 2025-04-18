/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'ng-spd-page',
  template: `
    <ng-content select="ng-spd-page-header"></ng-content>
    <div class="page-app">
      <ng-content select="ng-spd-split-pane"></ng-content>
      <main class="page-main">
        <ng-content></ng-content>
      </main>
      <ng-content select="ng-spd-page-pane"></ng-content>
    </div>
  `,
  styleUrls: ['./page.component.scss'],
})
export class PageComponent {}
