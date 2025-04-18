/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContentEditableModule, IconButtonModule, LoadingIndicatorModule, TreeModule } from '@sitecore/ng-spd-lib';
import { DragndropModule } from 'app/shared/component-library/dragndrop.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { ContentTreeComponent } from './content-tree.component';
import { contentTreeDalServiceProvider } from './content-tree.dal.factory';
import { ContentTreeContextModule } from './context-menu/content-tree-context.module';
import { ExpandOnDragoverDirective } from './expand-on-dragover.directive';
import { HighlightDropNodeComponent } from './highlight-drop-node.component';

@NgModule({
  providers: [contentTreeDalServiceProvider],
  imports: [
    CommonModule,
    ContentEditableModule,
    TreeModule,
    LoadingIndicatorModule,
    DragndropModule,
    ContentTreeContextModule,
    TranslateModule,
    IconButtonModule,
    AppLetModule,
  ],
  declarations: [ContentTreeComponent, ExpandOnDragoverDirective, HighlightDropNodeComponent],
  exports: [ContentTreeComponent],
})
export class ContentTreeModule {}
