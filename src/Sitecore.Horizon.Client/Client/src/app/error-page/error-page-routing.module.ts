/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorPageComponent } from './error-page.component';
import { GeneralErrorComponent } from './general-error/general-error.component';
import { LogoutComponent } from './logout/logout.component';
import { NoOrganizationComponent } from './no-organization/no-organization.component';
import { NoTenantComponent } from './no-tenant/no-tenant.component';

const routes: Routes = [
  {
    path: 'error',
    component: ErrorPageComponent,
    data: { state: 'error' },
    children: [
      {
        path: 'no-organization',
        component: NoOrganizationComponent,
      },
      {
        path: 'no-tenant',
        component: NoTenantComponent,
      },
      {
        path: 'general',
        component: GeneralErrorComponent,
      },
      { path: '', redirectTo: 'general', pathMatch: 'full' },
    ],
  },
  {
    path: 'logout',
    component: LogoutComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErrorPageRoutingModule {}
