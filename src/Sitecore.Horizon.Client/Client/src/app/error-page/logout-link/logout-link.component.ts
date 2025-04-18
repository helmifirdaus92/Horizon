/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { AuthenticationService } from 'app/authentication/authentication.service';

@Component({
  selector: 'app-logout-link',
  styleUrls: ['./logout-link.component.scss'],
  template: `<a href="" (click)="logout($event)" (keyup)="logout($event)"><ng-content></ng-content></a>`,
})
export class LogoutLinkComponent {
  constructor(private readonly authenticationService: AuthenticationService) {}

  logout(event: MouseEvent | KeyboardEvent) {
    event.preventDefault();

    this.authenticationService.logout();
  }
}
