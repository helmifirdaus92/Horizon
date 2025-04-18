/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconButtonModule } from '@sitecore/ng-spd-lib';
import { SlideInPanelContentComponent } from './slide-in-panel-content.component';
import { SlideInPanelHeaderComponent } from './slide-in-panel-header.component';
import { SlideInPanelComponent } from './slide-in-panel.component';

@NgModule({
  imports: [IconButtonModule, CommonModule],
  exports: [SlideInPanelComponent, SlideInPanelContentComponent, SlideInPanelHeaderComponent],
  declarations: [SlideInPanelComponent, SlideInPanelContentComponent, SlideInPanelHeaderComponent],
})
export class SlideInPanelModule {}
