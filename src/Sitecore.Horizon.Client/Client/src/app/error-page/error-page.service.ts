/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export type ErrorPageRoute = 'noOrganization' | 'noTenant' | 'default';

@Injectable({
  providedIn: 'root',
})
export class ErrorPageService {
  constructor(private readonly router: Router) {}

  goToErrorPage(route: ErrorPageRoute) {
    switch (route) {
      case 'noOrganization':
        this.router.navigateByUrl('/error/no-organization');
        break;

      case 'noTenant':
        this.router.navigateByUrl('/error/no-tenant');
        break;

      case 'default':
      default:
        this.router.navigateByUrl('/error');
    }
  }
}
