/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  AccordionModule,
  BadgeModule,
  ButtonModule,
  ContentEditableModule,
  DialogModule,
  EmptyStateModule,
  HeaderWithButtonModule,
  IconButtonModule,
  ListModule,
  LoadingIndicatorModule,
  PopoverModule,
  SearchInputModule,
  TabsModule,
} from '@sitecore/ng-spd-lib';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { WarningDialogModule } from 'app/shared/dialogs/warning-dialog/warning-dialog.module';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { PersonalizationContextMenuComponent } from './context-menu/personalization-context-menu.component';
import { CreateVariantDialogModule } from './create-variant-dialog/create-variant-dialog.module';
import { PersonalizationApiModule } from './personalization-api/personalization.api.module';
import { PersonalizationLayoutService } from './personalization-services/personalization.layout.service';
import { PersonalizationNotificationsService } from './personalization-services/personalization.notifications.service';
import { PersonalizationRulesService } from './personalization-services/personalization.rules.service';
import { PersonalizationComponent } from './personalization.component';

@NgModule({
  imports: [
    CommonModule,
    AppLetModule,
    TabsModule,
    TranslateModule,
    ButtonModule,
    ListModule,
    SlideInPanelModule,
    BadgeModule,
    AccordionModule,
    SearchInputModule,
    LoadingIndicatorModule,
    DialogModule,
    WarningDialogModule,
    PopoverModule,
    IconButtonModule,
    EmptyStateModule,
    HeaderWithButtonModule,
    PersonalizationApiModule,
    PipesModule,
    EmptyStateModule,
    CreateVariantDialogModule,
    ContentEditableModule,
    A11yModule,
  ],
  exports: [PersonalizationComponent],
  declarations: [PersonalizationComponent, PersonalizationContextMenuComponent],
  providers: [PersonalizationLayoutService, PersonalizationRulesService, PersonalizationNotificationsService],
})
export class PersonalizationModule {}
