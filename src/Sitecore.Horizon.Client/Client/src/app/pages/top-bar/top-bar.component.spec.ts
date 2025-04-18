/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Data } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { CmUrlTestingModule } from 'app/shared/pipes/platform-url/cm-url.module.testing';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ReplaySubject, of } from 'rxjs';
import { LHSNavigationService } from '../../pages/left-hand-side/lhs-navigation.service';
import { TopBarComponent } from './top-bar.component';

@Component({
  template: `<app-top-bar
    [contextViewInfo]="contextViewInfo"
    [renderGlobalElementsRegion]="renderGlobalElementsRegion"
  ></app-top-bar>`,
})
class TopBarTestComponent {
  renderGlobalElementsRegion = true;
  contextViewInfo = {
    header: 'Test Header',
    pageDisplayName: 'Test Display Name',
  };
}

describe(TopBarComponent.name, () => {
  let sut: TopBarComponent;
  let lhsNavigationServiceSpy: jasmine.SpyObj<LHSNavigationService>;
  let pageTemplatesService: jasmine.SpyObj<PageTemplatesService>;
  let contextService: ContextServiceTesting;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let routeData: ReplaySubject<Data>;

  let testComponent: TopBarTestComponent;
  let fixture: ComponentFixture<TopBarTestComponent>;
  const de = () => fixture.debugElement;

  const isVisibleSiteLanguageSwitcher = () => !!de().query(By.css('app-site-language-switcher'));
  const isVisibleDashboardLink = () => !!de().query(By.css('app-application-links'));
  const isVisibleAppSwitcher = () => !!de().query(By.css('app-hz-app-switcher'));
  const isVisibleCloseBtn = () => !!de().query(By.css('.design-close-btn'));
  const backToPageDesignBtn = () => de().query(By.css('.back-to-page-design button'));
  const pageInfoDivForPageAndPartialDesigns = () => de().query(By.css('.page-info.with-icon'));
  const pageInfoDiv = () => de().query(By.css('page-info'));

  const featureFlagServiceStub = {
    isFeatureEnabled: () => of(true),
  };

  beforeEach(async () => {
    routeData = new ReplaySubject<Data>(1);
    activatedRoute = jasmine.createSpyObj<ActivatedRoute>('Activated route', [], {
      data: routeData,
    });

    await TestBed.configureTestingModule({
      imports: [
        CmUrlTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        {
          provide: LHSNavigationService,
          useValue: jasmine.createSpyObj<LHSNavigationService>('LHSNavigationService', ['watchRouteSegment']),
        },
        { provide: ActivatedRoute, useValue: activatedRoute },
        {
          provide: FeatureFlagsService,
          useValue: featureFlagServiceStub,
        },
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', [
            'setContextPageDesign',
            'watchContextPageDesign',
          ]),
        },
      ],
      declarations: [TopBarComponent, TopBarTestComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopBarTestComponent);
    sut = de().query(By.directive(TopBarComponent)).componentInstance;
    testComponent = fixture.componentInstance;

    lhsNavigationServiceSpy = TestBedInjectSpy(LHSNavigationService);
    lhsNavigationServiceSpy.watchRouteSegment.and.returnValue(of('editor'));

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideDefaultTestContext();

    pageTemplatesService = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesService.watchContextPageDesign.and.returnValue(of(undefined));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(testComponent).toBeTruthy();
    expect(sut).toBeTruthy();
  });

  describe('contextPageDesign', () => {
    it('should show the close button and hide back to partial design button', () => {
      lhsNavigationServiceSpy.watchRouteSegment.and.returnValue(of('editpartialdesign'));
      sut.ngOnInit();
      fixture.detectChanges();

      expect(isVisibleCloseBtn()).toBe(true);
      expect(backToPageDesignBtn()).toBeFalsy();
    });

    it('should hide the close button and show back to partial design button', () => {
      lhsNavigationServiceSpy.watchRouteSegment.and.returnValue(of('editpartialdesign'));
      pageTemplatesService.watchContextPageDesign.and.returnValue(of({ id: 'pageDesignId', version: 1 }));
      sut.ngOnInit();
      fixture.detectChanges();

      expect(isVisibleCloseBtn()).toBe(false);
      expect(isVisibleAppSwitcher()).toBe(false);
      expect(isVisibleDashboardLink()).toBe(false);
      expect(isVisibleSiteLanguageSwitcher()).toBe(false);
      expect(backToPageDesignBtn()).toBeTruthy();
    });

    it('should navigate to editpagedesign', () => {
      const spy = spyOn(sut, 'goToEditPageDesign');
      lhsNavigationServiceSpy.watchRouteSegment.and.returnValue(of('editpartialdesign'));
      pageTemplatesService.watchContextPageDesign.and.returnValue(of({ id: 'pageDesignId', version: 1 }));
      sut.ngOnInit();
      fixture.detectChanges();

      (backToPageDesignBtn().nativeElement as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith({ id: 'pageDesignId', version: 1 });
    });
  });

  describe('page info', () => {
    it('should show page design info when edit page design', () => {
      lhsNavigationServiceSpy.watchRouteSegment.and.returnValue(of('editpagedesign'));
      sut.ngOnInit();
      fixture.detectChanges();

      expect(pageInfoDivForPageAndPartialDesigns()).toBeTruthy();
      expect(pageInfoDiv()).toBeFalsy();
    });

    it('should show partial design info when edit partial design', () => {
      lhsNavigationServiceSpy.watchRouteSegment.and.returnValue(of('editpartialdesign'));
      sut.ngOnInit();
      fixture.detectChanges();

      expect(pageInfoDivForPageAndPartialDesigns()).toBeTruthy();
      expect(pageInfoDiv()).toBeFalsy();
    });
  });
});
