/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule, DatePipe } from '@angular/common';
import { Component, DebugElement, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DroplistModule, IconButtonModule, ListModule, TabsModule } from '@sitecore/ng-spd-lib';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { SplitPaneModule } from 'app/component-lib/split-pane/split-pane.module';
import { ItemTypesUtilityService } from 'app/editor/editor-pages-utilities.service';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { ApplicationLinksModule } from 'app/pages/application-links/application-links.module';
import { PersonalizationAPIServiceDisconnected } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.disconnected';
import { PersonalizationAPIService } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.service';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { AssetPipeMock, AssetsPipeMockModule } from 'app/testing/assets-pipe-mock.module';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { AnalyticsApiModule } from './analytics-api/analytics.api.module';
import { AnalyticsApiService } from './analytics-api/analytics.api.service';
import { AnalyticsContextService } from './analytics-context.service';
import { AnalyticsGraphsModule } from './analytics-graphs/analytics-graphs.module';
import { AnalyticsComponent } from './analytics.component';
import { PageAnalyticsComponent } from './page-analytics/page-analytics.component';
import { SiteAnalyticsComponent } from './site-analytics/site-analytics.component';

@Component({
  selector: 'app-local-dev-settings',
  template: '',
})
export class CanvasLoadingSelectorTestComponent {}

@Component({
  selector: 'app-top-bar',
  template: '',
})
class AppHeaderStubComponent {
  @Input() renderSiteLanguageSwitcher?: boolean;
  @Input() renderGlobalElementsRegion?: boolean;
}

describe(AnalyticsComponent.name, () => {
  let sut: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;
  let debugEl: DebugElement;
  let analyticsContextService: jasmine.SpyObj<AnalyticsContextService>;

  const getTabBtns = () => debugEl.query(By.css('ng-spd-tab-group')).children;

  const getSiteAnalyticsTab = () => getTabBtns()[0].nativeElement;

  const getPageAnalyticsTab = () => getTabBtns()[1].nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IconButtonModule,
        ApplicationLinksModule,
        RouterTestingModule,
        TranslateServiceStubModule,
        TranslateModule,
        ListModule,
        SplitPaneModule,
        NoopAnimationsModule,
        SitecoreExtensibilityModule,
        TabsModule,
        CommonModule,
        DroplistModule,
        AnalyticsGraphsModule,
        AnalyticsApiModule,
        ApolloTestingModule,
        ContextServiceTestingModule,
        AssetsPipeMockModule,
        StaticConfigurationServiceStubModule,
      ],
      declarations: [
        AnalyticsComponent,
        SiteAnalyticsComponent,
        PageAnalyticsComponent,
        CanvasLoadingSelectorTestComponent,
        AppHeaderStubComponent,
        AssetPipeMock,
      ],
      providers: [
        DatePipe,
        {
          provide: AnalyticsContextService,
          useValue: jasmine.createSpyObj<AnalyticsContextService>('AnalyticsContextService', [
            'watchActiveRoute',
            'setActiveRoute',
            'watchDuration',
            'getPointOfSale',
          ]),
        },
        {
          provide: AnalyticsApiService,
          useValue: jasmine.createSpyObj<AnalyticsApiService>('AnalyticsApiService', ['loadSiteAnalytics']),
        },
        {
          provide: PersonalizationAPIService,
          useClass: PersonalizationAPIServiceDisconnected,
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>({ init: undefined }, { clientLanguage: 'da' }),
        },
        {
          provide: ItemTypesUtilityService,
          useValue: jasmine.createSpyObj<ItemTypesUtilityService>({ ensureFirstEmitIsSitePage: of({}) }),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsComponent);
    sut = fixture.componentInstance;
    debugEl = fixture.debugElement;

    analyticsContextService = TestBedInjectSpy(AnalyticsContextService);
    analyticsContextService.watchActiveRoute.and.returnValue(of('site'));

    ConfigurationService.cdpTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'org1',
      apiUrl: 'http://cdp.com',
      appUrl: 'http://cdpapp.com',
      analyticsAppUrl: '',
    };

    fixture.detectChanges();
  });

  afterEach(() => {
    ConfigurationService.cdpTenant = null;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('selectedComponent', () => {
    it('should select default component', () => {
      const pageAnalyticsBtn = getPageAnalyticsTab();
      const siteAnalyticsBtn = getSiteAnalyticsTab();
      expect(pageAnalyticsBtn.ariaSelected).toBe('false');
      expect(siteAnalyticsBtn.ariaSelected).toBe('true');
    });

    it('should select page analytics component WHEN Page Analytics button is clicked', () => {
      const pageAnalyticsBtn = getPageAnalyticsTab();
      const siteAnalyticsBtn = getSiteAnalyticsTab();
      pageAnalyticsBtn.click();
      fixture.detectChanges();

      expect(analyticsContextService.setActiveRoute).toHaveBeenCalledWith('page');
      expect(pageAnalyticsBtn.ariaSelected).toBe('true');
      expect(siteAnalyticsBtn.ariaSelected).toBe('false');
    });

    it('should select page analytics component WHEN Site Analytics button is clicked', () => {
      const pageAnalyticsBtn = getPageAnalyticsTab();
      const siteAnalyticsBtn = getSiteAnalyticsTab();
      siteAnalyticsBtn.click();
      fixture.detectChanges();

      expect(analyticsContextService.setActiveRoute).toHaveBeenCalledWith('site');
      expect(pageAnalyticsBtn.ariaSelected).toBe('false');
      expect(siteAnalyticsBtn.ariaSelected).toBe('true');
    });
  });

  describe('toggle local development component', () => {
    it('should show component WHEN in Dev mode', () => {
      sut.isLocalDevelopmentMode = true;
      fixture.detectChanges();

      const localDevComponent: CanvasLoadingSelectorTestComponent = fixture.debugElement.query(
        By.directive(CanvasLoadingSelectorTestComponent),
      )?.componentInstance;

      expect(localDevComponent).toBeTruthy();
    });

    it('should show component WHEN in Prod mode', () => {
      sut.isLocalDevelopmentMode = false;
      fixture.detectChanges();

      const localDevComponent: CanvasLoadingSelectorTestComponent = fixture.debugElement.query(
        By.directive(CanvasLoadingSelectorTestComponent),
      )?.componentInstance;

      // assert
      expect(localDevComponent).toBeFalsy();
    });
  });
});
