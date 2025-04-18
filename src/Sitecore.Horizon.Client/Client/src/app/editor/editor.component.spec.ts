/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TestMessagingP2PChannel, makeTestMessagingP2PChannelFromDef } from '@sitecore/horizon-messaging/dist/testing';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { LHSNavigationService } from 'app/pages/left-hand-side/lhs-navigation.service';
import { CanvasUrlBuilder } from 'app/shared/canvas/url-builder';
import { RequiredContext } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { SiteDalService } from 'app/shared/graphql/sites/solutionSite.dal.service';
import { EditingChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
  RenderingFieldsdData,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { RenderingHostResolverService } from 'app/shared/rendering-host/rendering-host-resolver.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ReplaySubject, Subject, firstValueFrom, map, of } from 'rxjs';
import { EditingCanvasEvents } from 'sdk';
import { CanvasPageService } from './canvas-page/canvas-page.service';
import { EditingMetadataCanvasService } from './editing-metadata/editing-metadata-canvas.service';
import { ItemTypesUtilityService } from './editor-pages-utilities.service';
import { EditorWorkspaceService } from './editor-workspace/editor-workspace.service';
import { EditorComponent } from './editor.component';

const Initial_Context = {
  itemId: 'itemId1',
  language: 'lang1',
  siteName: 'website1',
};

@Component({
  selector: 'app-local-dev-settings',
  template: '',
})
export class LocalDevelopmentSettingsTestingComponent {}

describe(EditorComponent.name, () => {
  let sut: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  let canvasPageService: jasmine.SpyObj<CanvasPageService>;
  let contextService: ContextServiceTesting;
  let canvasUrlBuilder: jasmine.SpyObj<CanvasUrlBuilder>;
  let editorPagesUtilityService: jasmine.SpyObj<ItemTypesUtilityService>;
  let editingMetadataCanvasServiceSpy: jasmine.SpyObj<EditingMetadataCanvasService>;
  let lhsNavigationServiceSpy: jasmine.SpyObj<LHSNavigationService>;
  let activeNavigation$: Subject<string>;
  let editingTestChannel: TestMessagingP2PChannel<
    EditingCanvasEvents,
    EditingHorizonEvents,
    EditingCanvasRpcServices,
    EditingHorizonRpcServices
  >;

  const activatedRoute = { snapshot: { data: { renderSitePagesOnly: false } } };

  const lhsPanel = (): HTMLElement | null => {
    const element = fixture.debugElement.query(By.css('app-lhs-panel'));
    return element ? element.nativeElement : null;
  };

  const getWrapper = (): HTMLDivElement => {
    return fixture.debugElement.query(By.css('.app-editor-wrapper')).nativeElement;
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, ContextServiceTestingModule],
      declarations: [EditorComponent, LocalDevelopmentSettingsTestingComponent],
      providers: [
        {
          provide: CanvasUrlBuilder,
          useValue: jasmine.createSpyObj<CanvasUrlBuilder>({ buildEditModeUrl: 'URL' }),
        },
        {
          provide: ItemTypesUtilityService,
          useValue: jasmine.createSpyObj<ItemTypesUtilityService>({ ensureFirstEmitIsSitePage: of({}) }),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']),
        },
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>('MessagingService', ['getEditingCanvasChannel']),
        },
        {
          provide: LHSNavigationService,
          useValue: jasmine.createSpyObj<LHSNavigationService>('LHSNavigationService', ['watchRouteSegment']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EditorComponent, {
        set: {
          providers: [
            {
              provide: CanvasPageService,
              useValue: jasmine.createSpyObj<CanvasPageService>(
                {
                  updateCanvasFields: undefined,
                },
                {
                  canvasUrl$: new ReplaySubject(1),
                  onSaveError$: new Subject(),
                  afterParse$: new Subject(),
                },
              ),
            },
            {
              provide: ActivatedRoute,
              useValue: activatedRoute,
            },
            {
              provide: SiteDalService,
              useValue: jasmine.createSpyObj<SiteDalService>('site-service', ['getStartItem']),
            },
            {
              provide: EditingMetadataCanvasService,
              useValue: jasmine.createSpyObj<EditingMetadataCanvasService>('EditingMetadataCanvasService', [
                'injectEditingMetadata',
              ]),
            },
            {
              provide: EditorWorkspaceService,
              useValue: jasmine.createSpyObj<EditorWorkspaceService>('EditorWorkspaceService', {
                watchCanvasLoadState: of({ isLoading: true }),
              }),
            },
            {
              provide: RenderingHostResolverService,
              useValue: jasmine.createSpyObj<RenderingHostResolverService>('CanvasRenderingService', {
                notifyErrorState: undefined,
                isLocalRenderingHostSelected: false,
              }),
            },
          ],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
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
    const messaging = TestBedInjectSpy(MessagingService);
    messaging.getEditingCanvasChannel.and.returnValue(editingTestChannel);

    fixture = TestBed.createComponent(EditorComponent);
    sut = fixture.componentInstance;

    // Run tests for the production version of editor-workspace.component
    sut.isLocalDevelopmentMode = false;

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(Initial_Context);

    canvasPageService = fixture.debugElement.injector.get(CanvasPageService) as any;

    canvasUrlBuilder = TestBedInjectSpy(CanvasUrlBuilder);
    editorPagesUtilityService = TestBedInjectSpy(ItemTypesUtilityService);

    editingMetadataCanvasServiceSpy = fixture.debugElement.injector.get(
      EditingMetadataCanvasService,
    ) as jasmine.SpyObj<EditingMetadataCanvasService>;
    editingMetadataCanvasServiceSpy.injectEditingMetadata.and.callFake((canvasUrl$) => canvasUrl$ as any);

    activeNavigation$ = new ReplaySubject(1);
    lhsNavigationServiceSpy = TestBedInjectSpy(LHSNavigationService);
    lhsNavigationServiceSpy.watchRouteSegment.and.returnValue(activeNavigation$);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('renderUserPagesOnly', () => {
    it('should handle page validation', () => {
      activatedRoute.snapshot.data.renderSitePagesOnly = true;
      sut.ngOnInit();

      expect(editorPagesUtilityService.ensureFirstEmitIsSitePage).toHaveBeenCalled();
    });

    it('should not handle page validation', () => {
      activatedRoute.snapshot.data.renderSitePagesOnly = false;
      sut.ngOnInit();

      expect(editorPagesUtilityService.ensureFirstEmitIsSitePage).not.toHaveBeenCalled();
    });
  });

  describe('local development settings', () => {
    it('should show local-dev-settings in Dev mode', () => {
      sut.isLocalDevelopmentMode = true;
      fixture.detectChanges();

      const localDevSettingsComponent: LocalDevelopmentSettingsTestingComponent = fixture.debugElement.query(
        By.directive(LocalDevelopmentSettingsTestingComponent),
      )?.componentInstance;

      expect(localDevSettingsComponent).toBeTruthy();
    });

    it('should NOT show local-dev-settings in Prod mode', () => {
      sut.isLocalDevelopmentMode = false;
      fixture.detectChanges();

      const localDevSettingsComponent: LocalDevelopmentSettingsTestingComponent = fixture.debugElement.query(
        By.directive(LocalDevelopmentSettingsTestingComponent),
      )?.componentInstance;

      expect(localDevSettingsComponent).toBeFalsy();
    });
  });

  describe('editing metadata', () => {
    it('should pass route value to url builder', async () => {
      editingMetadataCanvasServiceSpy.injectEditingMetadata.and.callFake((canvasUrl$) => {
        return canvasUrl$.pipe(
          map((value) => ({
            ...value,
            metadataMode: true,
            isDirectRenderEnabled: true,
            isLocalRenderingHost: false,
            route: '/testroute',
            layoutKind: 'FINAL',
          })),
        );
      });

      (canvasPageService.canvasUrl$ as ReplaySubject<{ canvasUrl: { context: RequiredContext } }>).next({
        canvasUrl: {
          context: {
            itemId: 'itemdId',
            language: 'en',
            siteName: 'site1',
          },
        },
      });

      activatedRoute.snapshot.data.renderSitePagesOnly = false;
      fixture.detectChanges();
      sut.ngOnInit();

      await firstValueFrom(sut.editorUrl$);
      await fixture.whenStable();

      expect(canvasUrlBuilder.buildEditModeUrl).toHaveBeenCalledWith(
        {
          itemId: 'itemdId',
          language: 'en',
          siteName: 'site1',
        },
        '/testroute',
        'FINAL',
      );
    });
  });

  describe('Deselect chrome', () => {
    it('Should deselect chrome when clicking on empty space around canvas', () => {
      const deselectSpy = spyOn(sut, 'deselectChrome');

      const canvasWrapper = getWrapper();
      canvasWrapper.click();
      fixture.detectChanges();

      expect(deselectSpy).toHaveBeenCalled();
    });
  });

  describe('LHS navigation', () => {
    it('should render lhs panel when activeNavigation is editor', fakeAsync(() => {
      activeNavigation$.next('editor');
      tick();
      fixture.detectChanges();

      expect(lhsPanel()).not.toBeNull();
    }));

    it('should not render lhs panel when activeNavigation is not editor', fakeAsync(() => {
      activeNavigation$.next('some-other-route');
      tick();
      fixture.detectChanges();

      expect(lhsPanel()).toBeNull();
    }));
  });
});
