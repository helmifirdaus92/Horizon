/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SiteLanguageDropdownsModule } from './site-language-dropdowns/site-language-dropdowns.module';
import { SiteLanguageSwitcherComponent } from './site-language-switcher.component';

@NgModule({
  imports: [CommonModule, SiteLanguageDropdownsModule],
  exports: [SiteLanguageSwitcherComponent],
  declarations: [SiteLanguageSwitcherComponent],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SiteLanguageSwitcherModule {}
