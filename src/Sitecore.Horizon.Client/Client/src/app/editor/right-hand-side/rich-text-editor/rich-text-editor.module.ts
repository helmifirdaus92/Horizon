/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, IconButtonGroupModule, IconButtonModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { RichTextEditorComponent } from './rich-text-editor.component';
import { RichTextLinkComponent } from './rich-text-link.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonModule,
    IconButtonModule,
    SlideInPanelModule,
    IconButtonGroupModule,
    InputLabelModule,
  ],
  declarations: [RichTextLinkComponent, RichTextEditorComponent],
  exports: [RichTextEditorComponent],
})
export class RichTextEditorModule {}
