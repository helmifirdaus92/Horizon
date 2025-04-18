/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DroplistModule } from '@sitecore/ng-spd-lib';
import { ItemTypesUtilityService } from 'app/editor/editor-pages-utilities.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { PersonalizationAPIServiceDisconnected } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.disconnected';
import { PersonalizationAPIService } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { AssetsPipeModule } from 'app/shared/utils/assets.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { getDefaultVariantPageAnalytics, getEmptyPageAnalytics } from 'app/testing/analytics-test-data';
import { AssetPipeMock } from 'app/testing/assets-pipe-mock.module';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { firstValueFrom, of } from 'rxjs';
import { AnalyticsApiService } from '../analytics-api/analytics.api.service';
import { AnalyticsContextService } from '../analytics-context.service';
import { AnalyticsVariantFilterOption, AnalyticsVariantFilterValue } from '../analytics.types';
import { PageAnalyticsComponent } from './page-analytics.component';

@Component({
  selector: 'app-analytics-error-banner',
  template: '',
})
class ErrorBannerTestComponent {
  @Input() title = '';
  @Input() text = '';
  @Input() linkText?: string;
  @Input() linkUrl?: string;
  @Input() icon = '';
}

@Component({
  selector: 'app-page-analytics-graphs',
  template: '',
})
class PageAnalyticsGraphsTestComponent {
  @Input() pageAnalytics = null;
  @Input() isValidData = true;
  @Input() isLoading = false;
  @Input() duration = '';
  @Input() variants?: AnalyticsVariantFilterValue;
  @Input() pageVariants: AnalyticsVariantFilterOption[] = [];
}

describe(PageAnalyticsComponent.name, () => {
  let sut: PageAnalyticsComponent;
  let fixture: ComponentFixture<PageAnalyticsComponent>;
  let context: ContextServiceTesting;
  let analyticsApiService: jasmine.SpyObj<AnalyticsApiService>;
  let analyticsContextService: jasmine.SpyObj<AnalyticsContextService>;
  let personalizationAPI: PersonalizationAPIServiceDisconnected;
  let timedNotificationService: jasmine.SpyObj<TimedNotificationsService>;
  let featureFlagsService: jasmine.SpyObj<FeatureFlagsService>;

  const sampleVariant = [
    {
      template: '{variantId: variant2-en}',
      variantId: 'id1',
      variantName: 'test-variant1',
      audienceName: 'User has visited home page',
      enableEdit: false,
      conditionGroups: [
        {
          conditions: [
            {
              templateId: 'page_views',
              params: {
                Visited: 'has',
                'Page name': '/selectFlights',
              },
            },
          ],
        },
      ],
    },
    {
      variantId: 'id2',
      template: JSON.stringify({ variantId: 'cfa85597e43545479aadc27df7ff134e' }),
      variantName: 'test-variant2',
      audienceName: 'User has visited all pages',
      conditionGroups: [
        {
          conditions: [
            {
              templateId: 'page_views',
              params: {
                Visited: 'has',
                'Page name': '/selectFlights',
              },
            },
          ],
        },
      ],
    },
  ];

  const testVariantFilterList: AnalyticsVariantFilterValue = {
    variantOne: { variantName: 'Variant1', variantId: 'default' },
  };

  const getAllDropList = () => fixture.debugElement.queryAll(By.css('ng-spd-droplist'));
  const errorBanner = () => fixture.debugElement.query(By.directive(ErrorBannerTestComponent)).componentInstance;

  const initTest = async () => {
    fixture = TestBed.createComponent(PageAnalyticsComponent);
    sut = fixture.componentInstance;

    fixture.autoDetectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageAnalyticsComponent, PageAnalyticsGraphsTestComponent, ErrorBannerTestComponent, AssetPipeMock],
      imports: [
        NoopAnimationsModule,
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        TranslateModule,
        CommonModule,
        StaticConfigurationServiceStubModule,
        DroplistModule,
        AssetsPipeModule,
        PipesModule,
        AppLetModule,
        ButtonModule,
      ],
      providers: [
        DatePipe,
        {
          provide: AnalyticsApiService,
          useValue: jasmine.createSpyObj<AnalyticsApiService>('AnalyticsApiService', ['loadPageAnalytics']),
        },

        {
          provide: AnalyticsContextService,
          useValue: jasmine.createSpyObj<AnalyticsContextService>('AnalyticsContextService', [
            'watchDuration',
            'watchVariantFilterChanges',
            'getPointOfSale',
            'setVariantFilterValue',
            'getSiteInformation',
          ]),
        },
        {
          provide: PersonalizationAPIService,
          useClass: PersonalizationAPIServiceDisconnected,
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', ['push']),
        },
        {
          provide: ItemTypesUtilityService,
          useValue: jasmine.createSpyObj<ItemTypesUtilityService>({ ensureFirstEmitIsSitePage: of({}) }),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']),
        },
      ],
    }).compileComponents();
  });

  beforeEach(async () => {
    analyticsApiService = TestBedInjectSpy(AnalyticsApiService);
    analyticsContextService = TestBedInjectSpy(AnalyticsContextService);

    timedNotificationService = TestBedInjectSpy(TimedNotificationsService);
    timedNotificationService.push.and.resolveTo(undefined);

    featureFlagsService = TestBedInjectSpy(FeatureFlagsService);

    context = TestBed.inject(ContextServiceTesting);
    context.provideDefaultTestContext();

    personalizationAPI = TestBed.inject(PersonalizationAPIService) as PersonalizationAPIServiceDisconnected;
    spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(180);

    analyticsApiService.loadPageAnalytics.and.returnValue(
      Promise.resolve({
        apiIsBroken: false,
        requestIsInvalid: false,
        data: getDefaultVariantPageAnalytics(),
      }),
    );

    ConfigurationService.cdpTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'org1',
      apiUrl: 'http://cdp.com',
      appUrl: 'http://cdpapp.com',
      analyticsAppUrl: '',
    };

    analyticsContextService.watchDuration.and.returnValue(of({ id: '7D', value: '7d' }));
    analyticsContextService.watchVariantFilterChanges.and.returnValue(of(testVariantFilterList));
    analyticsContextService.getPointOfSale.and.returnValue(of('pointOfSale'));
    personalizationAPI.init([
      {
        traffic: {
          type: 'audienceTraffic',
          weightingAlgorithm: 'USER_DEFINED',
          splits: [sampleVariant[0], sampleVariant[1]],
        },
      },
    ]);
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
    ConfigurationService.cdpTenant = null;
  });

  it('should create', async () => {
    await initTest();

    expect(sut).toBeTruthy();
  });

  describe('WHEN cdpApp is configured', () => {
    describe('AND POS is not defined', () => {
      describe('AND isFeatureEnabled() is enabled', () => {
        it('should show no-pos error banner', async () => {
          featureFlagsService.isFeatureEnabled.and.returnValue(true);
          ConfigurationService.tenantName = 'test-tenant';
          analyticsContextService.getPointOfSale.and.returnValue(of(null));
          const mockSiteInfo = { collectionId: 'mockCollectionId', id: 'mockSiteId', hostId: 'mockHostId' };
          analyticsContextService.getSiteInformation.and.returnValue(of(mockSiteInfo));

          await initTest();

          expect(analyticsContextService.getSiteInformation).toHaveBeenCalled();
          expect(errorBanner()).toBeDefined();
          expect(errorBanner().title).toEqual('ANALYTICS.NO_ANALITYCS_IDENTIFIER.HEADER');
          expect(errorBanner().text).toEqual('ANALYTICS.NO_ANALITYCS_IDENTIFIER.DESCRIPTION');
          expect(errorBanner().linkText).toEqual('ANALYTICS.NO_ANALITYCS_IDENTIFIER.DASHBOARD_SETTINGS');
        });
      });
      describe('AND isFeatureEnabled() is not enabled', () => {
        it('should show no-pos error banner', async () => {
          featureFlagsService.isFeatureEnabled.and.returnValue(false);
          ConfigurationService.tenantName = 'test-tenant';
          analyticsContextService.getPointOfSale.and.returnValue(of(null));

          await initTest();

          expect(errorBanner()).toBeDefined();
          expect(errorBanner().title).toEqual('ANALYTICS.NO_POS_IDENTIFIER.HEADER');
          expect(errorBanner().text).toEqual('ANALYTICS.NO_POS_IDENTIFIER.DESCRIPTION');
          expect(errorBanner().linkText).toEqual('ANALYTICS.NO_POS_IDENTIFIER.DASHBOARD_SETTINGS');
        });
      });
    });

    describe('AND POS is defined', () => {
      it('should fetch variants list from personalizationApi service', async () => {
        await initTest();

        const pageVariants = await firstValueFrom(sut.pageVariants$);
        expect(pageVariants.length).toBe(3);
      });

      it('should update the variant filter options when new variant list is fetched', async () => {
        await initTest();

        const variantFilterOptions = await firstValueFrom(sut.pageVariants$);
        expect(variantFilterOptions[1].variantName).toBe('test-variant1');
        expect(variantFilterOptions[2].variantName).toBe('test-variant2');
      });

      it('should load pageAnalytics', async () => {
        await initTest();

        const friendlyId = 'foo1bar2baz30000aaaabbbbcccc1234_pt_br_default';
        expect(analyticsApiService.loadPageAnalytics).toHaveBeenCalledWith({
          pointOfSale: 'pointOfSale',
          duration: '7d',
          pageVariantId: friendlyId,
          timezoneOffset: -3,
        });
      });

      it('should include scope in load page analytics requests if defined', async () => {
        const personalizationScope = 'dev';
        spyOn(personalizationAPI, 'getPersonalizationScope').and.callFake(async () => {
          return Promise.resolve(personalizationScope);
        });

        const expectedFriendlyId = `${personalizationScope}_foo1bar2baz30000aaaabbbbcccc1234_pt_br_test-variant1`;
        const variantFilterOption: AnalyticsVariantFilterValue = {
          variantOne: { variantName: 'test-variant1', variantId: 'test-variant1' },
        };

        analyticsContextService.watchVariantFilterChanges.and.returnValue(of(variantFilterOption));
        await initTest();

        const latestCall = analyticsApiService.loadPageAnalytics.calls.mostRecent();
        expect(latestCall.args[0]).toEqual({
          pointOfSale: 'pointOfSale',
          duration: '7d',
          pageVariantId: expectedFriendlyId,
          timezoneOffset: -3,
        });
      });

      it('should re-load pageAnalytics when variant filter changes', async () => {
        const variantFilterOption: AnalyticsVariantFilterValue = {
          variantOne: { variantName: 'test-variant1', variantId: 'test-variant1' },
        };
        analyticsContextService.watchVariantFilterChanges.and.returnValue(of(variantFilterOption));
        await initTest();

        const friendlyId = 'foo1bar2baz30000aaaabbbbcccc1234_pt_br_test-variant1';

        expect(analyticsApiService.loadPageAnalytics).toHaveBeenCalledWith({
          pointOfSale: 'pointOfSale',
          duration: '7d',
          pageVariantId: friendlyId,
          timezoneOffset: -3,
        });
      });

      it('should re-load pageAnalytics when duration filter changes', async () => {
        analyticsContextService.watchDuration.and.returnValue(of({ id: '7D', value: '1d' }));
        await initTest();

        const friendlyId = 'foo1bar2baz30000aaaabbbbcccc1234_pt_br_default';

        expect(analyticsApiService.loadPageAnalytics).toHaveBeenCalledWith({
          pointOfSale: 'pointOfSale',
          duration: '1d',
          pageVariantId: friendlyId,
          timezoneOffset: -3,
        });
      });

      it('should update data bound properties of [pageAnalyticsGraphsComponent] based on parent component properties', async () => {
        await initTest();

        const graphCompEl = fixture.debugElement.query(
          By.directive(PageAnalyticsGraphsTestComponent),
        ).componentInstance;
        const state = await firstValueFrom(sut.state$);

        expect(graphCompEl.pageAnalytics).toEqual(state.pageAnalyticsData);
        expect(graphCompEl.isValidData).toEqual(state.isPosIdentifierDefined && sut.isCdpAppConfigured());
        expect(graphCompEl.duration).toEqual(state.durationFilter['value']);
        expect(graphCompEl.variants).toEqual(state.variantFilter);
      });

      it('should hide second drop list when variant filter changes & second variant is not defined', async () => {
        const variantFilter: AnalyticsVariantFilterValue = {
          variantOne: { variantName: 'test-variant1', variantId: 'id1' },
        };
        analyticsContextService.watchVariantFilterChanges.and.returnValue(of(variantFilter));
        await initTest();

        const secondDroplist = getAllDropList()[1].nativeElement;

        expect(secondDroplist.classList).toContain('hidden');
      });

      describe('handleVariantOptions', () => {
        describe('second variant is not added', () => {
          it('should not exclude variant from the list', async () => {
            await initTest();

            const dropListBtn = getAllDropList()[0].query(By.css('button.ng-spd-droplist-toggle')).nativeElement;
            dropListBtn.dispatchEvent(new Event('click'));

            const firstDropListVariants = getAllDropList()[0].queryAll(By.css('ng-spd-droplist-item'));

            expect(firstDropListVariants.length).toBe(3);
          });

          it('should hide second variant drop list', async () => {
            await initTest();

            const secondDroplist = getAllDropList()[1].nativeElement;

            expect(secondDroplist.classList).toContain('hidden');
          });

          it('should show add variant sliding button', async () => {
            await initTest();

            const slidingButton = fixture.debugElement.query(By.css('.add-variant-btn')).nativeElement;

            expect(slidingButton).toBeDefined();
            expect(slidingButton.innerText).toContain('ANALYTICS.ADD_PAGE_VARIANT');
          });

          describe('AND second variant is added', () => {
            it('should exclude variant from the list', async () => {
              const variantFilter: AnalyticsVariantFilterValue = {
                variantOne: { variantName: null, variantId: 'default' },
                variantTwo: { variantName: 'test-variant2', variantId: 'id2' },
              };
              analyticsContextService.watchVariantFilterChanges.and.returnValue(of(variantFilter));
              await initTest();

              const firstDropListBtn = getAllDropList()[0].query(By.css('button.ng-spd-droplist-toggle')).nativeElement;
              firstDropListBtn.dispatchEvent(new Event('click'));

              await fixture.whenStable();

              const firstDropListVariants = fixture.debugElement.queryAll(By.css('ng-spd-droplist-item'));
              expect(firstDropListVariants.length).toBe(2);
            });
          });
        });

        describe('AND POS is not defined', () => {
          it('should show no-pos error banner', async () => {
            ConfigurationService.tenantName = 'test-tenant';
            analyticsContextService.getPointOfSale.and.returnValue(of(null));
            await initTest();

            expect(errorBanner()).toBeDefined();
            expect(errorBanner().title).toEqual('ANALYTICS.NO_POS_IDENTIFIER.HEADER');
            expect(errorBanner().text).toEqual('ANALYTICS.NO_POS_IDENTIFIER.DESCRIPTION');
            expect(errorBanner().linkText).toEqual('ANALYTICS.NO_POS_IDENTIFIER.DASHBOARD_SETTINGS');
            expect(errorBanner().linkUrl.changingThisBreaksApplicationSecurity).toEqual(
              'https://dashboard-app-url.com/sites/sitecore1/siteidentifiers?tenantName=test-tenant',
            );
          });
        });

        describe('AND second variant is added', () => {
          it('should exclude variant from the list', async () => {
            const variantFilter: AnalyticsVariantFilterValue = {
              variantOne: { variantName: null, variantId: 'default' },
              variantTwo: { variantName: 'test-variant2', variantId: 'id2' },
            };
            analyticsContextService.watchVariantFilterChanges.and.returnValue(of(variantFilter));
            await initTest();

            const firstDropListBtn = getAllDropList()[0].query(By.css('button.ng-spd-droplist-toggle')).nativeElement;
            firstDropListBtn.dispatchEvent(new Event('click'));

            await fixture.whenStable();

            const firstDropListVariants = fixture.debugElement.queryAll(By.css('ng-spd-droplist-item'));

            expect(firstDropListVariants.length).toBe(2);
          });

          it('should emit "noDataForFirstVariant"-notification', async () => {
            // await fixture.whenStable();

            const variantFilter: AnalyticsVariantFilterValue = {
              variantOne: { variantName: null, variantId: 'default' },
              variantTwo: { variantName: 'test-variant2', variantId: 'id2' },
            };
            analyticsContextService.watchVariantFilterChanges.and.returnValue(of(variantFilter));
            analyticsApiService.loadPageAnalytics.and.returnValues(
              Promise.resolve({
                apiIsBroken: false,
                requestIsInvalid: false,
                data: getEmptyPageAnalytics(),
              }),
              Promise.resolve({
                apiIsBroken: false,
                requestIsInvalid: false,
                data: getDefaultVariantPageAnalytics(),
              }),
            );

            await initTest();

            expect(timedNotificationService.push).toHaveBeenCalledWith(
              'noDataForFirstVariant',
              jasmine.anything(),
              'info',
            );
          });

          it('should emit "noDataForSecondVariant"-notification', async () => {
            const variantFilter: AnalyticsVariantFilterValue = {
              variantOne: { variantName: null, variantId: 'default' },
              variantTwo: { variantName: 'test-variant2', variantId: 'id2' },
            };
            analyticsContextService.watchVariantFilterChanges.and.returnValue(of(variantFilter));
            analyticsApiService.loadPageAnalytics.and.returnValues(
              Promise.resolve({
                apiIsBroken: false,
                requestIsInvalid: false,
                data: getDefaultVariantPageAnalytics(),
              }),
              Promise.resolve({
                apiIsBroken: false,
                requestIsInvalid: false,
                data: getEmptyPageAnalytics(),
              }),
            );
            await initTest();

            expect(timedNotificationService.push).toHaveBeenCalledWith(
              'noDataForSecondVariant',
              jasmine.anything(),
              'info',
            );
          });
        });
      });
    });
  });
});
