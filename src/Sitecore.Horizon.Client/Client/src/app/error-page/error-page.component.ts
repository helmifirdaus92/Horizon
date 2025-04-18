/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { LHSNavigationService } from 'app/pages/left-hand-side/lhs-navigation.service';
import { pagesAnimations } from 'app/pages/pages.animations';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss'],
  animations: pagesAnimations,
})
export class ErrorPageComponent {
  @ViewChild('outlet', { static: true }) outlet?: RouterOutlet;

  constructor(
    private readonly lhsNavigationService: LHSNavigationService,
    router: Router,
    route: ActivatedRoute,
  ) {
    this.lhsNavigationService.provideRouter(router, route);
  }
}
