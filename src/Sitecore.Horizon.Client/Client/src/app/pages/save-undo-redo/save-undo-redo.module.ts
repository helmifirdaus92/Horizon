/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule, SavedIndicatorModule } from '@sitecore/ng-spd-lib';
import { SaveUndoRedoComponent } from './save-undo-redo.component';
import { SaveIndicatorComponent } from './saved-indicator/save-indicator.component';

@NgModule({
  imports: [CommonModule, SavedIndicatorModule, TranslateModule, IconButtonModule],
  exports: [SaveUndoRedoComponent],
  declarations: [SaveUndoRedoComponent, SaveIndicatorComponent],
})
export class SaveUndoRedoModule {}
