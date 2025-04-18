/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/authentication/authentication.service';

@Component({
  selector: 'app-logout',
  template: '',
})
export class LogoutComponent implements OnInit {
  constructor(private readonly authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.authenticationService.logout();
  }
}
