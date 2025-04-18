/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule } from '@angular/core';
import { DraggableDirective } from './draggable.directive';
import { DragndropDragimageDirective } from './dragimage.directive';
import { DragndropContainerDirective } from './dragndrop-container.directive';
import { DropDirective } from './drop.directive';

const DRAGNDROP_DIRECTIVES = [
  DraggableDirective,
  DropDirective,
  DragndropContainerDirective,
  DragndropDragimageDirective,
];

@NgModule({
  imports: [],
  exports: DRAGNDROP_DIRECTIVES,
  declarations: DRAGNDROP_DIRECTIVES,
})
export class DragndropModule {}
