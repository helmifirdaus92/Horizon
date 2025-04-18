/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { ApmHelperService } from 'app/apm/apm-helper.service';
import { XmCloudSessionManagerService } from 'app/authentication/xmCloudSessionManager.service';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { adminPermissions, mockThumbnailUrl } from 'app/page-design/shared/page-templates-test-data';
import { LHSNavigationService } from 'app/pages/left-hand-side/lhs-navigation.service';
import { CanvasRenderingApiService } from 'app/shared/canvas/canvas-rendering-api.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ActiveDevice, DeviceService } from 'app/shared/client-state/device.service';
import { Item } from 'app/shared/graphql/item.interface';
import { EditingChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  BasicChromeInfo,
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
  RenderingFieldsdData,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { TestBedInjectSpy, TESTING_URL } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject, of, ReplaySubject, Subject } from 'rxjs';
import { LhsPanelStateService } from '../lhs-panel/lhs-panel.service';
import { VersionsUtilService } from '../right-hand-side/versions/versions-util.service';
import { VersionsWorkflowService } from '../shared/versions-workflow/versions-workflow.service';
import { EditorWorkspaceComponent } from './editor-workspace.component';
import { EditorWorkspaceService } from './editor-workspace.service';

@Component({
  selector: 'ng-spd-loading-indicator',
  template: '',
})
class TestSpdLoadingComponent {}

@Component({
  selector: 'test-workspace-componet',
  template: `
    <app-editor-workspace [iframeUrl$]="iframeUrl" [canvasLoading$]="canvasLoading$"></app-editor-workspace>
  `,
})
class TestComponent {
  iframeUrl = new BehaviorSubject<{ url: string; pageReload: boolean; chromeToSelect?: BasicChromeInfo }>({
    url: TESTING_URL,
    pageReload: false,
  });

  canvasLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}

describe(EditorWorkspaceComponent.name, () => {
  let testComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let sut: EditorWorkspaceComponent;
  let contextServiceSpy: jasmine.SpyObj<ContextService>;
  let editorWorkspaceService: jasmine.SpyObj<EditorWorkspaceService>;
  let canvasRenderingApiService: jasmine.SpyObj<CanvasRenderingApiService>;
  let activeDevice$: BehaviorSubject<ActiveDevice>;
  let versionsWorkflowService: jasmine.SpyObj<VersionsWorkflowService>;
  let versionsUtilService: jasmine.SpyObj<VersionsUtilService>;
  let pageTemplatesServiceSpy: jasmine.SpyObj<PageTemplatesService>;
  let lhsNavigationServiceSpy: jasmine.SpyObj<LHSNavigationService>;
  let activeNavigation$: Subject<string>;
  let lhsPanelStateService: LhsPanelStateService;

  let editingTestChannel: TestMessagingP2PChannel<
    EditingCanvasEvents,
    EditingHorizonEvents,
    EditingCanvasRpcServices,
    EditingHorizonRpcServices
  >;

  let timedNotificationService: jasmine.SpyObj<TimedNotificationsService>;

  const welcomeMessage = () => {
    return fixture.debugElement.query(By.css('.select-partial-design-message'));
  };

  // Explore the last IFrame, since it is either the active one or a newlyCreated
  const getLastIframe = (): HTMLIFrameElement => {
    return fixture.debugElement.queryAll(By.css('iframe')).reverse()[0].nativeElement;
  };

  const getWrapper = (): HTMLDivElement => {
    return fixture.debugElement.query(By.css('.app-editor-wrapper')).nativeElement;
  };

  const detectChangesAndLoadIFrame = (): void => {
    fixture.detectChanges();
    tick();
    getLastIframe().dispatchEvent(new Event('load'));
    fixture.detectChanges();
  };

  const selectedPartialDesign = [
    {
      path: '/path/to/shared/partial-design',
      displayName: 'Sharted Partial Design 2',
      itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C2',
      name: 'SharedPartialDesign1',
      version: 1,
      hasChildren: false,
      thumbnailUrl: mockThumbnailUrl,
      hasPresentation: true,
      isFolder: false,
      insertOptions: [],
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      access: adminPermissions,
      children: undefined,
    },
  ];

  const newUrl = 'javascript:void(0)';

  beforeEach(waitForAsync(() => {
    activeDevice$ = new BehaviorSubject<ActiveDevice>({
      id: 'desktop-small',
      name: 'Desktop small',
      width: 1024,
      isDefault: true,
    });

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NoopAnimationsModule,
        TranslateModule,
        TranslateServiceStubModule,
        NoopAnimationsModule,
        ContextServiceTestingModule,
      ],
      declarations: [EditorWorkspaceComponent, TestSpdLoadingComponent, TestComponent],
      providers: [
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>('MessagingService', ['getEditingCanvasChannel']),
        },
        {
          provide: ContextService,
          useValue: jasmine.createSpyObj<ContextService>(['getItem']),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', [
            'pushNotification',
            'hideNotificationById',
          ]),
        },
        {
          provide: EditorWorkspaceService,
          useValue: jasmine.createSpyObj<EditorWorkspaceService>(['setCanvasLoadState']),
        },
        {
          provide: CanvasRenderingApiService,
          useValue: jasmine.createSpyObj<CanvasRenderingApiService>('CanvasRenderingApiService', [
            'fetchPageRendering',
          ]),
        },
        {
          provide: DeviceService,
          useValue: {
            active$: activeDevice$,
          },
        },
        {
          provide: VersionsWorkflowService,
          useValue: jasmine.createSpyObj<VersionsWorkflowService>(['watchActiveVersion']),
        },
        {
          provide: VersionsUtilService,
          useValue: jasmine.createSpyObj<VersionsUtilService>([
            'handleTimedNotifications',
            'hideNoActiveVersionNotification',
          ]),
        },
        {
          provide: LHSNavigationService,
          useValue: jasmine.createSpyObj<LHSNavigationService>('LHSNavigationService', ['watchRouteSegment']),
        },
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>(['watchSelectedPartialDesignItems']),
        },
        {
          provide: ApmHelperService,
          useValue: jasmine.createSpyObj<ApmHelperService>([
            'reportCanvasPageLoadStart',
            'reportCanvasPageLoadComplete',
          ]),
        },
        {
          provide: XmCloudSessionManagerService,
          useValue: jasmine.createSpyObj<XmCloudSessionManagerService>({
            setupSession: undefined,
            waitForSession: Promise.resolve(),
          }),
        },
        LhsPanelStateService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    const mockScriptElement = document.createElement('script');
    mockScriptElement.src = 'main.abc123.js';
    spyOn(document, 'querySelector').and.returnValue(mockScriptElement);

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

    contextServiceSpy = TestBedInjectSpy(ContextService);

    editorWorkspaceService = TestBedInjectSpy(EditorWorkspaceService);
    editorWorkspaceService.setCanvasLoadState.and.returnValue();

    const messaging = TestBedInjectSpy(MessagingService);
    messaging.getEditingCanvasChannel.and.returnValue(editingTestChannel);

    canvasRenderingApiService = TestBedInjectSpy(CanvasRenderingApiService);
    const html = '<h1>Hello word!</h1>';
    canvasRenderingApiService.fetchPageRendering.and.returnValue(Promise.resolve(html));

    versionsWorkflowService = TestBedInjectSpy(VersionsWorkflowService);
    versionsUtilService = TestBedInjectSpy(VersionsUtilService);

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;

    versionsUtilService.handleTimedNotifications.and.resolveTo();
    versionsUtilService.hideNoActiveVersionNotification.and.resolveTo();
    versionsWorkflowService.watchActiveVersion.and.callFake(() => of(undefined));

    const result = { layoutEditingKind: 'FINAL' } as any;
    contextServiceSpy.getItem.and.resolveTo(result);
    timedNotificationService = TestBedInjectSpy(TimedNotificationsService);

    activeNavigation$ = new ReplaySubject(1);
    lhsNavigationServiceSpy = TestBedInjectSpy(LHSNavigationService);
    lhsNavigationServiceSpy.watchRouteSegment.and.returnValue(activeNavigation$);
    pageTemplatesServiceSpy = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesServiceSpy.watchSelectedPartialDesignItems.and.returnValue(of([]));
    activeNavigation$.next('editpagedesign');
    sut = fixture.debugElement.query(By.directive(EditorWorkspaceComponent)).componentInstance;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should set loading state true into editor-workspace.service when url changes', () => {
    fixture.detectChanges();

    testComponent.iframeUrl.next({ url: newUrl, pageReload: false });

    fixture.detectChanges();

    const calls = editorWorkspaceService.setCanvasLoadState.calls.allArgs().map((item) => item[0]);
    expect(calls).toEqual([{ isLoading: true }, { isLoading: true }]);
    expect(editorWorkspaceService.setCanvasLoadState).toHaveBeenCalledWith({ isLoading: true });
  });

  describe('WHEN navigate to a new URL with iframe recreating', () => {
    it('should set the url', fakeAsync(() => {
      detectChangesAndLoadIFrame();

      expect(getLastIframe().src).toBe(TESTING_URL);
      flush();
    }));

    it('should expose iframe via static `getIframe` method', fakeAsync(() => {
      detectChangesAndLoadIFrame();

      const test = EditorWorkspaceComponent.getIframe();
      const iframe = getLastIframe();

      expect(test).toBeTruthy();
      expect(iframe).toBe(test);
      flush();
    }));

    it('should create new iframe when the url changes', fakeAsync(() => {
      fixture.detectChanges();

      testComponent.iframeUrl.next({ url: newUrl, pageReload: false });

      detectChangesAndLoadIFrame();

      expect(getLastIframe().src).toBe(newUrl);
      flush();
    }));

    describe('WHEN iframeUrl$ emits the same value', () => {
      /**
       * This is a real scenario when user navigates with a link in the Canvas.
       * And then navigates back to the original page using the content tree.
       * The iframeUrl will emit the same value because the navigation by link within the canvas doesn't update the url
       * But of course it's important to react on it in order to navigate back to the selected page.
       */
      it('should recreate the iframe', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        const iframe = getLastIframe();

        testComponent.iframeUrl.next({ url: TESTING_URL, pageReload: false });
        detectChangesAndLoadIFrame();

        expect(getLastIframe()).not.toBe(iframe);
        flush();
      }));
    });
  });

  describe('show layout editing warning message on iframe load', () => {
    it('should show message if layout type is SHARED', fakeAsync(() => {
      const result = { layoutEditingKind: 'SHARED' } as any;
      contextServiceSpy.getItem.and.resolveTo(result);
      detectChangesAndLoadIFrame();
      tick();

      const [{ id, text, severity, persistent }] = timedNotificationService.pushNotification.calls.mostRecent().args;

      // assert;
      expect(timedNotificationService.pushNotification).toHaveBeenCalledTimes(1);
      expect(id).toBe('shared-layout-change-warning');
      expect(text).toBe('WARNING.LAYOUT_EDITING_WARNING');
      expect(severity).toBe('info');
      expect(persistent).toBe(true);
      flush();
    }));

    it('should not show message if layout type is FINAL', fakeAsync(() => {
      const result = { layoutEditingKind: 'FINAL' } as any;
      contextServiceSpy.getItem.and.resolveTo(result);
      detectChangesAndLoadIFrame();

      // assert;
      expect(timedNotificationService.pushNotification).not.toHaveBeenCalled();
      flush();
    }));

    it('should hide message if layoutKind changes from SHARED', fakeAsync(() => {
      // Set an initial 'SHARED' layoutKind
      const result1 = { layoutEditingKind: 'SHARED' } as Item;
      contextServiceSpy.getItem.and.resolveTo(result1);

      testComponent.iframeUrl.next({ url: TESTING_URL, pageReload: false });
      detectChangesAndLoadIFrame();
      tick();

      // Change layoutKind
      const result2 = { layoutEditingKind: 'FINAL' } as Item;
      contextServiceSpy.getItem.and.resolveTo(result2);

      testComponent.iframeUrl.next({ url: TESTING_URL, pageReload: false });
      detectChangesAndLoadIFrame();
      tick();

      // assert;
      expect(timedNotificationService.hideNotificationById).toHaveBeenCalledWith('shared-layout-change-warning');
      expect(sut.displayedShareLayoutWarning).toBe(false);
      flush();
    }));

    it('should re-show message if layoutKind changes back to SHARED', fakeAsync(() => {
      // Set an initial 'SHARED' layoutKind
      const result1 = { layoutEditingKind: 'SHARED' } as Item;
      contextServiceSpy.getItem.and.resolveTo(result1);
      testComponent.iframeUrl.next({ url: TESTING_URL, pageReload: false });
      detectChangesAndLoadIFrame();
      tick();

      // Change layoutKind to 'FINAL'
      const result2 = { layoutEditingKind: 'FINAL' } as Item;
      contextServiceSpy.getItem.and.resolveTo(result2);
      testComponent.iframeUrl.next({ url: TESTING_URL, pageReload: false });
      detectChangesAndLoadIFrame();
      tick();

      // Change layoutKind back to 'SHARED'
      const result3 = { layoutEditingKind: 'SHARED' } as Item;
      contextServiceSpy.getItem.and.resolveTo(result3);
      testComponent.iframeUrl.next({ url: TESTING_URL, pageReload: false });
      detectChangesAndLoadIFrame();
      tick();

      // assert;
      expect(timedNotificationService.pushNotification).toHaveBeenCalledTimes(2);
      expect(sut.displayedShareLayoutWarning).toBe(true);
      flush();
    }));
  });

  describe('editorChrome width', () => {
    it('Should apply width from device', fakeAsync(() => {
      detectChangesAndLoadIFrame();
      activeDevice$.next({
        id: 'mobile',
        name: 'Mobile',
        width: 370,
        isDefault: false,
      });
      fixture.detectChanges();

      const editorChrome = fixture.debugElement.query(By.css('.editor-chrome')).nativeElement as HTMLDivElement;
      expect(editorChrome.style.width).toBe('370px');
      flush();
    }));

    it('Should apply 100% width WHEN device width is 0', () => {
      activeDevice$.next({
        id: 'desktop',
        name: 'Desktop',
        width: 0,
        isDefault: false,
      });
      fixture.detectChanges();

      const editorChrome = fixture.debugElement.query(By.css('.editor-chrome')).nativeElement as HTMLDivElement;
      expect(editorChrome.style.width).toBe('100%');
    });
  });

  it('Should deselect chrome when clicking on empty space around canvas', () => {
    const deselectSpy = spyOn(sut, 'deselectChrome');

    const canvasWrapper = getWrapper();
    canvasWrapper.click();
    fixture.detectChanges();

    expect(deselectSpy).toHaveBeenCalled();
  });

  describe('select partial design welcome message', () => {
    it('should show if no selected partial designs, not loading iframe, navigation is editpagedesign', fakeAsync(() => {
      pageTemplatesServiceSpy.watchSelectedPartialDesignItems.and.returnValue(of([]));
      detectChangesAndLoadIFrame();
      sut.iframeIsLoading = false;
      activeNavigation$.next('editpagedesign');
      fixture.detectChanges();

      expect(welcomeMessage()).toBeTruthy();
      flush();
    }));

    it('should not show if selected partial designs', fakeAsync(() => {
      pageTemplatesServiceSpy.watchSelectedPartialDesignItems.and.returnValue(of(selectedPartialDesign));
      detectChangesAndLoadIFrame();
      sut.iframeIsLoading = false;
      activeNavigation$.next('editpagedesign');
      fixture.detectChanges();

      expect(welcomeMessage()).toBeFalsy();
      flush();
    }));

    it('should not show if loading', fakeAsync(() => {
      pageTemplatesServiceSpy.watchSelectedPartialDesignItems.and.returnValue(of(selectedPartialDesign));
      detectChangesAndLoadIFrame();
      sut.iframeIsLoading = true;
      activeNavigation$.next('editpagedesign');
      fixture.detectChanges();

      expect(welcomeMessage()).toBeFalsy();
      flush();
    }));

    it('should not show if navigation is not editpageadesign', fakeAsync(() => {
      pageTemplatesServiceSpy.watchSelectedPartialDesignItems.and.returnValue(of(selectedPartialDesign));
      detectChangesAndLoadIFrame();
      sut.iframeIsLoading = false;
      activeNavigation$.next('');
      fixture.detectChanges();

      expect(welcomeMessage()).toBeFalsy();
      flush();
    }));
  });

  describe('expanded LHS panel', () => {
    afterEach(() => {
      lhsPanelStateService.setExpand(false);
    });

    it('should disable device switcher when LHS panel is expanded', () => {
      lhsPanelStateService.setExpand(true);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('app-editor-workspace.hide')).nativeElement).toBeTruthy();
    });
  });

  describe('canvas loading stream', () => {
    it('should update loader state on every event', () => {
      const loader: () => HTMLDivElement = () => fixture.nativeElement.querySelector('div.loader-overlay');

      expect(sut.iframeIsLoading).toBeFalse();
      expect(loader()).toBeNull();

      testComponent.canvasLoading$.next(true);
      fixture.detectChanges();

      expect(sut.iframeIsLoading).toBeTrue();
      expect(loader()).toBeTruthy();

      testComponent.canvasLoading$.next(false);
      fixture.detectChanges();

      expect(sut.iframeIsLoading).toBeFalse();
      expect(loader()).toBeNull();
    });
  });
});
