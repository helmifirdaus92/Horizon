/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsContextService } from 'app/analytics/analytics-context.service';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { LHSNavigationService } from 'app/pages/left-hand-side/lhs-navigation.service';
import { TopBarComponent } from 'app/pages/top-bar/top-bar.component';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ItemChange, ItemChangeService } from 'app/shared/client-state/item-change-service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { Item } from 'app/shared/graphql/item.interface';
import { Language, LanguageService } from 'app/shared/site-language/site-language.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { NEVER, of, Subject } from 'rxjs';

import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { PagePaneComponent } from 'app/component-lib/page/page-pane.component';
import { PageModule } from 'app/component-lib/page/page.module';
import { SplitPaneComponent } from 'app/component-lib/split-pane/split-pane.component';
import { LhsPanelStateService } from 'app/editor/lhs-panel/lhs-panel.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { PageDesignRoutingService } from 'app/page-design/shared/page-design-routing.service';
import { EditingChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
  RenderingFieldsdData,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { PagesComponent } from './pages.component';
import { PagesService } from './pages.service';

const INITIAL_CONTEXT = {
  itemId: 'foo',
  language: 'en',
  siteName: 'website',
};

@Component({
  template: '',
})
class NoComponent {}

const testRoutes: Routes = [
  {
    path: 'editor',
    data: { state: 'editor', reuse: true },
    component: NoComponent,
  },
  {
    path: 'components',
    data: { state: 'editor', reuse: true },
    component: NoComponent,
  },
  {
    path: 'templates',
    data: { state: 'templates', reuse: false },
    component: NoComponent,
  },
  {
    path: 'editpartialdesign',
    data: { state: 'editor', reuse: false },
    component: NoComponent,
  },
  {
    path: 'editpagedesign',
    data: { state: 'editor', reuse: false },
    component: NoComponent,
  },
  {
    path: 'personalization',
    data: { state: 'editor', reuse: true },
    component: NoComponent,
  },
  {
    path: 'metadata',
    data: { state: 'metadata', reuse: false },
    component: NoComponent,
  },
  {
    path: 'analytics',
    data: { state: 'analytics' },
    component: NoComponent,
    children: [
      {
        path: 'site',
        data: { hideLHS: true },
        component: NoComponent,
      },
      {
        path: 'page',
        data: { hideLHS: false },
        component: NoComponent,
      },
      { path: '', redirectTo: 'site', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'editor', pathMatch: 'full' },
];

const testLanguages: Language[] = [
  { displayName: 'English', name: 'en', nativeName: 'English', iso: 'en', englishName: 'English' },
];

describe(PagesComponent.name, () => {
  let sut: PagesComponent;
  let fixture: ComponentFixture<PagesComponent>;
  let debugEl: DebugElement;
  let contextService: ContextServiceTesting;
  let languageService: jasmine.SpyObj<LanguageService>;
  let lhsNavigationService: jasmine.SpyObj<LHSNavigationService>;
  let analyticsContextService: jasmine.SpyObj<AnalyticsContextService>;
  let itemChangeServiceSpy: jasmine.SpyObj<ItemChangeService>;
  let pageTemplatesService: jasmine.SpyObj<PageTemplatesService>;
  let router: Router;
  let ngZone: NgZone;
  let lhsPanelStateService: LhsPanelStateService;

  let resizeCallback: ResizeObserverCallback;
  let originalResizeObserver: typeof ResizeObserver;

  let editingTestChannel: TestMessagingP2PChannel<
    EditingCanvasEvents,
    EditingHorizonEvents,
    EditingCanvasRpcServices,
    EditingHorizonRpcServices
  >;

  const getPageInfoDiv = () => debugEl.query(By.css('.page-info')).nativeElement as HTMLDivElement;

  const getTopBar = () => debugEl.query(By.directive(TopBarComponent)).nativeElement;

  const getLHS = () => debugEl.query(By.css('ng-spd-split-pane')).nativeElement as SplitPaneComponent;

  const getRHS = () => debugEl.query(By.directive(PagePaneComponent)).componentInstance;

  const rhsStateChangeEmitter: PagesService['_rhsStateChange$'] = new Subject();

  const featureFlagServiceStub = {
    isFeatureEnabled: () => of(true),
  };

  beforeAll(() => {
    originalResizeObserver = (window as any).ResizeObserver;

    class MockResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        resizeCallback = cb;
      }
      observe() {}
      disconnect() {}
    }

    (window as any).ResizeObserver = MockResizeObserver as any;
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PagesComponent, TopBarComponent],
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        RouterTestingModule.withRoutes(testRoutes),
        NoopAnimationsModule,
        SitecoreExtensibilityModule,
        ContextServiceTestingModule,
        PageModule,
        AppLetModule,
      ],
      providers: [
        {
          provide: LHSNavigationService,
          useValue: jasmine.createSpyObj<LHSNavigationService>('LHSNavigationService', [
            'provideRouter',
            'watchRouteSegment',
            'watchRouteSegmentWithQueryParams',
          ]),
        },
        {
          provide: LanguageService,
          useValue: jasmine.createSpyObj<LanguageService>('LanguageService', ['getLanguages']),
        },
        {
          provide: AnalyticsContextService,
          useValue: jasmine.createSpyObj<AnalyticsContextService>('AnalyticsContextService', ['watchActiveRoute']),
        },
        {
          provide: ItemChangeService,
          useValue: jasmine.createSpyObj<ItemChangeService>({
            watchForChanges: NEVER,
          }),
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj('ConfigurationService', { isExternalComponentsEnabled: false }),
        },
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>('MessagingService', ['getEditingCanvasChannel']),
        },
        {
          provide: PagesService,
          useValue: jasmine.createSpyObj<PagesService>(
            'PagesService',
            {},
            { rhsStateChange$: rhsStateChangeEmitter.asObservable() },
          ),
        },
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
        {
          provide: PageDesignRoutingService,
          useValue: jasmine.createSpyObj<PageDesignRoutingService>('PageDesignRouteService', ['removeDesignParams$']),
        },
        LhsPanelStateService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    lhsPanelStateService = TestBed.inject(LhsPanelStateService);
    editingTestChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, {
      updatePageState: () => {},
      selectChrome: () => {},
      deselectChrome: () => {},
      highlightPartialDesign: () => {},
      unhighlightPartialDesign: () => {},
      getChildRenderings: () => [],
      getChildPlaceholders: () => [],
      selectRendering: () => {},
      getRenderingFields: () => ({}) as RenderingFieldsdData,
      getPageFields: () => [],
    });

    fixture = TestBed.createComponent(PagesComponent);
    sut = fixture.componentInstance;
    debugEl = fixture.debugElement;

    router = TestBed.inject(Router);

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(INITIAL_CONTEXT);

    languageService = TestBedInjectSpy(LanguageService);
    languageService.getLanguages.and.returnValue(of(testLanguages));
    itemChangeServiceSpy = TestBedInjectSpy(ItemChangeService);

    lhsNavigationService = TestBedInjectSpy(LHSNavigationService);
    lhsNavigationService.watchRouteSegment.and.returnValue(of('editor'));
    lhsNavigationService.watchRouteSegmentWithQueryParams.and.returnValue(of({ segment: 'editor', queryParams: {} }));

    const messaging = TestBedInjectSpy(MessagingService);
    messaging.getEditingCanvasChannel.and.returnValue(editingTestChannel);

    analyticsContextService = TestBedInjectSpy(AnalyticsContextService);
    analyticsContextService.watchActiveRoute.and.returnValue(of('page'));

    pageTemplatesService = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesService.watchContextPageDesign.and.returnValue(of({ id: 'pageDesignId', version: 1 }));

    ngZone = TestBed.inject(NgZone);
    fixture.detectChanges();
  });

  afterEach(waitForAsync(() => {
    sut.ngOnDestroy();
  }));

  afterAll(() => {
    (window as any).ResizeObserver = originalResizeObserver;
  });

  it('should create', () => {
    expect(sut).toBeDefined();
  });

  describe('page info', () => {
    it('should show correct page name', async () => {
      spyOn(contextService, 'getItem').and.resolveTo({ displayName: 'Home' } as Item);
      contextService.setTestItemVersion(2);

      await fixture.whenStable();
      fixture.detectChanges();

      const pageInfoDiv = getPageInfoDiv();
      const displayNameText = pageInfoDiv.querySelector('h4');

      expect(displayNameText).toBeTruthy();
      expect(displayNameText?.innerText).toContain('Home');
    });

    it('should not show sub-header text if active route is `analytics` and state is `page`', async () => {
      spyOn(contextService, 'getItem').and.resolveTo({ displayName: 'Home' } as Item);
      contextService.setTestItemVersion(2);
      await ngZone.run(() => router.navigate(['analytics']));
      sut.hideLHS$ = of(false);

      fixture.detectChanges();

      const pageInfoDiv = getPageInfoDiv();
      const displayNameText = pageInfoDiv.querySelector('h4');

      expect(displayNameText?.innerText).toContain('Home');
    });

    it('should watch for scope changes', fakeAsync(() => {
      const itemChanges$ = new Subject<ItemChange>();
      itemChangeServiceSpy.watchForChanges.and.returnValue(itemChanges$);

      itemChanges$.next({ itemId: 'test-id', scopes: ['display-name'] });
      tick();

      expect(itemChangeServiceSpy.watchForChanges).toHaveBeenCalledWith(
        jasmine.objectContaining({
          scopes: ['display-name'],
        }),
      );
      flush();
    }));
  });

  describe('left hand side', () => {
    it('should show LHS by default', async () => {
      await ngZone.run(() => router.navigate(['editor']));

      sut.ngOnInit();
      fixture.detectChanges();

      const LHS = getLHS();
      expect(LHS.hide).toBeFalsy();
    });

    it('should show LHS WHEN page analytics is rendered', async () => {
      await ngZone.run(() => router.navigate(['analytics/page']));

      sut.ngOnInit();
      fixture.detectChanges();

      const LHS = getLHS();
      expect(LHS.hide).toBeFalsy();
    });

    it('should show LHS WHEN page templates is rendered', async () => {
      await ngZone.run(() => router.navigate(['templates']));

      sut.ngOnInit();
      fixture.detectChanges();

      const LHS = getLHS();
      expect(LHS.hide).toBeFalsy();
    });

    it('should hide LHS WHEN site analytics is rendered', async () => {
      await ngZone.run(() => router.navigate(['analytics/site']));
      analyticsContextService.watchActiveRoute.and.returnValue(of('site'));

      sut.ngOnInit();
      fixture.detectChanges();

      const LHS = getLHS();
      expect(LHS.hide).toBeTrue();
    });

    it('should show LHS when edit partial design is rendered', async () => {
      await ngZone.run(() => router.navigate(['editpartialdesign']));
      lhsNavigationService.watchRouteSegmentWithQueryParams.and.returnValue(
        of({ segment: 'editpartialdesign', queryParams: {} }),
      );

      sut.ngOnInit();
      fixture.detectChanges();

      const LHS = getLHS();
      expect(LHS.hide).toBeFalsy();
    });

    it('should show LHS when edit page design is rendered', async () => {
      await ngZone.run(() => router.navigate(['editpagedesign']));
      lhsNavigationService.watchRouteSegmentWithQueryParams.and.returnValue(
        of({ segment: 'editpagedesign', queryParams: {} }),
      );

      sut.ngOnInit();
      fixture.detectChanges();

      const LHS = getLHS();
      expect(LHS.hide).toBeFalsy();
    });
  });

  describe('top bar', () => {
    it('should not show display mode buttons WHEN analytics is rendered', async () => {
      await ngZone.run(() => router.navigate(['analytics']));
      analyticsContextService.watchActiveRoute.and.returnValue(of('site'));

      sut.ngOnInit();
      fixture.detectChanges();

      const deviceSelector = fixture.debugElement.query(By.css('app-device-selector'));
      expect(deviceSelector).toBeFalsy();
    });

    it('should not show display mode buttons WHEN templates is rendered', async () => {
      await ngZone.run(() => router.navigate(['templates']));
      analyticsContextService.watchActiveRoute.and.returnValue(of('site'));

      sut.ngOnInit();
      fixture.detectChanges();

      const deviceSelector = fixture.debugElement.query(By.css('app-device-selector'));
      expect(deviceSelector).toBeFalsy();
    });
  });

  describe('right hand side', () => {
    it('should show RHS', async () => {
      await ngZone.run(() => router.navigate(['editor']));

      sut.ngOnInit();
      fixture.detectChanges();

      const RHS = getRHS();
      expect(RHS).toBeTruthy();
      expect(RHS.hide).toBeFalsy();
    });

    it('should hide RHS WHEN site analytics is rendered', async () => {
      await ngZone.run(() => router.navigate(['analytics']));

      sut.ngOnInit();
      fixture.detectChanges();

      const RHS = getRHS();
      expect(RHS.hide).toBeTrue();
    });

    it('should hide RHS on templates mode', async () => {
      await ngZone.run(() => router.navigate(['templates']));

      sut.ngOnInit();
      fixture.detectChanges();

      const RHS = getRHS();
      expect(RHS.hide).toBeTrue();
    });

    it('should show RHS WHEN edit patial design is rendered', async () => {
      await ngZone.run(() => router.navigate(['editpartialdesign']));
      lhsNavigationService.watchRouteSegmentWithQueryParams.and.returnValue(
        of({ segment: 'editpartialdesign', queryParams: {} }),
      );

      sut.ngOnInit();
      fixture.detectChanges();

      const RHS = getRHS();
      expect(RHS.hide).toBeFalsy();
    });

    it('should hide RHS WHEN edit page design is rendered', async () => {
      await ngZone.run(() => router.navigate(['editpagedesign']));
      lhsNavigationService.watchRouteSegmentWithQueryParams.and.returnValue(
        of({ segment: 'editpagedesign', queryParams: {} }),
      );

      sut.ngOnInit();
      fixture.detectChanges();

      const RHS = getRHS();
      expect(RHS.hide).toBeTrue();
    });

    describe('Change RHS from the Pages service', () => {
      it('should change the RHS state when Pages service emits changes', async () => {
        await ngZone.run(() => router.navigate(['editor']));

        // Initial state
        expect(getRHS()).toBeTruthy();
        expect(getRHS().hide).toBeFalsy();

        // Close
        rhsStateChangeEmitter.next('close');
        fixture.detectChanges();

        expect(getRHS().hide).toBeTruthy();
        expect(getRHS().show).toBeFalsy();

        // Open
        rhsStateChangeEmitter.next('open');
        fixture.detectChanges();

        expect(getRHS().hide).toBeFalsy();
        expect(getRHS().show).toBeTruthy();

        // Toggle
        rhsStateChangeEmitter.next('toggle');
        fixture.detectChanges();

        expect(getRHS().hide).toBeTruthy();
        expect(getRHS().show).toBeFalsy();
      });
    });

    describe('expanded LHS panel', () => {
      afterEach(() => {
        lhsPanelStateService.setExpand(false);
      });

      it('should disable device switcher when LHS panel is expanded', () => {
        lhsPanelStateService.setExpand(true);
        fixture.detectChanges();

        sut.ngOnInit();
        fixture.detectChanges();

        const RHS = getRHS();
        expect(RHS.hide).toBeTrue();
      });
    });
  });

  describe('deselectChrome()', () => {
    it('should deselectChrome when clicking on top bar', async () => {
      await ngZone.run(() => router.navigate(['editor']));
      const deselectSpy = spyOn(sut, 'deselectChrome');

      sut.ngOnInit();
      fixture.detectChanges();

      const topBar = getTopBar() as unknown as HTMLElement;
      topBar.click();
      fixture.detectChanges();

      expect(deselectSpy).toHaveBeenCalled();
    });
  });

  describe('dock/undock RHS', () => {
    it('should auto-dock RHS when canvas width is too small during resize', fakeAsync(async () => {
      const mockWorkspace = document.createElement('div');
      Object.defineProperty(mockWorkspace, 'clientWidth', { value: 200 });

      const rhsEl = document.createElement('div');
      Object.defineProperty(rhsEl, 'offsetLeft', { value: 0 });
      Object.defineProperty(rhsEl, 'offsetTop', { value: 100 });
      Object.defineProperty(rhsEl, 'offsetWidth', { value: 300 });

      sut.rhs = {
        elementRef: {
          nativeElement: rhsEl,
        },
      } as any;

      sut['editorWorkspaceEl'] = mockWorkspace;
      sut['rhsIsDocked$'] = of(false);

      const toggleDockSpy = spyOn(sut['rhsPositionService'], 'setDockState').and.callThrough();
      spyOn(sut as any, 'adjustRhsElementPositionAfterMove');
      spyOn(sut as any, 'adjustRhsElementSizeAfterMove');

      resizeCallback([{ target: mockWorkspace }] as unknown as ResizeObserverEntry[], {} as ResizeObserver);

      tick();

      expect(toggleDockSpy).toHaveBeenCalledWith(true);
      flush();
    }));

    it('should clamp RHS position within bounds', fakeAsync(async () => {
      sut.rhs = {
        elementRef: {
          nativeElement: {
            offsetLeft: 0,
            offsetTop: 0,
            offsetWidth: 400,
            style: {},
          },
        },
      } as any;

      sut.lhs = {
        elementRef: {
          nativeElement: {
            offsetWidth: 200,
          },
        },
      } as any;

      spyOnProperty(window, 'innerWidth').and.returnValue(800);
      spyOnProperty(window, 'innerHeight').and.returnValue(600);

      sut['rhsIsDocked$'] = of(false);

      await sut['adjustRhsElementPositionAfterMove'](900, 700);

      const style = sut.rhs?.elementRef?.nativeElement?.style;

      expect(parseInt(style.left)).toBeLessThanOrEqual(800 - 400);
      expect(parseInt(style.top)).toBeLessThanOrEqual(600 - 200);
      flush();
    }));

    it('should create and remove drag overlay', () => {
      const rhsEl = document.createElement('div');
      document.body.appendChild(rhsEl);

      sut.rhs = {
        elementRef: {
          nativeElement: rhsEl,
        },
      } as any;

      sut['initDragCatchingOverlay']();
      expect(document.querySelector('div[style*="position: absolute"]')).toBeTruthy();

      sut['removeDragCatchOverlay']();
      expect(document.querySelector('div[style*="position: absolute"]')).toBeFalsy();
    });

    it('should set dragStart and init overlay when dragging from handle', () => {
      const dragHandle = document.createElement('div');
      dragHandle.id = 'editor-rhs-drag-handle';

      spyOn(dragHandle, 'closest').and.returnValue(dragHandle);

      const rhsWrapper = document.createElement('div');
      rhsWrapper.appendChild(dragHandle);

      sut.rhs = {
        elementRef: { nativeElement: rhsWrapper },
      } as any;

      sut.dragTarget = dragHandle;

      const dataTransferMock = {
        setData: jasmine.createSpy('setData'),
        effectAllowed: '',
        dropEffect: '',
      };

      const mockEvent = {
        clientX: 150,
        clientY: 300,
        dataTransfer: dataTransferMock,
        currentTarget: {
          offsetLeft: 100,
          offsetTop: 150,
        },
        preventDefault: jasmine.createSpy('preventDefault'),
        stopImmediatePropagation: jasmine.createSpy('stopImmediatePropagation'),
      } as unknown as DragEvent;

      sut.onDragStart(mockEvent);

      expect(sut.dragStart.clientX).toBe(50);
      expect(sut.dragStart.clientY).toBe(150);
      expect(dataTransferMock.setData).toHaveBeenCalledWith('Text', '');
    });

    it('should cancel drag if target is not drag handle', () => {
      const event = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
      });

      sut.dragTarget = document.createElement('div');

      const preventSpy = spyOn(event, 'preventDefault');
      const stopSpy = spyOn(event, 'stopImmediatePropagation');

      sut.onDragStart(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should adjust RHS position and size on drag end', fakeAsync(async () => {
      const rhsEl = document.createElement('div');
      sut.rhs = {
        elementRef: { nativeElement: rhsEl },
      } as any;

      sut['rhsIsDocked$'] = of(false);
      sut.dragStart = { clientX: 50, clientY: 100 };

      const e = new DragEvent('dragend', {
        clientX: 250,
        clientY: 300,
      });

      const adjustPositionSpy = spyOn(sut as any, 'adjustRhsElementPositionAfterMove');
      const adjustSizeSpy = spyOn(sut as any, 'adjustRhsElementSizeAfterMove');

      await sut.onDragEnd(e);

      expect(adjustPositionSpy).toHaveBeenCalledWith(200, 200);
      expect(adjustSizeSpy).toHaveBeenCalled();
      flush();
    }));
  });
});
