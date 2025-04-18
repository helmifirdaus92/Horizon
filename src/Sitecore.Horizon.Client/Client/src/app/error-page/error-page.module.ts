/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EmptyStateModule } from '@sitecore/ng-spd-lib';
import { ApplicationLinksModule } from 'app/pages/application-links/application-links.module';
import { TopBarModule } from 'app/pages/top-bar/top-bar.module';
import { NotificationsModule } from 'app/shared/notifications/notifications.module';
import { ErrorPageRoutingModule } from './error-page-routing.module';
import { ErrorPageComponent } from './error-page.component';
import { GeneralErrorComponent } from './general-error/general-error.component';
import { LogoutLinkComponent } from './logout-link/logout-link.component';
import { LogoutComponent } from './logout/logout.component';
import { NoOrganizationComponent } from './no-organization/no-organization.component';
import { NoTenantComponent } from './no-tenant/no-tenant.component';

@NgModule({
  imports: [
    CommonModule,
    TopBarModule,
    TranslateModule,
    ApplicationLinksModule,
    NotificationsModule,
    EmptyStateModule,
    ErrorPageRoutingModule,
    NotificationsModule,
  ],
  declarations: [
    ErrorPageComponent,
    NoOrganizationComponent,
    GeneralErrorComponent,
    NoTenantComponent,
    LogoutComponent,
    LogoutLinkComponent,
  ],
  exports: [ErrorPageComponent, NoOrganizationComponent, GeneralErrorComponent, NoTenantComponent],
})
export class ErrorPageModule {}
