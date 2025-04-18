/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from '@sitecore/ng-spd-lib';
import { EnvironmentFeatureFlagsService } from 'app/feature-flags/environment-feature-flag.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { AbTestComponentService } from 'app/pages/left-hand-side/personalization/personalization-services/ab-test-component.service';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { VariantPublishedStatusService } from 'app/pages/left-hand-side/personalization/personalization-services/variant-published-status.service';
import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import {
  FieldChromeInfo,
  PlaceholderChromeInfo,
  RenderingChromeInfo,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { RecreateOnChangeModule } from 'app/shared/utils/recreate-on-change/recreate-on-change.module';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject, of } from 'rxjs';
import { PropertiesPanelContext } from 'sdk/contracts/properties-panel-context.contract';
import { EditorWorkspaceService } from '../editor-workspace/editor-workspace.service';
import { CanvasServices, ChromeSelectEvent } from '../shared/canvas.services';
import {
  ChromeRhsEditorCaseDirective,
  ChromeRhsEditorSwitchDirective,
  ChromeRhsFieldEditorCaseDirective,
} from './chrome-rhs-editor.directive';
import { EditorRhsComponent } from './editor-rhs.component';
import { EditorRhsService } from './editor-rhs.service';
import { RhsContextSdkMessagingService } from './rhs-context.sdk-messaging.service';
import { RhsEditorMessagingReconnectable } from './rhs-editor-messaging';
import { RhsPositionService } from './rhs-position.service';

@Component({
  selector: 'app-versions',
  template: '',
})
class TestVersionsComponent {}

describe(EditorRhsComponent.name, () => {
  let sut: EditorRhsComponent;
  let fixture: ComponentFixture<EditorRhsComponent>;
  let rhsServiceSpy: jasmine.SpyObj<EditorRhsService>;
  let rhsContextSdkMessagingServiceSpy: jasmine.SpyObj<RhsContextSdkMessagingService>;
  let personalizationServiceSpy: jasmine.SpyObj<PersonalizationService>;
  let messagingSpy: jasmine.SpyObj<RhsEditorMessagingReconnectable>;
  let canvasServices_chromeSelect$: BehaviorSubject<ChromeSelectEvent>;
  let canvasServicesSpy: jasmine.SpyObj<CanvasServices>;
  let editorWorkspaceService: jasmine.SpyObj<EditorWorkspaceService>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;
  let abTestComponentServiceSpy: jasmine.SpyObj<AbTestComponentService>;
  let pageLiveStatusServiceSpy: jasmine.SpyObj<VariantPublishedStatusService>;
  let rhsPositionServiceSpy: jasmine.SpyObj<RhsPositionService>;

  const watchCanvasLoadingStub$ = new BehaviorSubject({ isLoading: false, itemId: 'itemId001', language: 'en' });

  const fieldChrome = (isPersonalized = false): FieldChromeInfo => {
    return {
      chromeId: 'fld_1',
      fieldId: 'foo',
      displayName: 'displayName',
      fieldType: 'rich text',
      chromeType: 'field',
      contextItem: { id: '', language: '', version: 1 },
      isPersonalized,
      parentRenderingChromeInfo: renderingChrome(),
    };
  };

  const renderingChrome = (isPersonalized = false, definitionId?: string): RenderingChromeInfo => {
    return {
      chromeId: 'rnd_1',
      chromeType: 'rendering',
      displayName: 'displayName',
      renderingDefinitionId: definitionId ?? 'aab',
      renderingInstanceId: 'test_instance_id',
      contextItem: { id: '', language: '', version: 1 },
      inlineEditorProtocols: [],
      isPersonalized,
      appliedPersonalizationActions: [],
      compatibleRenderings: [],
      parentPlaceholderChromeInfo: {} as any,
    };
  };

  const personalizationComponentFlowDefinition: BXComponentFlowDefinition = {
    siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
    ref: 'ref',
    archived: false,
    businessProcess: 'interactive_v1',
    name: 'morning visitor',
    friendlyId: 'embedded_test_instance_id',
    channels: ['WEB'],
    sampleSizeConfig: {
      baseValue: 0.15,
      minimumDetectableDifference: 0.02,
      confidenceLevel: 0.95,
    },
    traffic: {
      type: 'simpleTraffic',
      weightingAlgorithm: 'USER_DEFINED',
      modifiedAt: undefined,
      allocation: 100,
      splits: [],
      coupled: false,
    },
    goals: {
      primary: {
        type: 'pageViewGoal',
        name: '',
        friendlyId: '',
        ref: '',
        description: '',
        goalCalculation: {
          type: 'binary',
          calculation: 'INCREASE',
          target: 'conversionPerSession',
        },
        pageParameters: [
          {
            matchCondition: 'Equals',
            parameterString: '',
          },
        ],
      },
    },
    schedule: {
      type: 'simpleSchedule',
      startDate: '01/08/2021',
    },
    status: 'PRODUCTION',
    tags: [],
    triggers: [],
    type: 'INTERACTIVE_API_FLOW',
    variants: [{ ref: 'test', name: 'testVariant', isControl: false, tasks: [] }],
    subtype: 'EXPERIENCE',
    transpiledVariants: [],
  };

  const detectChanges = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const headerEl = () => fixture.debugElement.query(By.css('.header-section')).nativeElement;
  const abTestComponentPanel = () => fixture.debugElement.query(By.css('app-test-component'));

  beforeEach(waitForAsync(() => {
    canvasServices_chromeSelect$ = new BehaviorSubject<ChromeSelectEvent>({
      selection: undefined,
      eventSource: undefined,
    });
    canvasServicesSpy = jasmine.createSpyObj<CanvasServices>({}, { chromeSelect$: canvasServices_chromeSelect$ });

    messagingSpy = jasmine.createSpyObj<RhsEditorMessagingReconnectable>({
      isEstablished: undefined,
      getChannel: undefined,
      reconnect: undefined,
      changeRemotePeer: undefined,
      destroy: undefined,
      onReconnect: undefined,
      onDestroy: undefined,
    });

    TestBed.configureTestingModule({
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        AccordionModule,
        AppLetModule,
        ContextServiceTestingModule,
        RecreateOnChangeModule,
        StaticConfigurationServiceStubModule,
      ],
      declarations: [
        EditorRhsComponent,
        ChromeRhsEditorSwitchDirective,
        ChromeRhsEditorCaseDirective,
        ChromeRhsFieldEditorCaseDirective,
        TestVersionsComponent,
      ],
      providers: [
        { provide: CanvasServices, useValue: canvasServicesSpy },
        {
          provide: RhsPositionService,
          useValue: jasmine.createSpyObj<RhsPositionService>(['toggleDock'], {
            isDocked$: new BehaviorSubject<boolean>(true),
          }),
        },
        {
          provide: EditorRhsService,
          useValue: jasmine.createSpyObj<EditorRhsService>('EditorRhsService', {
            watchSelectionContext: of({
              itemId: 'test-item-id-001',
              displayName: 'testDisplayName001',
            }),
            watchCanWrite: of(true),
          }),
        },

        {
          provide: PersonalizationService,
          useValue: jasmine.createSpyObj<PersonalizationService>('PersonalizationService', [
            'getIsInPersonalizationMode',
          ]),
        },
        {
          provide: EditorWorkspaceService,
          useValue: jasmine.createSpyObj<EditorWorkspaceService>(['watchCanvasLoadState']),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(['init', 'isFeatureEnabled']),
        },
        {
          provide: EnvironmentFeatureFlagsService,
          useValue: jasmine.createSpyObj<EnvironmentFeatureFlagsService>(['isFeatureEnabled']),
        },
        {
          provide: AbTestComponentService,
          useValue: jasmine.createSpyObj<AbTestComponentService>({ getAbTestsConfiguredOnPage: Promise.resolve([]) }),
        },
        {
          provide: VariantPublishedStatusService,
          useValue: jasmine.createSpyObj<VariantPublishedStatusService>([
            'isPagePublished',
            'updateLivePageVariantsCheckStatus',
          ]),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EditorRhsComponent, {
        set: {
          providers: [
            {
              provide: RhsContextSdkMessagingService,
              useValue: jasmine.createSpyObj<RhsContextSdkMessagingService>({
                observeContextChanges: undefined,
              }),
            },
          ],
        },
      })
      .compileComponents();

    rhsServiceSpy = TestBedInjectSpy(EditorRhsService);
    personalizationServiceSpy = TestBedInjectSpy(PersonalizationService);
    personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(false);
    abTestComponentServiceSpy = TestBedInjectSpy(AbTestComponentService);
    pageLiveStatusServiceSpy = TestBedInjectSpy(VariantPublishedStatusService);

    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);
    featureFlagsServiceSpy.isFeatureEnabled.and.callFake((flag: string) => flag === 'pages_rhs-dock-undock');

    editorWorkspaceService = TestBedInjectSpy(EditorWorkspaceService);
    editorWorkspaceService.watchCanvasLoadState.and.returnValue(watchCanvasLoadingStub$);

    rhsPositionServiceSpy = TestBedInjectSpy(RhsPositionService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorRhsComponent);
    sut = fixture.componentInstance;
    rhsContextSdkMessagingServiceSpy = fixture.debugElement.injector.get(RhsContextSdkMessagingService) as any;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should provide RHS Context Service with current context', () => {
    rhsServiceSpy.watchSelectionContext.and.returnValue(of({ itemId: 'test-id-331' } as any));
    const collectedContexts: PropertiesPanelContext[] = [];
    rhsContextSdkMessagingServiceSpy.observeContextChanges.and.callFake((val) =>
      val.subscribe((v) => collectedContexts.push(v)),
    );

    fixture.detectChanges();

    expect(rhsContextSdkMessagingServiceSpy.observeContextChanges).toHaveBeenCalled();
    expect(collectedContexts).toEqual([{ itemId: 'test-id-331' }]);
  });

  describe('Field editors', () => {
    const [RICH_TEXT_FIELD_TAG, IMAGE_FIELD_TAG] = ['app-rich-text-editor', 'app-image-field'];

    function queryAllFields() {
      const fieldsCssSelector = `${IMAGE_FIELD_TAG}, ${RICH_TEXT_FIELD_TAG}`;
      return fixture.debugElement.queryAll(By.css(fieldsCssSelector));
    }

    it('should not render by default', () => {
      const fields = queryAllFields();
      fixture.detectChanges();

      expect(fields.length).toBe(0);
    });

    describe('AND chromeType is "field"', () => {
      it('should render field editor of the corresponding field type', async () => {
        const chrome = fieldChrome();

        canvasServices_chromeSelect$.next({
          selection: { chrome, messaging: messagingSpy },
          eventSource: undefined,
        });

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        let fields = queryAllFields();
        expect(fields.length).toBe(1);
        expect((fields[0].nativeElement as HTMLElement).tagName.toLowerCase()).toBe(RICH_TEXT_FIELD_TAG);

        canvasServices_chromeSelect$.next({
          selection: { chrome: { ...chrome, fieldType: 'image' }, messaging: messagingSpy },
          eventSource: undefined,
        });

        fixture.detectChanges();
        await fixture.whenStable();
        await fixture.whenStable();
        await fixture.whenStable();
        fixture.detectChanges();

        fields = queryAllFields();
        expect(fields.length).toBe(1);
        expect((fields[0].nativeElement as HTMLElement).tagName.toLowerCase()).toBe(IMAGE_FIELD_TAG);
      });

      it('should add `selected` class to the header element', async () => {
        const chrome = fieldChrome();

        canvasServices_chromeSelect$.next({
          selection: { chrome, messaging: messagingSpy },
          eventSource: undefined,
        });

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(headerEl().classList).toContain('selected');
      });

      it('should add `personalized` class to the header element if selected field is personalized', async () => {
        const chrome = fieldChrome(true);

        canvasServices_chromeSelect$.next({
          selection: { chrome, messaging: messagingSpy },
          eventSource: undefined,
        });

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(headerEl().classList).toContain('personalized');
      });

      it('should show no-options element WHEN field has no options', async () => {
        const chrome = { ...fieldChrome(), fieldType: 'single-line text' };
        canvasServices_chromeSelect$.next({
          selection: { chrome, messaging: messagingSpy },
          eventSource: undefined,
        });

        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const detailsComponents = fixture.debugElement.queryAll(By.css('.no-option'));
        expect(detailsComponents.length).toBe(1);
      });
    });

    describe('AND chromeType is not "field"', () => {
      it('should not render any field editors', () => {
        const chrome: PlaceholderChromeInfo = {
          chromeId: 'ph_1',
          chromeType: 'placeholder',
          placeholderKey: '/a/b',
          name: 'b',
          displayName: 'ab',
          contextItem: { id: '', language: '', version: 1 },
          allowedRenderingIds: [],
        };
        canvasServices_chromeSelect$.next({
          selection: { chrome, messaging: messagingSpy },
          eventSource: undefined,
        });
        fixture.detectChanges();

        let fields = queryAllFields();
        expect(fields.length).toBe(0);

        const chrome2 = renderingChrome();

        canvasServices_chromeSelect$.next({
          selection: { chrome: chrome2, messaging: messagingSpy },
          eventSource: undefined,
        });
        fixture.detectChanges();

        fields = queryAllFields();
        expect(fields.length).toBe(0);
      });
    });
  });

  describe('AND chrome type is placeholder', () => {
    it('should render placeholder details', async () => {
      const chrome: PlaceholderChromeInfo = {
        chromeId: 'ph_1',
        chromeType: 'placeholder',
        placeholderKey: '/a/b',
        name: 'b',
        displayName: 'ab',
        contextItem: { id: '', language: '', version: 1 },
        allowedRenderingIds: [],
      };
      canvasServices_chromeSelect$.next({
        selection: { chrome, messaging: messagingSpy },
        eventSource: undefined,
      });

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const detailsComponents = fixture.debugElement.queryAll(By.css('app-placeholder-details'));
      expect(detailsComponents.length).toBe(1);
    });
  });

  describe('AND chrome type is rendering', () => {
    it('should render rendering details', async () => {
      const chrome = renderingChrome();
      canvasServices_chromeSelect$.next({
        selection: { chrome, messaging: messagingSpy },
        eventSource: undefined,
      });

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const detailsComponents = fixture.debugElement.queryAll(By.css('app-rendering-details'));
      expect(detailsComponents.length).toBe(1);
    });

    it('should add `personalized` class to the header element if selected rendering is personalized', async () => {
      const chrome = renderingChrome(true);

      canvasServices_chromeSelect$.next({
        selection: { chrome, messaging: messagingSpy },
        eventSource: undefined,
      });

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(headerEl().classList).toContain('personalized');
    });
  });

  describe('WHEN in persoanlization mode', () => {
    const getGuideTemplateEl = () => fixture.debugElement.query(By.css('.guide-container'))?.nativeElement;

    it('should hide rhs content and show personalization guide template if chrome is not selected ', () => {
      personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(true);
      canvasServices_chromeSelect$.next({
        selection: undefined,
        eventSource: undefined,
      });
      fixture.detectChanges();

      expect(getGuideTemplateEl()).toBeTruthy();
    });

    it('should not show guide WHEN canvas is re-loading', () => {
      watchCanvasLoadingStub$.next({ isLoading: true, itemId: 'itemId001', language: 'en' });
      personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(true);
      canvasServices_chromeSelect$.next({
        selection: undefined,
        eventSource: undefined,
      });
      fixture.detectChanges();

      expect(getGuideTemplateEl()).toBeFalsy();

      watchCanvasLoadingStub$.next({ isLoading: false, itemId: 'itemId001', language: 'en' });
      fixture.detectChanges();

      expect(getGuideTemplateEl()).toBeTruthy();
    });
  });

  describe('showAbTestContext', () => {
    describe('WHEN item has write permission', () => {
      it('should show ABtest panel if selected component has ABtest', async () => {
        // Arrange
        pageLiveStatusServiceSpy.isPagePublished.and.returnValue(true);
        const chrome = renderingChrome();
        canvasServices_chromeSelect$.next({
          selection: { chrome, messaging: messagingSpy },
          eventSource: undefined,
        });

        // Act
        abTestComponentServiceSpy.getAbTestsConfiguredOnPage.and.returnValue(
          Promise.resolve([personalizationComponentFlowDefinition]),
        );
        rhsServiceSpy.watchCanWrite.and.returnValue(of(true));
        await detectChanges();

        // Assert
        expect(abTestComponentPanel()).toBeTruthy();
      });

      it('should show ABtest panel if selected chrome is undefined and eventSource is AB_TEST_COMPONENT_HANDLER', async () => {
        // Arrange
        rhsServiceSpy.watchCanWrite.and.returnValue(of(true));
        canvasServices_chromeSelect$.next({
          selection: undefined,
          eventSource: 'AB_TEST_COMPONENT_HANDLER',
        });

        // Act
        await detectChanges();

        expect(abTestComponentPanel()).toBeTruthy();
      });

      it('should show ABtest panel if selected component has ABtest and eventSource is AB_TEST_COMPONENT_HANDLER', async () => {
        // Arrange
        const chrome = renderingChrome();
        canvasServices_chromeSelect$.next({
          selection: { chrome, messaging: messagingSpy },
          eventSource: undefined,
        });
        abTestComponentServiceSpy.getAbTestsConfiguredOnPage.and.returnValue(
          Promise.resolve([personalizationComponentFlowDefinition]),
        );
        pageLiveStatusServiceSpy.isPagePublished.and.returnValue(true);
        fixture.detectChanges();

        const chromeWithEventSource = renderingChrome();
        canvasServices_chromeSelect$.next({
          selection: { chrome: chromeWithEventSource, messaging: messagingSpy },
          eventSource: 'AB_TEST_COMPONENT_HANDLER',
        });
        abTestComponentServiceSpy.getAbTestsConfiguredOnPage.and.returnValue(Promise.resolve([]));
        fixture.detectChanges();
        rhsServiceSpy.watchCanWrite.and.returnValue(of(true));

        // Act
        await detectChanges();

        // Assert
        expect(abTestComponentPanel()).toBeTruthy();
      });
    });

    describe('WHEN item does not have write permission', () => {
      it('should not show ABtest panel', async () => {
        // Arrange
        const chrome = renderingChrome();
        canvasServices_chromeSelect$.next({
          selection: { chrome, messaging: messagingSpy },
          eventSource: undefined,
        });
        abTestComponentServiceSpy.getAbTestsConfiguredOnPage.and.returnValue(
          Promise.resolve([personalizationComponentFlowDefinition]),
        );
        pageLiveStatusServiceSpy.isPagePublished.and.returnValue(true);
        rhsServiceSpy.watchCanWrite.and.returnValue(of(false));

        // Act
        await detectChanges();

        // Assert
        expect(abTestComponentPanel()).toBeNull();
      });
    });
  });

  describe('RHS Dock/Undock', () => {
    beforeEach(() => {
      featureFlagsServiceSpy.isFeatureEnabled.and.callFake((flag: string) => flag === 'pages_rhs-dock-undock');
    });

    it('should show dock-left button when panel is docked', () => {
      (rhsPositionServiceSpy.isDocked$ as BehaviorSubject<boolean>).next(true);
      fixture.detectChanges();

      const dockLeftBtn = fixture.nativeElement.querySelector('button[icon="dock-left"]');
      const dockRightBtn = fixture.nativeElement.querySelector('button[icon="dock-right"]');

      expect(dockLeftBtn).toBeTruthy();
      expect(dockRightBtn).toBeFalsy();
    });

    it('should show dock-right button when panel is undocked', () => {
      (rhsPositionServiceSpy.isDocked$ as BehaviorSubject<boolean>).next(false);
      fixture.detectChanges();

      const dockLeftBtn = fixture.nativeElement.querySelector('button[icon="dock-left"]');
      const dockRightBtn = fixture.nativeElement.querySelector('button[icon="dock-right"]');

      expect(dockLeftBtn).toBeFalsy();
      expect(dockRightBtn).toBeTruthy();
    });

    it('should trigger dockToggle when dock button is clicked', () => {
      (rhsPositionServiceSpy.isDocked$ as BehaviorSubject<boolean>).next(true);
      fixture.detectChanges();

      const dockBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button.toggle-btn');

      dockBtn.click();

      expect(rhsPositionServiceSpy.toggleDock).toHaveBeenCalled();
    });
  });
});
