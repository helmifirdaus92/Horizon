/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, HeaderWithButtonModule, IconButtonModule } from '@sitecore/ng-spd-lib';
import { ContentTreeContainerModule } from 'app/pages/content-tree-container/content-tree-container.module';
import { ContentTreeSearchModule } from 'app/pages/content-tree-search/content-tree-search.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { CreatePageModule } from '../create-page/create-page.module';
import { ContentTreePanelComponent } from './content-tree-panel.component';

@NgModule({
  imports: [
    CommonModule,
    ContentTreeContainerModule,
    CreatePageModule,
    TranslateModule,
    ButtonModule,
    AppLetModule,
    HeaderWithButtonModule,
    IconButtonModule,
    ContentTreeSearchModule,
  ],
  declarations: [ContentTreePanelComponent],
  exports: [ContentTreePanelComponent],
})
export class ContentTreePanelModule {}
