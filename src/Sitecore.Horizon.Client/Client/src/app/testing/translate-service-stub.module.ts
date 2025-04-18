/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

function HttpLoaderFactoryFake(http: HttpClient) {
  return new TranslateHttpLoader(http, `/assets/i18n/`);
}

export class FakeTranslationHandlerWithParams implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    let result = params.key;
    if (params.interpolateParams) {
      result += ' ' + JSON.stringify(params.interpolateParams);
    }

    return result;
  }
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactoryFake,
        deps: [HttpClient],
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: FakeTranslationHandlerWithParams,
      },
    }),
  ],
  exports: [HttpClientTestingModule],
})
export class TranslateServiceStubModule {}
