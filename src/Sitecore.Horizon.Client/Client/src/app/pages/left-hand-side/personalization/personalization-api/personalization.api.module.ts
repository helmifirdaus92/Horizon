/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { PersonalizationAPIService, personalizationAPIServiceFactory } from './personalization.api.service';

@NgModule({
  providers: [
    {
      provide: PersonalizationAPIService,
      useFactory: personalizationAPIServiceFactory,
      deps: [ContextService, BaseItemDalService, HttpClient, ConfigurationService, SiteService],
    },
  ],
})
export class PersonalizationApiModule {}
