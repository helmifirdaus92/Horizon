/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule } from '@sitecore/ng-spd-lib';
import { CmUrlModule } from 'app/shared/pipes/platform-url/cm-url.module';
import { AssetsPipeModule } from 'app/shared/utils/assets.module';
import { ApplicationLinksComponent } from './application-links.component';

@NgModule({
  imports: [CommonModule, TranslateModule, AssetsPipeModule, CmUrlModule, IconButtonModule],
  declarations: [ApplicationLinksComponent],
  exports: [ApplicationLinksComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ApplicationLinksModule {}
