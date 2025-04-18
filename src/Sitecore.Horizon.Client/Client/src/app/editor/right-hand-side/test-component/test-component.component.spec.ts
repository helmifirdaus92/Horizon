/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { RpcServicesImplementation } from '@sitecore/horizon-messaging';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { IconButtonModule, InputLabelModule, ListModule, PopoverModule, TabsModule } from '@sitecore/ng-spd-lib';
import { ComponentGalleryService } from 'app/editor/designing/component-gallery/component-gallery.service';
import { FEaaSComponentsService } from 'app/editor/designing/feaas-components-gallery/feaas-components.service';
import { CanvasLayoutServices, CanvasServices } from 'app/editor/shared/canvas.services';
import { PageLayout } from 'app/editor/shared/layout/page-layout';
import { BaseContentTreeDalService } from 'app/pages/content-tree/content-tree.service';
import { PersonalizationAPIService } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.service';
import { AbTestComponentService } from 'app/pages/left-hand-side/personalization/personalization-services/ab-test-component.service';

import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import {
  PersonalizationLayoutService,
  PersonlizedRenderingInfo,
} from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import { PersonalizationRulesService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.rules.service';
import { VariantPublishedStatusService } from 'app/pages/left-hand-side/personalization/personalization-services/variant-published-status.service';
import {
  BXComponentFlowDefinition,
  BXComponentVariant,
  FlowStatus,
} from 'app/pages/left-hand-side/personalization/personalization.types';
import { AbTestAnalyticsService } from 'app/pages/page-ab-tests/services/ab-test-analytics.service';
import { Context } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { DatasourceDialogService } from 'app/shared/dialogs/datasource-dialog/datasource-dialog.service';
import { DatasourcePickerService } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import { DatasourceDalService } from 'app/shared/dialogs/datasource-picker/datasource.dal.service';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { DirectivesModule } from 'app/shared/directives/directives/directives.module';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { EditingChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { RenderingHostFeaturesService } from 'app/shared/rendering-host/rendering-host-features.service';
import { RenderingHostService } from 'app/shared/rendering-host/rendering-host.service';
import { GlobalMessagingTesting } from 'app/testing/global-messaging-testing';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { RenderingInitializationContext } from 'sdk';
import { EditorRhsModule } from '../editor-rhs.module';
import { FEAAS_RENDERING_ID } from '../feaas-rhs-region/feaas-extension-filter';
import { getAbTestInfo, mockComponentFlowDefinition, mockVariants } from './ab-test-component.utils';
import { ConfigureExperimentDialogService } from './configure-experiment-dialog/configure-experiment-dialog.service';
import { EndExperimentDialogService } from './end-experiment-dialog/end-experiment-dialog.service';
import { TestComponentComponent } from './test-component.component';
import { VariantActionsContextMenuComponent } from './variant-actions-context-menu/variant-actions-context-menu.component';

class MockPersonalizationLayoutService {
  addHideRenderingPersonalizationRule = jasmine.createSpy('addHideRenderingPersonalizationRule');
  addRenderingDetailsPersonalizationRule = jasmine.createSpy('addRenderingDetailsPersonalizationRule');
  addSetDataSourcePersonalizationRule = jasmine.createSpy('addSetDataSourcePersonalizationRule');
  removePersonalizationRuleFromRendering = jasmine.createSpy('removePersonalizationRuleFromRendering');
  applyVariantAsDefaultSetup = jasmine.createSpy('applyVariantAsDefaultSetup');
  invokeInsertRenderingAction = jasmine.createSpy('invokeInsertRenderingAction');
}
class TestWarningDialogComponent {
  title?: string;
  text?: string;
  declineText?: string;
  confirmText?: string;
  constructor(title?: string, text?: string, declineText?: string, confirmText?: string) {
    this.title = title;
    this.text = text;
    this.declineText = declineText;
    this.confirmText = confirmText;
  }

  dialogResultEvent = new BehaviorSubject<{ confirmed: boolean }>({ confirmed: true });
}

describe(TestComponentComponent.name, () => {
  let sut: TestComponentComponent;
  let fixture: ComponentFixture<TestComponentComponent>;
  let dataSourceDialogServiceSpy: jasmine.SpyObj<DatasourceDialogService>;
  let dataSourcePickerServiceSpy: jasmine.SpyObj<DatasourcePickerService>;
  let mockPersonalizationLayoutService: MockPersonalizationLayoutService;
  let messagingServiceSpy: jasmine.SpyObj<MessagingService>;
  let canvasServiceSpy: jasmine.SpyObj<CanvasServices>;
  let configExpDialogServiceSpy: jasmine.SpyObj<ConfigureExperimentDialogService>;
  let timedNotificationServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let variantPublishedStatusServiceSpy: jasmine.SpyObj<VariantPublishedStatusService>;
  let endExperimentDialogServiceSpy: jasmine.SpyObj<EndExperimentDialogService>;
  let abTestComponentServiceSpy: jasmine.SpyObj<AbTestComponentService>;
  let feaasComponentServiceSpy: jasmine.SpyObj<FEaaSComponentsService>;
  let context: ContextServiceTesting;
  let personalizationRulesServiceSpy: jasmine.SpyObj<PersonalizationRulesService>;
  let canvasLayoutServices: jasmine.SpyObj<CanvasLayoutServices>;
  let componentGalleryServiceSpy: jasmine.SpyObj<ComponentGalleryService>;
  let renderingHostFeaturesService: jasmine.SpyObj<RenderingHostFeaturesService>;
  let testWarningDialogComponent: TestWarningDialogComponent;

  let editingTestChannel: TestMessagingP2PChannel<
    EditingCanvasEvents,
    EditingHorizonEvents,
    EditingCanvasRpcServices,
    EditingHorizonRpcServices
  >;
  let setRpcServicesImplSpy: jasmine.Spy;

  const actionButtons = () => fixture.debugElement.queryAll(By.css('.personalize-options button'));
  const endTestButton = () =>
    fixture.debugElement.query(By.css('.sub-header button[ngSpdButton=outline]')).nativeElement;
  const canvasEditingChannelRpcSpy = jasmine.createSpyObj<RpcServicesImplementation<EditingCanvasRpcServices>>(
    'EditingChannelRpc',
    ['updatePageState', 'selectChrome', 'getChildRenderings', 'getChildPlaceholders'],
  );

  const detectChanges = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const testContext: Context = {
    itemId: '{foo1BAR2-BaZ3-0000-AAAA-bbbbCCCC1234}',
    language: 'pt-BR',
    siteName: 'sitecore1',
    itemVersion: 1,
    variant: '8c1c581585b34545b26203408ea7b1ab_cph',
  };

  beforeEach(waitForAsync(() => {
    personalizationRulesServiceSpy = jasmine.createSpyObj<PersonalizationRulesService>('PersonalizationRulesService', [
      'buildHideRenderingAction',
      'buildVariantRule',
      'buildDefaultRule',
      'getConditionVariantCompareFn',
    ]);

    TestBed.configureTestingModule({
      declarations: [TestComponentComponent],
      imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        TranslateServiceStubModule,
        DirectivesModule,
        InputLabelModule,
        ContextServiceTestingModule,
        StaticConfigurationServiceStubModule,
        VariantActionsContextMenuComponent,
        EditorRhsModule,
        NoopAnimationsModule,
        TabsModule,
        SlideInPanelModule,
        ListModule,
        PopoverModule,
        IconButtonModule,
      ],
      providers: [
        {
          provide: DatasourceDialogService,
          useValue: jasmine.createSpyObj<DatasourceDialogService>('DatasourceDialogService', ['show']),
        },
        {
          provide: DatasourcePickerService,
          useValue: jasmine.createSpyObj<DatasourcePickerService>('DatasourcePickerService', ['duplicateDataSource']),
        },

        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>('MessagingService', [
            'getEditingCanvasChannel',
            'getDesigningChannel',
          ]),
        },
        {
          provide: PersonalizationAPIService,
          useValue: jasmine.createSpyObj<PersonalizationAPIService>('PersonalizationAPIService', [
            'updateComponentFlowDefinition',
            'getCurrentSiteFlowDefinitions',
          ]),
        },
        { provide: NgGlobalMessaging, useValue: new GlobalMessagingTesting() },
        {
          provide: DatasourceDalService,
          useValue: jasmine.createSpyObj<DatasourceDalService>({
            resolveDatasource: EMPTY,
          }),
        },
        {
          provide: BaseContentTreeDalService,
          useValue: jasmine.createSpyObj<BaseContentTreeDalService>('content-tree-dal-service', {
            moveItem: EMPTY,
          }),
        },
        {
          provide: PersonalizationRulesService,
          useValue: personalizationRulesServiceSpy,
        },
        {
          provide: VariantPublishedStatusService,
          useValue: jasmine.createSpyObj<VariantPublishedStatusService>('PageVariantStatusService', [
            'isPagePublished',
            'updateLivePageVariantsCheckStatus',
          ]),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', [
            'push',
            'pushNotification',
          ]),
        },
        {
          provide: AbTestComponentService,
          useValue: jasmine.createSpyObj<AbTestComponentService>('AbTestComponentService', [
            'updateComponentFlowDefinition',
            'refetchFlows',
          ]),
        },
        {
          provide: ComponentGalleryService,
          useValue: jasmine.createSpyObj<ComponentGalleryService>('ComponentGalleryService', [
            'watchComponents',
            'getPlaceholderAllowedComponents',
          ]),
        },
        {
          provide: FEaaSComponentsService,
          useValue: jasmine.createSpyObj<FEaaSComponentsService>('FEaaSComponentsService', [
            'populateRenderingDetails',
          ]),
        },

        {
          provide: RenderingHostFeaturesService,
          useValue: jasmine.createSpyObj<RenderingHostFeaturesService>(['watchComponents']),
        },
        {
          provide: RenderingHostService,
          useValue: jasmine.createSpyObj<RenderingHostService>([
            'isAngularRenderingHost',
            'isDirectIntegrationEnabled',
            'isReactRenderingHost',
            'isShallowChromeMetadataEnabled',
          ]),
        },
        {
          provide: ConfigureExperimentDialogService,
          useValue: jasmine.createSpyObj<ConfigureExperimentDialogService>(['show']),
        },
        {
          provide: EndExperimentDialogService,
          useValue: jasmine.createSpyObj<EndExperimentDialogService>(['show']),
        },
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>({ getItem: of({ id: 'id001' } as any) }),
        },
        {
          provide: AbTestAnalyticsService,
          useValue: jasmine.createSpyObj<AbTestAnalyticsService>(['openAnalytics']),
        },
        {
          provide: CanvasServices,
          useValue: jasmine.createSpyObj<CanvasServices>({
            getCurrentLayout: jasmine.createSpyObj<CanvasLayoutServices>([
              'getRendering',
              'findRendering',
              'updateRenderings',
              'removeRendering',
              'setRenderingsPersonalizationRules',
              'getRenderingPersonalizationRules',
            ]),
          }),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(TestComponentComponent, {
        set: {
          providers: [
            {
              provide: PersonalizationLayoutService,
              useClass: MockPersonalizationLayoutService,
            },
          ],
        },
      })
      .compileComponents();
  }));

  beforeEach(async () => {
    dataSourceDialogServiceSpy = TestBedInjectSpy(DatasourceDialogService);
    dataSourcePickerServiceSpy = TestBedInjectSpy(DatasourcePickerService);

    personalizationRulesServiceSpy = TestBedInjectSpy(PersonalizationRulesService);
    messagingServiceSpy = TestBedInjectSpy(MessagingService);
    configExpDialogServiceSpy = TestBedInjectSpy(ConfigureExperimentDialogService);
    timedNotificationServiceSpy = TestBedInjectSpy(TimedNotificationsService);
    variantPublishedStatusServiceSpy = TestBedInjectSpy(VariantPublishedStatusService);
    endExperimentDialogServiceSpy = TestBedInjectSpy(EndExperimentDialogService);
    abTestComponentServiceSpy = TestBedInjectSpy(AbTestComponentService);
    feaasComponentServiceSpy = TestBedInjectSpy(FEaaSComponentsService);
    componentGalleryServiceSpy = TestBedInjectSpy(ComponentGalleryService);

    renderingHostFeaturesService = TestBedInjectSpy(RenderingHostFeaturesService);
    canvasServiceSpy = TestBedInjectSpy(CanvasServices);
    canvasLayoutServices = canvasServiceSpy.getCurrentLayout() as any;

    context = TestBed.inject(ContextServiceTesting);
    context.provideTestValue(testContext);

    editingTestChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, canvasEditingChannelRpcSpy);
    renderingHostFeaturesService.watchComponents.and.returnValue(of({ components: [], bypass: true }));
    messagingServiceSpy.getEditingCanvasChannel.and.returnValue(editingTestChannel);
    variantPublishedStatusServiceSpy.isPagePublished.and.returnValue(false);
    dataSourcePickerServiceSpy.duplicateDataSource.and.returnValue(
      Promise.resolve({ itemId: 'newId', layoutRecord: 'newId' }),
    );
    dataSourceDialogServiceSpy.show.and.returnValue(of({ itemId: 'testId', layoutRecord: 'testId' }));
    setRpcServicesImplSpy = jasmine.createSpy();
    messagingServiceSpy.getDesigningChannel.and.callFake((() => {
      return { setRpcServicesImpl: setRpcServicesImplSpy };
    }) as any);

    componentGalleryServiceSpy.getPlaceholderAllowedComponents.and.returnValue(of({ ungrouped: [], groups: [] }));
    componentGalleryServiceSpy.watchComponents.and.returnValue(of({ ungrouped: [], groups: [] }));

    fixture = TestBed.createComponent(TestComponentComponent);
    sut = fixture.componentInstance;
    sut.abTestValue = getAbTestInfo();

    mockPersonalizationLayoutService = fixture.debugElement.injector.get(PersonalizationLayoutService) as any;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should emit abTest configured rendering instance id on chrome select', async () => {
      fixture.detectChanges();
      editingTestChannel.dispatchEvent('page:load', {
        fields: [],
        layout: PageLayout.stringifyLayoutDefinition({ devices: [] }),
        layoutDeviceId: 'test-device-id',
        droppableRenderingIds: [],
        styles: {},
      });
      await detectChanges();

      expect(editingTestChannel.getEmittedEvents('chrome:select')[0]).toEqual({
        id: getAbTestInfo().rendering.renderingInstanceId,
        chromeType: 'rendering',
        shouldScrollIntoView: true,
      });
    });
  });

  describe('init', () => {
    it('should render variants list', async () => {
      const variant: BXComponentVariant = {
        ref: 'control',
        name: 'controlVariant',
        isControl: false,
        tasks: [
          {
            implementation: 'templateRenderTask',
            input: {
              inputType: 'templateRenderTaskInput',
              type: 'application/json',
              template: '{"variantId":"' + 'new_testVariant' + '"}',
            },
          },
        ],
      };
      const testVariants = [...mockVariants, variant];
      sut.abTestValue = getAbTestInfo(testVariants);
      await detectChanges();

      const variantsList = fixture.debugElement.queryAll(By.css('ng-spd-tab-group button .p-0'));

      expect(variantsList.length).toBe(2);
    });

    it('should select contex variant', async () => {
      context.setTestVariant('8c1c581585b34545b26203408ea7b1ab_cph');
      fixture.detectChanges();
      const variant: BXComponentVariant = {
        ref: 'control',
        name: 'controlVariant',
        isControl: false,
        tasks: [
          {
            implementation: 'templateRenderTask',
            input: {
              inputType: 'templateRenderTaskInput',
              type: 'application/json',
              template: '{"variantId":"' + '8c1c581585b34545b26203408ea7b1ab_cph' + '"}',
            },
          },
        ],
      };
      const testVariants = [...mockVariants, variant];
      sut.abTestValue = getAbTestInfo(testVariants);
      await detectChanges();

      const tabComponent = fixture.debugElement.queryAll(By.css('[ngSpdTab]'))[1].nativeElement;

      expect(tabComponent.classList).toContain('active');
    });

    describe('page published with a/b test variants', () => {
      it('should show live status if page is published with variants', async () => {
        variantPublishedStatusServiceSpy.isPagePublished.and.returnValue(true);

        sut.init();
        await detectChanges();

        const liveStatusTag = fixture.debugElement.query(By.css('.sub-header span')).nativeElement;

        expect(liveStatusTag.innerText).toContain('COMPONENT_TESTING.LIVE');
      });

      it('should show end test button if page is published with variants', async () => {
        variantPublishedStatusServiceSpy.isPagePublished.and.returnValue(true);
        sut.init();
        await detectChanges();

        expect(endTestButton()).toBeTruthy();
      });

      it('should show pending status if page is not published with variants', async () => {
        variantPublishedStatusServiceSpy.isPagePublished.and.returnValue(false);
        sut.init();
        await detectChanges();

        const liveStatusTag = fixture.debugElement.query(By.css('.sub-header span')).nativeElement;

        expect(liveStatusTag.innerText).toContain('COMPONENT_TESTING.PENDING');
      });
    });

    describe('showLiveTestEditWarning', () => {
      it('should show edit warning if page has live variant', async () => {
        variantPublishedStatusServiceSpy.isPagePublished.and.returnValue(true);
        const flowDefinition = { ...mockComponentFlowDefinition, status: 'PRODUCTION' as any };
        const abTest = { ...getAbTestInfo(), flowDefinition };

        sut.abTestValue = abTest;
        await fixture.whenStable();

        const [{ id, text, severity }] = timedNotificationServiceSpy.pushNotification.calls.mostRecent().args;

        expect(timedNotificationServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
        expect(text).toBe('COMPONENT_TESTING.TEST_LIVE_ON_PAGE_WARNING');
        expect(severity).toBe('warning');
        expect(id).toBe('test-live-warning');
      });
    });
  });

  describe('selectTestVariant', () => {
    it('should update context with selected variant id', async () => {
      const updateContextSpy = spyOn(context, 'updateContext').and.callThrough();
      const variant: BXComponentVariant = {
        ref: 'control',
        name: 'controlVariant',
        isControl: false,
        tasks: [
          {
            implementation: 'templateRenderTask',
            input: {
              inputType: 'templateRenderTaskInput',
              type: 'application/json',
              template: '{"variantId":"' + 'new_testVariant' + '"}',
            },
          },
        ],
      };
      const testVariants = [...mockVariants, variant];
      sut.abTestValue = getAbTestInfo(testVariants);
      await detectChanges();

      const variantButton = fixture.debugElement.queryAll(By.css('ng-spd-tab-group button'))[1].nativeElement;
      variantButton.click();
      fixture.detectChanges();

      expect(updateContextSpy).toHaveBeenCalledWith(
        {
          variant: 'new_testVariant',
          itemVersion: 1,
        },
        {
          eventSource: 'AB_TEST_COMPONENT_HANDLER',
        },
      );
    });
  });

  describe('addVariant', () => {
    const addVariantButton = () => fixture.debugElement.query(By.css('.add-new')).nativeElement;

    beforeEach(async () => {
      const flowDefinition = { ...mockComponentFlowDefinition, status: 'DRAFT' as any };
      const abTest = { ...getAbTestInfo(), flowDefinition };

      sut.abTestValue = abTest;
      await detectChanges();
    });
    it('should show button to add new variant if flowDefinition is DRAFT', async () => {
      expect(addVariantButton()).toBeTruthy();
    });

    it('should add a new variant correctly', async () => {
      const variantsList = fixture.debugElement.queryAll(By.css('ng-spd-tab-group button .p-0'));

      abTestComponentServiceSpy.updateComponentFlowDefinition.and.returnValue(Promise.resolve());
      addVariantButton().click();
      await detectChanges();

      expect(abTestComponentServiceSpy.updateComponentFlowDefinition).toHaveBeenCalled();
      expect(variantsList.length).toBe(2);
    });
  });

  describe('Tests actions', () => {
    const variant: BXComponentVariant = {
      ref: 'test',
      name: 'newTestVariant',
      isControl: false,
      tasks: [
        {
          implementation: 'templateRenderTask',
          input: {
            inputType: 'templateRenderTaskInput',
            type: 'application/json',
            template: '{"variantId":"' + 'some_random_id' + '"}',
          },
        },
      ],
    };
    describe('hideComponent', () => {
      it('should call personalization layout service to add hide rendering rule', async () => {
        const testVariants = [...mockVariants, variant];
        sut.abTestValue = getAbTestInfo(testVariants);
        await detectChanges();

        sut.selectedTestIndex = 1;
        sut.isLoading = false;
        fixture.detectChanges();

        const hideComponentButton = actionButtons()[2].nativeElement;
        hideComponentButton.click();

        expect(mockPersonalizationLayoutService.addHideRenderingPersonalizationRule).toHaveBeenCalled();
        expect(mockPersonalizationLayoutService.addHideRenderingPersonalizationRule).toHaveBeenCalledWith(
          'test_instance_id',
          'some_random_id',
        );
      });
    });

    describe('swapComponent', () => {
      it('should show component selection panel', async () => {
        const testVariants = [...mockVariants, variant];
        sut.abTestValue = getAbTestInfo(testVariants);
        await detectChanges();

        sut.selectedTestIndex = 1;
        sut.isLoading = false;
        fixture.detectChanges();

        const swapComponentButton = actionButtons()[1].nativeElement;
        swapComponentButton.click();
        await detectChanges();

        const componentSelectionPanel = fixture.debugElement.query(By.css('ng-spd-slide-in-panel'));

        expect(componentSelectionPanel).toBeDefined();
      });

      it('should update allowedRenderingIds of abTest rendering from parent placeholder chrome', async () => {
        const rendering = {
          chromeId: 'rnd_1',
          chromeType: 'rendering' as any,
          displayName: 'displayName',
          renderingDefinitionId: 'aab',
          renderingInstanceId: 'test_instance_id',
          contextItem: { id: '', language: '', version: 1 },
          inlineEditorProtocols: [],
          isPersonalized: false,
          appliedPersonalizationActions: [],
          compatibleRenderings: ['rendering1', 'rendering2'],
          parentPlaceholderChromeInfo: { allowedRenderingIds: ['8DF3F3A70023494C89453D51B78C79CC'] } as any,
        };

        const testVariants = [...mockVariants, variant];
        const abTest = { ...getAbTestInfo(testVariants), rendering };
        sut.abTestValue = abTest;
        await detectChanges();

        sut.selectedTestIndex = 1;
        sut.isLoading = false;
        fixture.detectChanges();

        const swapComponentButton = actionButtons()[1].nativeElement;
        swapComponentButton.click();
        fixture.detectChanges();

        expect(sut.allowedRenderingIds).toContain('8DF3F3A70023494C89453D51B78C79CC');
      });

      [true, false].forEach((isDataSourceResolved) => {
        it('should open dataSource dialog only if invokeInsertRenderingAction has not resolved dataSource', async () => {
          const testVariants = [...mockVariants, variant];
          sut.abTestValue = getAbTestInfo(testVariants);
          mockPersonalizationLayoutService.invokeInsertRenderingAction.and.returnValue(
            Promise.resolve({
              renderingDetails: {
                dataSource: isDataSourceResolved ? 'dsResolvedBySxa' : null,
                parameters: { parameter1: 'value1' },
              },
              cancelRenderingInsert: false,
            }),
          );
          await detectChanges();

          sut.selectedTestIndex = 1;
          sut.isLoading = false;
          fixture.detectChanges();

          const swapComponentButton = actionButtons()[1].nativeElement;
          swapComponentButton.click();
          await detectChanges();

          const componentGallery = fixture.debugElement.query(By.css('app-component-gallery')).componentInstance as any;
          componentGallery.selectRendering.emit('newRenderingId');
          await detectChanges();

          if (isDataSourceResolved) {
            expect(dataSourceDialogServiceSpy.show).not.toHaveBeenCalled();
          } else {
            expect(dataSourceDialogServiceSpy.show).toHaveBeenCalled();
          }
        });
      });

      it('should invoke addRenderingDetailsPersonalizationRule for selected variant when selected component is SXA component', async () => {
        dataSourceDialogServiceSpy.show.and.returnValue(of({ itemId: 'testDsId', layoutRecord: 'testDsId' }));
        mockPersonalizationLayoutService.invokeInsertRenderingAction.and.returnValue(
          Promise.resolve({
            renderingDetails: {
              instanceId: 'testId123',
              renderingId: 'test_rendering_id',
              placeholderKey: '1',
              dataSource: 'testDsId',
              parameters: { parameter1: 'value1' },
            },
            cancelRenderingInsert: false,
          }),
        );

        const testVariants = [...mockVariants, variant];
        sut.abTestValue = getAbTestInfo(testVariants);
        await detectChanges();

        sut.selectedTestIndex = 1;
        sut.isLoading = false;
        fixture.detectChanges();

        const swapComponentButton = actionButtons()[1].nativeElement;
        swapComponentButton.click();
        await detectChanges();

        const componentGallery = fixture.debugElement.query(By.css('app-component-gallery')).componentInstance as any;
        componentGallery.selectRendering.emit('newRenderingId');
        await detectChanges();

        expect(mockPersonalizationLayoutService.addRenderingDetailsPersonalizationRule).toHaveBeenCalledWith(
          'test_instance_id',
          'some_random_id',
          { renderingId: 'newRenderingId', dataSource: 'testDsId', renderingParameters: { parameter1: 'value1' } },
          true,
        );
      });

      it('should invoke addRenderingDetailsPersonalizationRule for selected variant when selected component is FEaas/BYOC component', async () => {
        const renderingContext: RenderingInitializationContext = {
          renderingDetails: {
            instanceId: 'testId123',
            renderingId: 'test_rendering_id',
            placeholderKey: '1',
            dataSource: null,
            parameters: { parameter1: 'value1' },
          },
          cancelRenderingInsert: false,
        };
        feaasComponentServiceSpy.populateRenderingDetails.and.returnValue(Promise.resolve(renderingContext));

        const testVariants = [...mockVariants, variant];
        sut.abTestValue = getAbTestInfo(testVariants);
        await detectChanges();

        sut.selectedTestIndex = 1;
        sut.isLoading = false;
        fixture.detectChanges();

        const swapComponentButton = actionButtons()[1].nativeElement;
        swapComponentButton.click();
        fixture.detectChanges();

        const componentGallery = fixture.debugElement.query(By.css('app-component-gallery')).componentInstance as any;
        componentGallery.selectRendering.emit(FEAAS_RENDERING_ID);
        await detectChanges();

        expect(mockPersonalizationLayoutService.addRenderingDetailsPersonalizationRule).toHaveBeenCalledWith(
          'test_instance_id',
          'some_random_id',
          { renderingId: 'test_rendering_id', dataSource: null, renderingParameters: { parameter1: 'value1' } },
          true,
        );
      });
    });

    describe('copyComponent', () => {
      describe('When selected componet is SXA component', () => {
        it('should open assign data source dialog if current rendering does not have datasource', async () => {
          canvasLayoutServices.findRendering.and.returnValue({ dataSource: null } as any);

          const testVariants = [...mockVariants, variant];
          sut.abTestValue = getAbTestInfo(testVariants);
          await detectChanges();

          sut.selectedTestIndex = 1;
          sut.isLoading = false;
          fixture.detectChanges();

          const copyComponentButton = actionButtons()[0].nativeElement;
          copyComponentButton.click();
          await detectChanges();

          expect(dataSourceDialogServiceSpy.show).toHaveBeenCalled();
        });

        it('should call duplicateDataSource if current rendering has datasource', async () => {
          canvasLayoutServices.findRendering.and.returnValue({ dataSource: 'testDataSourceId' } as any);

          const testVariants = [...mockVariants, variant];
          sut.abTestValue = getAbTestInfo(testVariants);
          await detectChanges();

          sut.selectedTestIndex = 1;
          sut.isLoading = false;
          fixture.detectChanges();

          const copyComponentButton = actionButtons()[0].nativeElement;
          copyComponentButton.click();
          await detectChanges();

          expect(dataSourcePickerServiceSpy.duplicateDataSource).toHaveBeenCalled();
          expect(dataSourcePickerServiceSpy.duplicateDataSource).toHaveBeenCalledWith('testDataSourceId');
        });

        it('should invoke addSetDataSourcePersonalizationRule for selected variant', async () => {
          const testVariants = [...mockVariants, variant];
          sut.abTestValue = getAbTestInfo(testVariants);
          await detectChanges();

          sut.selectedTestIndex = 1;
          sut.isLoading = false;
          fixture.detectChanges();

          const copyComponentButton = actionButtons()[0].nativeElement;
          copyComponentButton.click();
          fixture.detectChanges();
          await detectChanges();

          expect(mockPersonalizationLayoutService.addSetDataSourcePersonalizationRule).toHaveBeenCalledWith(
            'test_instance_id',
            'some_random_id',
            'testId',
          );
        });
      });

      describe('When selected componet is FEaas/BYOC component', () => {
        it('should invoke addSetDataSourcePersonalizationRule for selected variant', async () => {
          canvasLayoutServices.findRendering.and.returnValue({
            id: FEAAS_RENDERING_ID,
            dataSource: undefined,
            parameters: { parameter1: 'value123' },
          } as any);
          await detectChanges();

          const renderingRulesUpdate: PersonlizedRenderingInfo = {
            dataSource: undefined,
            renderingParameters: { parameter1: 'value123' },
          };

          const testVariants = [...mockVariants, variant];
          sut.abTestValue = getAbTestInfo(testVariants);
          fixture.detectChanges();

          sut.selectedTestIndex = 1;
          sut.isLoading = false;
          fixture.detectChanges();

          const copyComponentButton = actionButtons()[0].nativeElement;
          copyComponentButton.click();
          await detectChanges();

          expect(mockPersonalizationLayoutService.addRenderingDetailsPersonalizationRule).toHaveBeenCalledWith(
            'test_instance_id',
            'some_random_id',
            renderingRulesUpdate,
            true,
          );
        });
      });
    });
  });

  describe('Variant actions', () => {
    const inputField = () => fixture.debugElement.query(By.css('.edit-variant-name-input input')).nativeElement;
    const variantContextInstance = (): VariantActionsContextMenuComponent =>
      fixture.debugElement.query(By.css('app-variant-actions-context-menu')).componentInstance;
    const variant: BXComponentVariant = {
      ref: 'cph',
      name: 'chp-variant',
      isControl: false,
      tasks: [
        {
          implementation: 'templateRenderTask',
          input: {
            inputType: 'templateRenderTaskInput',
            type: 'application/json',
            template: '{"variantId":"' + 'new_testVariant' + '"}',
          },
        },
      ],
    };
    describe('editVariant', () => {
      it('should show input field to edit variant name', () => {
        sut.showEditVariantName = true;
        fixture.detectChanges();

        expect(inputField()).toBeTruthy();
      });

      it('should update variant name if new name is valid and does not match the existing name', async () => {
        const testVariants = [...mockVariants, variant];
        sut.abTestValue = getAbTestInfo(testVariants);
        await detectChanges();

        sut.showEditVariantName = true;
        sut.selectedTestIndex = 1;
        fixture.detectChanges();

        inputField().value = 'New variant';
        inputField().dispatchEvent(new Event('input'));

        const event = new KeyboardEvent('keyup', {
          bubbles: true,
          cancelable: true,
          key: 'Enter',
        });
        inputField().dispatchEvent(event);
        fixture.detectChanges();

        expect(abTestComponentServiceSpy.updateComponentFlowDefinition).toHaveBeenCalled();
      });
    });

    describe('resetVariant', () => {
      it('should show reset warning text', async () => {
        sut.abTestValue = getAbTestInfo();
        await detectChanges();

        testWarningDialogComponent = new TestWarningDialogComponent(
          'COMPONENT_TESTING.RESET_VARIANT',
          'COMPONENT_TESTING.RESET_VARIANT_DESCRIPTION',
        );
        spyOn(WarningDialogComponent, 'show').and.returnValue({ component: testWarningDialogComponent } as any);
        variantContextInstance().resetBtnClick.emit(new MouseEvent('click'));
        fixture.detectChanges();

        expect(WarningDialogComponent.show).toHaveBeenCalled();
        expect(testWarningDialogComponent.title).toBe('COMPONENT_TESTING.RESET_VARIANT');
        expect(testWarningDialogComponent.text).toBe('COMPONENT_TESTING.RESET_VARIANT_DESCRIPTION');
      });

      it('should remove personalization rule from rendering on reset confirmed', fakeAsync(() => {
        testWarningDialogComponent = new TestWarningDialogComponent();
        spyOn(WarningDialogComponent, 'show').and.returnValue({ component: testWarningDialogComponent } as any);
        testWarningDialogComponent.dialogResultEvent.next({ confirmed: true });

        const testVariants = [...mockVariants, variant];
        sut.abTestValue = getAbTestInfo(testVariants);
        sut.selectedTestIndex = 1;
        fixture.detectChanges();

        variantContextInstance().resetBtnClick.emit(new MouseEvent('click'));
        tick();

        expect(mockPersonalizationLayoutService.removePersonalizationRuleFromRendering).toHaveBeenCalledWith(
          'test_instance_id',
          'new_testVariant',
        );
      }));

      it('should be disabled if Flow Definition is not in Draft mode', async () => {
        const variant: BXComponentVariant = {
          ref: 'control',
          name: 'controlVariant',
          isControl: true,
          tasks: [
            {
              implementation: 'templateRenderTask',
              input: {
                inputType: 'templateRenderTaskInput',
                type: 'application/json',
                template: '{"variantId":"' + 'new_testVariant' + '"}',
              },
            },
          ],
        };
        const testVariants = [variant, ...mockVariants];
        const testValue = getAbTestInfo(testVariants);

        testValue.flowDefinition.status = 'DRAFT';
        sut.abTestValue = testValue;
        sut.selectedTestIndex = 1;
        sut.abTest.rendering.appliedPersonalizationActions.push('HideRenderingAction');
        await detectChanges();

        expect(variantContextInstance().disableResetVariant()).toBeFalse();

        sut.abTest.flowDefinition.status = 'PUBLISHING';
        await detectChanges();

        expect(variantContextInstance().disableResetVariant()).toBeTrue();
      });
    });

    describe('deleteVariant', () => {
      it('should show delete warning text', async () => {
        sut.abTestValue = getAbTestInfo();
        await detectChanges();

        testWarningDialogComponent = new TestWarningDialogComponent(
          'COMPONENT_TESTING.DELETE_VARIANT',
          'COMPONENT_TESTING.DELETE_VARIANT_DESCRIPTION',
        );
        spyOn(WarningDialogComponent, 'show').and.returnValue({ component: testWarningDialogComponent } as any);
        variantContextInstance().deleteBtnClick.emit(new MouseEvent('click'));
        fixture.detectChanges();

        expect(WarningDialogComponent.show).toHaveBeenCalled();
        expect(testWarningDialogComponent.title).toBe('COMPONENT_TESTING.DELETE_VARIANT');
        expect(testWarningDialogComponent.text).toBe('COMPONENT_TESTING.DELETE_VARIANT_DESCRIPTION');
      });

      it('should remove existing personalization rule', fakeAsync(() => {
        testWarningDialogComponent = new TestWarningDialogComponent();
        spyOn(WarningDialogComponent, 'show').and.returnValue({ component: testWarningDialogComponent } as any);
        testWarningDialogComponent.dialogResultEvent.next({ confirmed: true });

        const testVariants = [...mockVariants, variant];
        sut.abTestValue = getAbTestInfo(testVariants);
        sut.selectedTestIndex = 1;
        fixture.detectChanges();

        variantContextInstance().deleteBtnClick.emit(new MouseEvent('click'));
        tick();

        expect(mockPersonalizationLayoutService.removePersonalizationRuleFromRendering).toHaveBeenCalledWith(
          'test_instance_id',
          'new_testVariant',
          false,
        );
      }));

      it('should remove variant from flow definition', fakeAsync(() => {
        testWarningDialogComponent = new TestWarningDialogComponent();
        spyOn(WarningDialogComponent, 'show').and.returnValue({ component: testWarningDialogComponent } as any);
        testWarningDialogComponent.dialogResultEvent.next({ confirmed: true });

        const testVariants = [...mockVariants, variant];
        sut.abTestValue = getAbTestInfo(testVariants);
        sut.selectedTestIndex = 1;
        fixture.detectChanges();

        variantContextInstance().deleteBtnClick.emit(new MouseEvent('click'));
        tick();
        fixture.detectChanges();

        const expectedNewFlowDefinition = getAbTestInfo().flowDefinition;
        const variantsList = fixture.debugElement.queryAll(By.css('ng-spd-tab-group button .p-0'));

        expect(abTestComponentServiceSpy.updateComponentFlowDefinition).toHaveBeenCalledWith(expectedNewFlowDefinition);
        expect(variantsList.length).toBe(1);
      }));
    });
  });

  describe('configureExperiment', () => {
    const configureExperimentButton = () => fixture.debugElement.query(By.css('.configure-experiment')).nativeElement;

    it('should show configure experiment dialog', async () => {
      const flowDefinition = { ...mockComponentFlowDefinition, status: 'DRAFT' as FlowStatus };
      const abTest = { ...getAbTestInfo(), flowDefinition };

      sut.abTestValue = abTest;
      fixture.detectChanges();

      configureExperimentButton().click();
      await fixture.whenStable();

      expect(configExpDialogServiceSpy.show).toHaveBeenCalledWith({
        flowDefinition: abTest.flowDefinition,
        existingNames: jasmine.anything(),
        renderingInstanceId: 'test_instance_id',
      });
    });

    it('should update flowDefinition with the new values from dialog and update the component flow definition', async () => {
      const newFlowDefinition: BXComponentFlowDefinition = {
        siteId: 'test_side_id',
        ref: 'ref',
        archived: false,
        businessProcess: 'interactive_v1',
        name: 'new_flow_definition',
        friendlyId: 'embedded_43243232343eedd323_1',
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
        status: 'DRAFT',
        tags: [],
        triggers: [],
        type: 'INTERACTIVE_API_FLOW',
        variants: [{ ref: 'test', name: 'testVariant', isControl: false, tasks: [] }],
        subtype: 'EXPERIENCE',
        transpiledVariants: [],
      };
      configExpDialogServiceSpy.show.and.returnValue(
        of({
          status: 'OK',
          flowDefinition: newFlowDefinition,
        }),
      );
      await fixture.whenStable();

      const flowDefinition = { ...mockComponentFlowDefinition, status: 'DRAFT' as any };
      const abTest = { ...getAbTestInfo(), flowDefinition };

      sut.abTestValue = abTest;
      fixture.detectChanges();

      configureExperimentButton().click();
      await fixture.whenStable();

      const expectedUpdatedFlowDefinition = Object.assign(abTest.flowDefinition, newFlowDefinition);

      expect(abTestComponentServiceSpy.updateComponentFlowDefinition).toHaveBeenCalledWith(
        expectedUpdatedFlowDefinition,
      );
    });
  });

  describe('endTest', async () => {
    const variant: BXComponentVariant = {
      ref: 'test12',
      name: 'selectedVariant',
      isControl: false,
      tasks: [
        {
          implementation: 'templateRenderTask',
          input: {
            inputType: 'templateRenderTaskInput',
            type: 'application/json',
            template: '{"variantId":"' + 'new_selected_variant_id' + '"}',
          },
        },
      ],
    };
    beforeEach(async () => {
      variantPublishedStatusServiceSpy.isPagePublished.and.returnValue(true);
      endExperimentDialogServiceSpy.show.and.returnValue(of(getAbTestInfo().flowDefinition.variants[1]));
      sut.init();
      await detectChanges();
    });

    it('should show end experiment dialog', async () => {
      const abTest = getAbTestInfo();
      sut.abTestValue = abTest;
      fixture.detectChanges();

      endTestButton().click();
      await fixture.whenStable();

      expect(endExperimentDialogServiceSpy.show).toHaveBeenCalledWith({
        variants: abTest.flowDefinition.variants,
        isStatisticalSignificanceReached: !!abTest.flowDefinition.result,
      });
    });

    it('should invoke updateComponentFlowDefinition with flowDefinition status as COMPLETE', async () => {
      const abTest = getAbTestInfo([...mockVariants, variant]);
      sut.abTestValue = abTest;
      fixture.detectChanges();

      endExperimentDialogServiceSpy.show.and.returnValue(of(abTest.flowDefinition.variants[1]));
      endTestButton().click();
      fixture.detectChanges();

      expect(abTestComponentServiceSpy.updateComponentFlowDefinition).toHaveBeenCalledWith({
        ...abTest.flowDefinition,
        status: 'COMPLETED' as FlowStatus,
      });
    });

    it('should invoke applyVariantAsDefaultSetup with selected variant id', fakeAsync(async () => {
      const abTest = getAbTestInfo([...mockVariants, variant]);
      sut.abTestValue = abTest;
      fixture.detectChanges();

      endExperimentDialogServiceSpy.show.and.returnValue(of(abTest.flowDefinition.variants[1]));
      endTestButton().click();
      tick();

      expect(mockPersonalizationLayoutService.applyVariantAsDefaultSetup).toHaveBeenCalledWith(
        'test_instance_id',
        'new_selected_variant_id',
        false,
      );
    }));

    it('should update context', fakeAsync(async () => {
      const updateContextSpy = spyOn(context, 'updateContext').and.callThrough();

      const abTest = getAbTestInfo([...mockVariants, variant]);
      sut.abTestValue = abTest;
      fixture.detectChanges();

      endExperimentDialogServiceSpy.show.and.returnValue(of(abTest.flowDefinition.variants[1]));
      endTestButton().click();
      tick();

      expect(updateContextSpy).toHaveBeenCalledWith({
        variant: undefined,
        itemVersion: 1,
      });
    }));

    it('should refetch flows', async () => {
      const abTest = getAbTestInfo([...mockVariants, variant]);
      sut.abTestValue = abTest;
      fixture.detectChanges();

      endExperimentDialogServiceSpy.show.and.returnValue(of(abTest.flowDefinition.variants[1]));
      endTestButton().click();
      await fixture.whenStable();

      expect(abTestComponentServiceSpy.refetchFlows).toHaveBeenCalledWith(
        'foo1bar2-baz3-0000-aaaa-bbbbcccc1234',
        'pt-BR',
      );
    });

    it('should show notification when test is ended', async () => {
      const abTest = getAbTestInfo([...mockVariants, variant]);
      sut.abTestValue = abTest;
      fixture.detectChanges();

      endExperimentDialogServiceSpy.show.and.returnValue(of(abTest.flowDefinition.variants[1]));
      endTestButton().click();
      await fixture.whenStable();

      const [{ text, severity }] = timedNotificationServiceSpy.pushNotification.calls.mostRecent().args;

      expect(timedNotificationServiceSpy.pushNotification).toHaveBeenCalled();
      expect(text).toBe('COMPONENT_TESTING.END_TEST_NOTIFICATION {"name":"morning visitor"}');
      expect(severity).toBe('success');
    });
  });
});
