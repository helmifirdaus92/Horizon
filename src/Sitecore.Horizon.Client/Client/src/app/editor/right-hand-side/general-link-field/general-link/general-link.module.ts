/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DroplistModule, InputLabelModule, TabsModule } from '@sitecore/ng-spd-lib';
import { EmailLinkComponent } from './email-link/email-link.component';
import { ExternalLinkModule } from './external-link/external-link.module';
import { GeneralLinkComponent } from './general-link.component';
import { InternalLinkModule } from './internal-link/internal-link.module';
import { MediaLinkModule } from './media-link/media-link.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ExternalLinkModule,
    InternalLinkModule,
    MediaLinkModule,
    DroplistModule,
    InputLabelModule,
    ButtonModule,
    EmailLinkComponent,
    TabsModule,
  ],
  exports: [GeneralLinkComponent],
  declarations: [GeneralLinkComponent],
  providers: [],
})
export class GeneralLinkModule {}
