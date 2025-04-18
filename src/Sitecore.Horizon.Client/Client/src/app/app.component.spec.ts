/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthenticationService } from './authentication/authentication.service';
import { XmCloudSessionManagerService } from './authentication/xmCloudSessionManager.service';
import { DesigningService } from './editor/designing/designing.service';
import { PlaceholderPropertiesSdkMessagingService } from './editor/right-hand-side/placeholder-details/placeholder-properties.sdk-messaging.service';
import { RenderingPropertiesSdkMessagingService } from './editor/right-hand-side/rendering-details/rendering-properties.sdk-messaging.service';
import { ErrorPageService } from './error-page/error-page.service';
import { PageDesignRoutingService } from './page-design/shared/page-design-routing.service';
import { ContextValidator, EmptySitesError, ValidContextResult } from './shared/client-state/context-validator';
import {
  ContextServiceTesting,
  ContextServiceTestingModule,
  DEFAULT_TEST_CONTEXT,
} from './shared/client-state/context.service.testing';
import { RouterStateService } from './shared/client-state/router-state.service';
import { ConfigurationService } from './shared/configuration/configuration.service';
import { DatasourcePickerSdkMessagingService } from './shared/editing-shell-datasource/datasource-picker.sdk-messaging.service';
import { MediaPickerSdkMessagingService } from './shared/editing-shell-media/media-picker.sdk-messaging.service';
import { EditingShellHostService } from './shared/editing-shell/editing-shell.host.service';
import { GraphQlService } from './shared/graphql/graphql.service';
import { BeaconService } from './shared/messaging/beacon.service';
import { ConfigurationMessagingService } from './shared/messaging/configuration-messaging.service';
import { FeatureFlagsMessagingService } from './shared/messaging/feature-flags-messaging.service';
import { MessagingService } from './shared/messaging/messaging.service';
import { TranslationMessagingService } from './shared/messaging/translation-messaging.service';
import { TimedNotificationsSdkMessagingService } from './shared/notifications/timed-notifications.sdk-messaging.service';
import { TimedNotification, TimedNotificationsService } from './shared/notifications/timed-notifications.service';
import { LanguageService, SiteService } from './shared/site-language/site-language.service';
import { StaticConfigurationServiceStubModule } from './testing/static-configuration-stub';
import { TestBedInjectSpy } from './testing/test.utils';

describe(AppComponent.name, () => {
  let fixture: ComponentFixture<AppComponent>;
  let sut: AppComponent;
  let routerStateService: jasmine.SpyObj<RouterStateService>;
  let pageDesignRouteService: jasmine.SpyObj<PageDesignRoutingService>;
  let ctxValidator: jasmine.SpyObj<ContextValidator>;
  let graphQlService: jasmine.SpyObj<GraphQlService>;
  let messagingService: jasmine.SpyObj<MessagingService>;
  let beaconService: jasmine.SpyObj<BeaconService>;
  let context: ContextServiceTesting;
  let designingService: jasmine.SpyObj<DesigningService>;
  let editingShellHostService: jasmine.SpyObj<EditingShellHostService>;
  let renderingPropertiesRegionMessagingService: jasmine.SpyObj<RenderingPropertiesSdkMessagingService>;
  let placeholderPropertiesSdkMessagingService: jasmine.SpyObj<PlaceholderPropertiesSdkMessagingService>;
  let configurationService: jasmine.SpyObj<ConfigurationService>;
  let siteService: jasmine.SpyObj<SiteService>;
  let languageService: jasmine.SpyObj<LanguageService>;
  let timedNotificationService: jasmine.SpyObj<TimedNotificationsService>;
  let timedNotificationsSdkMessagingService: jasmine.SpyObj<TimedNotificationsSdkMessagingService>;
  let datasourcePickerSdkMessagingService: jasmine.SpyObj<DatasourcePickerSdkMessagingService>;
  let mediaPickerSdkMessagingService: jasmine.SpyObj<MediaPickerSdkMessagingService>;
  let translationMessagingService: jasmine.SpyObj<TranslationMessagingService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let authenticationServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let resolveGetValidContext: (value: ValidContextResult) => void;
  let rejectGetValidContext: (reason?: any) => void;
  let featureFlagsMessagingService: jasmine.SpyObj<FeatureFlagsMessagingService>;
  let envVariablesMessagingService: jasmine.SpyObj<ConfigurationMessagingService>;

  function resetComponent() {
    fixture = TestBed.createComponent(AppComponent);
    sut = fixture.debugElement.componentInstance;
  }

  async function whenInitialized() {
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
  }

  @Component({
    selector: 'app-pages',
    template: '',
  })
  class TestPagesComponent {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ContextServiceTestingModule,
        NoopAnimationsModule,
        StaticConfigurationServiceStubModule,
      ],
      declarations: [AppComponent, TestPagesComponent],
      providers: [
        {
          provide: RouterStateService,
          useValue: jasmine.createSpyObj<RouterStateService>({
            initialize: { itemId: '', language: '', siteName: '' },
            watchAndSyncAll: undefined,
          }),
        },
        {
          provide: ContextValidator,
          useValue: jasmine.createSpyObj<ContextValidator>('contextValidatorSpy', ['getValidContext']),
        },
        {
          provide: MediaPickerSdkMessagingService,
          useValue: jasmine.createSpyObj<MediaPickerSdkMessagingService>({ init: undefined }),
        },
        {
          provide: DatasourcePickerSdkMessagingService,
          useValue: jasmine.createSpyObj<DatasourcePickerSdkMessagingService>({ init: undefined }),
        },
        { provide: GraphQlService, useValue: jasmine.createSpyObj<GraphQlService>({ initApollo: undefined }) },
        { provide: MessagingService, useValue: jasmine.createSpyObj<MessagingService>({ init: undefined }) },
        { provide: BeaconService, useValue: jasmine.createSpyObj<BeaconService>({ init: undefined }) },
        { provide: DesigningService, useValue: jasmine.createSpyObj<DesigningService>({ init: undefined }) },

        {
          provide: EditingShellHostService,
          useValue: jasmine.createSpyObj<EditingShellHostService>({ init: undefined }),
        },
        {
          provide: TranslateService,
          useValue: {
            setTranslation: jasmine.createSpy('languageservice.setTranslation'),
            setDefaultLang: jasmine.createSpy('languageservice.setDefaultLang'),
            use: jasmine.createSpy('languageservice.use'),
            get: jasmine.createSpy('languageservice.get').and.returnValue(of('test')),
          },
        },
        {
          provide: RenderingPropertiesSdkMessagingService,
          useValue: jasmine.createSpyObj<RenderingPropertiesSdkMessagingService>({ init: undefined }),
        },
        {
          provide: PlaceholderPropertiesSdkMessagingService,
          useValue: jasmine.createSpyObj<PlaceholderPropertiesSdkMessagingService>({ init: undefined }),
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>({ init: undefined }, { clientLanguage: 'da' }),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>({ init: undefined }),
        },
        {
          provide: LanguageService,
          useValue: jasmine.createSpyObj<LanguageService>({ init: undefined }),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>({ pushNotification: undefined }),
        },
        {
          provide: TimedNotificationsSdkMessagingService,
          useValue: jasmine.createSpyObj<TimedNotificationsSdkMessagingService>({ init: undefined }),
        },
        {
          provide: TranslationMessagingService,
          useValue: jasmine.createSpyObj<TranslationMessagingService>({ init: undefined }),
        },
        {
          provide: ErrorPageService,
          useValue: jasmine.createSpyObj<ErrorPageService>('ErrorPageService', { goToErrorPage: undefined }),
        },
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj<AuthenticationService>({
            authenticate: Promise.resolve({ returnUrl: 'https://test.url' }),
            navigateToReturnUrl: undefined,
          }),
        },
        {
          provide: FeatureFlagsMessagingService,
          useValue: jasmine.createSpyObj<FeatureFlagsMessagingService>({ init: undefined }),
        },
        {
          provide: ConfigurationMessagingService,
          useValue: jasmine.createSpyObj<ConfigurationMessagingService>({ init: undefined }),
        },
        {
          provide: XmCloudSessionManagerService,
          useValue: jasmine.createSpyObj<XmCloudSessionManagerService>('XmCloudSessionManagerService', [
            'setupSession',
          ]),
        },
        {
          provide: PageDesignRoutingService,
          useValue: jasmine.createSpyObj<PageDesignRoutingService>('PageDesignRouteService', ['init']),
        },
      ],
    }).compileComponents();

    routerStateService = TestBedInjectSpy(RouterStateService);
    pageDesignRouteService = TestBedInjectSpy(PageDesignRoutingService);
    ctxValidator = TestBedInjectSpy(ContextValidator);
    graphQlService = TestBedInjectSpy(GraphQlService);
    messagingService = TestBedInjectSpy(MessagingService);
    beaconService = TestBedInjectSpy(BeaconService);
    designingService = TestBedInjectSpy(DesigningService);
    editingShellHostService = TestBedInjectSpy(EditingShellHostService);
    renderingPropertiesRegionMessagingService = TestBedInjectSpy(RenderingPropertiesSdkMessagingService);
    placeholderPropertiesSdkMessagingService = TestBedInjectSpy(PlaceholderPropertiesSdkMessagingService);
    configurationService = TestBedInjectSpy(ConfigurationService);
    siteService = TestBedInjectSpy(SiteService);
    languageService = TestBedInjectSpy(LanguageService);
    timedNotificationService = TestBedInjectSpy(TimedNotificationsService);
    timedNotificationsSdkMessagingService = TestBedInjectSpy(TimedNotificationsSdkMessagingService);
    datasourcePickerSdkMessagingService = TestBedInjectSpy(DatasourcePickerSdkMessagingService);
    mediaPickerSdkMessagingService = TestBedInjectSpy(MediaPickerSdkMessagingService);
    translationMessagingService = TestBedInjectSpy(TranslationMessagingService);
    translateService = TestBedInjectSpy(TranslateService);
    authenticationServiceSpy = TestBedInjectSpy(AuthenticationService);
    featureFlagsMessagingService = TestBedInjectSpy(FeatureFlagsMessagingService);
    envVariablesMessagingService = TestBedInjectSpy(ConfigurationMessagingService);
    ctxValidator.getValidContext.and.returnValue(
      new Promise((resolve, reject) => {
        resolveGetValidContext = resolve;
        rejectGetValidContext = reject;
      }),
    );
  }));

  beforeEach(waitForAsync(() => {
    resetComponent();
    context = TestBed.inject(ContextServiceTesting);
  }));

  it('should create the app', () => {
    expect(sut).toBeTruthy();
  });

  describe('should set app locale', () => {
    it('should set default language', () => {
      expect(translateService.setDefaultLang).toHaveBeenCalledTimes(1);
    });

    it('should set language defined in configuration', async () => {
      await whenInitialized();

      expect(translateService.use).toHaveBeenCalledWith('da');
    });
  });

  it('should initialize services', async () => {
    const ctxSpy = spyOn(context, 'init');
    resolveGetValidContext({
      context: DEFAULT_TEST_CONTEXT,
      resolvedValues: {
        itemId: { value: 'siteitemid', wasCoerced: false },
        language: { value: 'siteLang', wasCoerced: false },
        siteName: { value: 'siteName', wasCoerced: false },
      },
    });

    await whenInitialized();

    expect(authenticationServiceSpy.navigateToReturnUrl).toHaveBeenCalledTimes(1);
    expect(featureFlagsMessagingService.init).toHaveBeenCalledTimes(1);
    expect(envVariablesMessagingService.init).toHaveBeenCalledTimes(1);
    expect(graphQlService.initApollo).toHaveBeenCalledTimes(1);

    expect(configurationService.init).toHaveBeenCalledTimes(1);
    expect(siteService.init).toHaveBeenCalledTimes(1);
    expect(languageService.init).toHaveBeenCalledTimes(1);

    expect(ctxValidator.getValidContext).toHaveBeenCalledTimes(1);
    expect(ctxSpy).toHaveBeenCalledTimes(1);

    expect(routerStateService.watchAndSyncAll).toHaveBeenCalledTimes(1);
    expect(pageDesignRouteService.init).toHaveBeenCalledTimes(1);
    expect(messagingService.init).toHaveBeenCalledTimes(1);
    expect(designingService.init).toHaveBeenCalledTimes(1);
    expect(beaconService.init).toHaveBeenCalledTimes(1);
    expect(translationMessagingService.init).toHaveBeenCalledTimes(1);

    expect(editingShellHostService.init).toHaveBeenCalledTimes(1);
    expect(mediaPickerSdkMessagingService.init).toHaveBeenCalledTimes(1);
    expect(datasourcePickerSdkMessagingService.init).toHaveBeenCalledTimes(1);
    expect(timedNotificationsSdkMessagingService.init).toHaveBeenCalledTimes(1);

    expect(renderingPropertiesRegionMessagingService.init).toHaveBeenCalledTimes(1);
    expect(placeholderPropertiesSdkMessagingService.init).toHaveBeenCalledTimes(1);
  });

  describe('initialize context', () => {
    it('should show warning on different context', async () => {
      const timedNotification = new TimedNotification('warningDifferentContext', 'test', 'warning');
      timedNotification.persistent = false;

      resolveGetValidContext({
        context: DEFAULT_TEST_CONTEXT,
        resolvedValues: {
          itemId: { value: 'siteitemid', wasCoerced: true },
          language: { value: 'siteLang', wasCoerced: false },
          siteName: { value: 'siteName', wasCoerced: false },
        },
      });

      await whenInitialized();
      const notification = timedNotificationService.pushNotification.calls.mostRecent().args[0];

      expect(timedNotificationService.pushNotification).toHaveBeenCalledWith(timedNotification);
      expect(notification).toEqual(timedNotification);
    });

    it('should show error on invalid context', async () => {
      const timedNotification = new TimedNotification('errorInContext', 'test');
      timedNotification.persistent = true;

      rejectGetValidContext('foo-error');

      await whenInitialized();
      const notification = timedNotificationService.pushNotification.calls.mostRecent().args[0];

      expect(timedNotificationService.pushNotification).toHaveBeenCalledWith(timedNotification);
      expect(notification).toEqual(timedNotification);
    });

    it('should show error when no sites found', async () => {
      const timedNotification = new TimedNotification('errorNoSites', '');
      timedNotification.persistent = true;
      timedNotification.innerHtml = 'test';

      const error = new EmptySitesError('List of sites is empty');
      rejectGetValidContext(error);

      await whenInitialized();
      const notification = timedNotificationService.pushNotification.calls.mostRecent().args[0];

      expect(timedNotificationService.pushNotification).toHaveBeenCalledWith(timedNotification);
      expect(notification).toEqual(timedNotification);
    });
  });
});
