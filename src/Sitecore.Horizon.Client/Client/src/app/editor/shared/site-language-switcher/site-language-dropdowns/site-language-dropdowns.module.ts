/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DroplistModule, ListModule, PopoverModule, SearchInputModule, SwitchModule } from '@sitecore/ng-spd-lib';
import { SiteLanguageDropdownsComponent } from './site-language-dropdowns.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    PopoverModule,
    ListModule,
    DroplistModule,
    SwitchModule,
    A11yModule,
    SearchInputModule,
  ],
  exports: [SiteLanguageDropdownsComponent],
  declarations: [SiteLanguageDropdownsComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SiteLanguageDropdownsModule {}
