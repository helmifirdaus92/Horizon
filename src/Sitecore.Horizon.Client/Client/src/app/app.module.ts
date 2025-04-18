/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule, NgZone } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { ApmModule, ApmService } from '@elastic/apm-rum-angular';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { GLOBAL_MESSAGING } from '@sitecore/ng-page-composer';
import { ApolloModule } from 'apollo-angular';
import { environment } from 'environments/environment';
import { NgHttpCachingConfig, NgHttpCachingModule, NgHttpCachingStrategy } from 'ng-http-caching';
import { AnalyticsModule } from './analytics/analytics.module';
import { ApmAuthRedirectReporterService } from './apm/apm-auth-redirect-reporter.service';
import { AppComponent } from './app.component';
import { appInitializer, HttpLoaderFactory, pageComposerInit } from './app.init';
import { AuthenticationService } from './authentication/authentication.service';
import { saveDalServiceProvider } from './editor/shared/save/save.dal.factory';
import { versionsDalServiceProvider } from './editor/shared/versions-workflow/versions.dal.factory';
import { workflowDalServiceProvider } from './editor/shared/versions-workflow/workflow.dal.factory';
import { ErrorPageModule } from './error-page/error-page.module';
import { FeatureFlagsService } from './feature-flags/feature-flags.service';
import { GainsightService } from './gainsight/gainsight.service';
import { PageDesignModule } from './page-design/page-design.module';
import { PagesRouteReuseStrategy } from './pages/pages-routing-strategy.service';
import { PagesModule } from './pages/pages.module';
import { StaticConfigurationService } from './shared/configuration/static-configuration.service';
import { MediaDialogModule } from './shared/dialogs/media-dialog/media-dialog.module';
import { itemDalServiceProvider } from './shared/graphql/item.dal.factory';
import { LanguageItemsDalService } from './shared/graphql/language-items.dal.service';
import { publishingDalServiceProvider } from './shared/graphql/publishing.dal.factory';
import { NonAuthorizedResponseInterceptor } from './shared/http/non-authorized-response-interceptor';
import { PlatformAuthenticationInterceptor } from './shared/http/platform-authentication-interceptor';
import { languageDalServiceProvider } from './shared/site-language/language.dal.factory';
import { siteDalServiceProvider } from './shared/site-language/site.dal.factory';

const ngHttpCachingConfig: NgHttpCachingConfig = {
  lifetime: 1000 * 60, // cache expire after 60 seconds,
  allowedMethod: ['GET'],
  cacheStrategy: NgHttpCachingStrategy.DISALLOW_ALL,
};

@NgModule({
  imports: [
    ApmModule,
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgHttpCachingModule.forRoot(ngHttpCachingConfig),
    PagesModule,
    AnalyticsModule,
    ErrorPageModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    MediaDialogModule,
    PageDesignModule,
    ApolloModule,
  ],
  declarations: [AppComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthenticationService, FeatureFlagsService, GainsightService, ApmAuthRedirectReporterService],
    },
    {
      provide: GLOBAL_MESSAGING,
      useFactory: pageComposerInit,
      deps: [NgZone],
    },
    {
      provide: RouteReuseStrategy,
      useClass: PagesRouteReuseStrategy,
    },
    { provide: HTTP_INTERCEPTORS, useClass: PlatformAuthenticationInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: NonAuthorizedResponseInterceptor, multi: true },
    siteDalServiceProvider,
    languageDalServiceProvider,
    publishingDalServiceProvider,
    saveDalServiceProvider,
    workflowDalServiceProvider,
    versionsDalServiceProvider,
    itemDalServiceProvider,
    LanguageItemsDalService,
    ApmService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(service: ApmService, staticConfigurationService: StaticConfigurationService) {
    this.configureApmRum(service, staticConfigurationService);
  }

  private configureApmRum(service: ApmService, staticConfigurationService: StaticConfigurationService) {
    if (!environment.production || environment.elasticApmDisabled) {
      return;
    }

    const apm = service.init({
      serviceName: 'sitecore-xmapps-pages',
      serverUrl: staticConfigurationService.apmServerBaseUrl,
      environment: staticConfigurationService.environment,
      transactionSampleRate: 0.1,
      // logLevel: 'debug', // writes debug info to a browser console in dev environment.
    });

    const gainSightRegex = /https:\/\/.*aptrinsic\.com\//;
    apm.addFilter((payload) => {
      payload.transactions = payload.transactions?.filter(
        (trans: { type: string; name: string }) => !(trans.type === 'http-request' && gainSightRegex.test(trans.name)),
      );

      if (!payload.transactions?.length && !payload.errors?.length) {
        return;
      }

      return payload;
    });
  }
}
