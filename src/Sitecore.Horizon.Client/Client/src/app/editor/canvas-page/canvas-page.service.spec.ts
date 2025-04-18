/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  MessagingP2PChannelDef,
  RpcServicesImplementation,
  createVirtualP2PConnection,
} from '@sitecore/horizon-messaging';
import { TestMessagingP2PChannel, makeTestMessagingP2PChannelFromDef } from '@sitecore/horizon-messaging/dist/testing';
import { NgCommandManager, NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import {
  MessagingEventsEmitterChannel,
  MessagingEventsReceiverChannel,
  MessagingRpcProvider,
  MessagingRpcServicesClient,
} from '@sitecore/page-composer-sdk';
import { AbTestComponentService } from 'app/pages/left-hand-side/personalization/personalization-services/ab-test-component.service';
import { PersonalizationLayoutService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { BXPersonalizationFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';
import { CanvasRenderingApiService } from 'app/shared/canvas/canvas-rendering-api.service';
import {
  CanvasPageStateManagerTesting,
  CanvasPageStateManagerTestingModule,
} from 'app/shared/client-state/canvas-page-state-manager.testing';
import { Context } from 'app/shared/client-state/context.service';
import {
  ContextServiceTesting,
  ContextServiceTestingModule,
  DEFAULT_TEST_ITEM,
} from 'app/shared/client-state/context.service.testing';
import { PageInteractionsGuardService } from 'app/shared/client-state/page-interactions-guard.service';
import { ContentItemDialogService } from 'app/shared/dialogs/content-item-dialog/content-item-dialog.service';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { EditingChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  BasicChromeInfo,
  EditingCanvasEvents,
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
  Field,
  InitialPageState,
  PlaceholderChromeInfo,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TestBedInjectSpy, createSpyObserver, nextTick, spyObservable } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject, NEVER, ReplaySubject, firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';
import { EditingShellRpcServices, EditorCommands } from 'sdk';
import { EditorWorkspaceService } from '../editor-workspace/editor-workspace.service';
import { FieldsTrackerService } from '../lhs-panel/data-view/fields-tracker.service';
import { RenderingDetailsService } from '../right-hand-side/rendering-details/rendering-details.service';
import { AddPhoneNumberService } from '../right-hand-side/rich-text-editor/add-phone-number.service';
import { EditSourceCodeService } from '../right-hand-side/rich-text-editor/edit-source-code.service';
import { MediaPickerService } from '../right-hand-side/rich-text-editor/media-picker.service';
import { mockComponentFlowDefinition } from '../right-hand-side/test-component/ab-test-component.utils';
import { CanvasLayoutServices, CanvasServices, CanvasServicesImpl } from '../shared/canvas.services';
import { PageLayout } from '../shared/layout/page-layout';
import { Rule } from '../shared/layout/page-layout-definition';
import { CanvasPageService } from './canvas-page.service';

const INITIAL_CONTEXT: Context = {
  itemId: 'foo',
  itemVersion: 1,
  language: 'maorie',
  siteName: 'supermutantninjaturtles',
};

const personalizationFlowDefinition: BXPersonalizationFlowDefinition = {
  siteId: 'e1d1a1a5-728d-4a5d-82a2-c2dd356af043',
  ref: 'ref',
  archived: false,
  businessProcess: 'interactive_v1',
  name: 'morning visitor',
  friendlyId: 'embedded_123_1',
  channels: ['WEB'],
  sampleSizeConfig: {
    baseValue: 0.15,
    minimumDetectableDifference: 0.02,
    confidenceLevel: 0.95,
  },
  schedule: {
    type: 'simpleSchedule',
    startDate: '01/08/2021',
  },
  status: 'PRODUCTION',
  tags: [],
  traffic: {
    type: 'audienceTraffic',
    weightingAlgorithm: 'USER_DEFINED',
    splits: [
      {
        variantId: 'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_copenhagen',
        template: JSON.stringify({ variantId: 'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_copenhagen' }),
        variantName: 'Visitor from Copenhagen',
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
      {
        variantId: 'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_oslo',
        template: JSON.stringify({ variantId: 'a9af91ad-a9c3-46b4-b662-9cc37fdeab51_en_visitor_from_oslo' }),
        variantName: 'Visitor from Oslo',
        audienceName: 'User has visited home page',
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
    ],
  },
  triggers: [],
  type: 'INTERACTIVE_API_FLOW',
  variants: [],
  subtype: 'EXPERIENCE',
  transpiledVariants: [],
};

class TestWarningDialogComponent {
  title = 'Dialog title';
  text = 'Dialog text';
  declineText = 'Decline';
  confirmText = 'Confirm';

  dialogResultEvent = new BehaviorSubject<{ confirmed: boolean }>({ confirmed: true });
}

describe(CanvasPageService.name, () => {
  let sut: CanvasPageService;
  let messagingServiceSpy: jasmine.SpyObj<MessagingService>;
  let globalMessaging: Partial<NgGlobalMessaging>;
  let ngCommandManagerSpy: jasmine.SpyObj<NgCommandManager<EditorCommands>>;
  let rpcServiceSpy: jasmine.SpyObj<MessagingRpcServicesClient<EditingShellRpcServices>>;
  let testGeneralChannel: TestMessagingP2PChannel<
    EditingCanvasEvents,
    EditingHorizonEvents,
    EditingCanvasRpcServices,
    EditingHorizonRpcServices
  >;
  let testgeneralChannelRpcSpy: jasmine.SpyObj<RpcServicesImplementation<EditingCanvasRpcServices>>;
  let rpcProviderSpy: jasmine.SpyObj<MessagingRpcProvider>;
  let eventReceiverSpy: jasmine.SpyObj<MessagingEventsReceiverChannel<any>>;
  let eventEmitterSpy: jasmine.SpyObj<MessagingEventsEmitterChannel<any>>;
  let contextService: ContextServiceTesting;
  let canvasServices: CanvasServices;
  let editorWorkspaceServiceSpy: jasmine.SpyObj<EditorWorkspaceService>;
  let personalizationService: jasmine.SpyObj<PersonalizationService>;
  let personalizationLayoutService: jasmine.SpyObj<PersonalizationLayoutService>;
  let dialogOverlayService: jasmine.SpyObj<DialogOverlayService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let mediaPickerService: jasmine.SpyObj<MediaPickerService>;
  let editSourceCodeService: jasmine.SpyObj<EditSourceCodeService>;
  let abTestComponentService: jasmine.SpyObj<AbTestComponentService>;
  let addPhoneNumberService: jasmine.SpyObj<AddPhoneNumberService>;
  let contentItemDialogService: jasmine.SpyObj<ContentItemDialogService>;
  let testWarningDialogComponent: TestWarningDialogComponent;
  let renderingDetailsService: RenderingDetailsService;
  let fieldsTrackerService: FieldsTrackerService;
  let canvasPageStateManager: CanvasPageStateManagerTesting;
  let pageInteractionsGuardService: PageInteractionsGuardService;

  const isPersonalizationMode$ = new ReplaySubject<boolean>();

  beforeEach(async () => {
    rpcProviderSpy = jasmine.createSpyObj('rpcProviderSpy', ['disconnect']);
    eventReceiverSpy = jasmine.createSpyObj('MessagingEventsReceiverChannel', ['on', 'disconnect']);
    eventEmitterSpy = jasmine.createSpyObj('MessagingEventsEmitterChannel', ['emit', 'syncEmit']);

    globalMessaging = {
      createEventEmitter(_contract) {
        return eventEmitterSpy;
      },
      getEventReceiver(_contract) {
        return eventReceiverSpy as MessagingEventsReceiverChannel<any>;
      },
      createRpc(_contract) {
        return rpcProviderSpy;
      },
      async getRpc(_contract) {
        return rpcServiceSpy as MessagingRpcServicesClient<any>;
      },
    };

    TestBed.configureTestingModule({
      imports: [
        CanvasPageStateManagerTestingModule,
        ContextServiceTestingModule,
        TranslateServiceStubModule,
        TranslateModule,
      ],
      providers: [
        CanvasPageService,
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>('MessagingService', [
            'getEditingCanvasChannel',
            'connectEditingShell',
            'onCanvasDisconnect',
          ]),
        },
        {
          provide: NgGlobalMessaging,
          useValue: globalMessaging,
        },
        {
          provide: NgCommandManager,
          useValue: jasmine.createSpyObj<NgCommandManager<EditorCommands>>({ invoke: undefined }),
        },
        {
          provide: EditorWorkspaceService,
          useValue: jasmine.createSpyObj<EditorWorkspaceService>('EditorWorkspaceService', ['setCanvasLoadState']),
        },
        {
          provide: PersonalizationService,
          useValue: jasmine.createSpyObj<PersonalizationService>('PersonalizationService', [], {
            isPersonalizationMode$,
          }),
        },
        {
          provide: PersonalizationLayoutService,
          useValue: jasmine.createSpyObj<PersonalizationLayoutService>('PersonalizationLayoutService', [
            'clearPersonalizationForRendering',
          ]),
        },
        {
          provide: AbTestComponentService,
          useValue: jasmine.createSpyObj<AbTestComponentService>('AbTestComponentService', [
            'getPageFlowDefinitions',
            'getAbTestConfigStatus',
            'getAbTestsConfiguredOnPage',
          ]),
        },
        {
          provide: CanvasRenderingApiService,
          useValue: jasmine.createSpyObj<CanvasRenderingApiService>('CanvasRenderingApiService', [
            'fetchComponentRendering',
          ]),
        },
        {
          provide: EditSourceCodeService,
          useValue: jasmine.createSpyObj<EditSourceCodeService>(['promptEditSourceCode']),
        },
        {
          provide: AddPhoneNumberService,
          useValue: jasmine.createSpyObj<AddPhoneNumberService>(['promptAddPhoneNumber']),
        },
        {
          provide: ContentItemDialogService,
          useValue: jasmine.createSpyObj<ContentItemDialogService>(['show']),
        },
        {
          provide: RenderingDetailsService,
          useValue: jasmine.createSpyObj<RenderingDetailsService>(['getRenderingDetails']),
        },
        {
          provide: PageInteractionsGuardService,
          useValue: jasmine.createSpyObj<PageInteractionsGuardService>({
            onBeforeChromeSelectionChange: Promise.resolve({ isAborted: false }),
          }),
        },
        {
          provide: FieldsTrackerService,
          useValue: jasmine.createSpyObj<FieldsTrackerService>({
            watchFieldsValueChange: NEVER,
            watchInitialItemFieldsState: NEVER,
            notifyFieldValueChange: undefined,
            watchEditingMode: NEVER,
            notifyInitialItemFieldsState: undefined,
            setEditingMode: undefined,
          }),
        },
      ],
    });

    isPersonalizationMode$.next(false);

    renderingDetailsService = TestBedInjectSpy(RenderingDetailsService);
    pageInteractionsGuardService = TestBedInjectSpy(PageInteractionsGuardService);
    personalizationService = TestBedInjectSpy(PersonalizationService);
    abTestComponentService = TestBedInjectSpy(AbTestComponentService);
    fieldsTrackerService = TestBedInjectSpy(FieldsTrackerService);
    abTestComponentService.getAbTestConfigStatus.and.returnValue(Promise.resolve('readyForConfiguration'));
    canvasPageStateManager = TestBed.inject(CanvasPageStateManagerTesting);

    abTestComponentService.getPageFlowDefinitions.and.returnValue(
      Promise.resolve({
        context: { itemId: 'test-itemId', language: 'test-language' },
        flows: [personalizationFlowDefinition],
      }),
    );

    rpcServiceSpy = jasmine.createSpyObj('rpcServiceSpy', {
      getContext: () => ({
        itemId: 'test-itemId',
        language: 'test-language',
        siteName: 'test-siteName',
      }),
      // eslint-disable-next-line @typescript-eslint/prefer-as-const
      save: async () => ({ kind: 'successful' as 'successful' }),
      notifyKnownWorkspaceItemState: () => {},
      updateContext: () => {},
    });

    // Configure services
    globalMessaging = TestBedInjectSpy(NgGlobalMessaging);
    messagingServiceSpy = TestBedInjectSpy(MessagingService);
    testgeneralChannelRpcSpy = jasmine.createSpyObj<RpcServicesImplementation<EditingCanvasRpcServices>>(
      'EditingChannelRpc',
      ['updatePageState'],
    );
    testGeneralChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, testgeneralChannelRpcSpy);
    messagingServiceSpy.getEditingCanvasChannel.and.returnValue(testGeneralChannel);
    messagingServiceSpy.onCanvasDisconnect.and.returnValue(() => {});

    ngCommandManagerSpy = TestBedInjectSpy(NgCommandManager);
    ngCommandManagerSpy.invoke.and.callFake((_name, ctx) => Promise.resolve(ctx));

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(INITIAL_CONTEXT);
    contextService.provideTestItemUpdate({
      revision: 'revision001',
    } as any);
    await contextService.provideDefaultTestItem();

    canvasServices = TestBed.inject(CanvasServices);
    editorWorkspaceServiceSpy = TestBedInjectSpy(EditorWorkspaceService);

    dialogOverlayService = TestBedInjectSpy(DialogOverlayService);
    translateService = TestBedInjectSpy(TranslateService);
    mediaPickerService = TestBedInjectSpy(MediaPickerService);
    editSourceCodeService = TestBedInjectSpy(EditSourceCodeService);
    addPhoneNumberService = TestBedInjectSpy(AddPhoneNumberService);
    contentItemDialogService = TestBedInjectSpy(ContentItemDialogService);
    personalizationLayoutService = TestBedInjectSpy(PersonalizationLayoutService);

    sut = TestBed.inject(CanvasPageService);
  });

  afterEach(async () => {
    await nextTick();

    sut.ngOnDestroy();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('given "page:load" event message', () => {
    it('should update chromeSelect$ with undefined if chrome is not presented', async () => {
      testGeneralChannel.dispatchEvent('page:load', {
        fields: [],
        layout: PageLayout.stringifyLayoutDefinition({ devices: [] }),
        layoutDeviceId: 'test-device-id',
        droppableRenderingIds: [],
        styles: {},
      });

      await nextTick();

      const selectedChrome = await firstValueFrom(canvasServices.chromeSelect$.pipe(first()));
      expect(selectedChrome).toEqual({ selection: undefined, eventSource: undefined });
    });

    it('should update Canvas state', async () => {
      testGeneralChannel.dispatchEvent('page:load', {
        fields: [],
        layout: PageLayout.stringifyLayoutDefinition({
          devices: [
            {
              id: 'id',
              layoutId: 'layoutId',
              placeholders: [],
              renderings: [],
            },
          ],
        }),
        layoutDeviceId: 'test-device-id',
        droppableRenderingIds: [],
        styles: {},
      });

      await nextTick();

      expect((canvasServices.getCurrentLayout() as PageLayout).getLayoutSnapshot()).toBe(
        '{"devices":[{"id":"id","layoutId":"layoutId","placeholders":[],"renderings":[]}]}',
      );
    });

    describe('reportIsPersonalizationModeToCanvas()', () => {
      it('should emit current value of isPersonalizationMode', async () => {
        testGeneralChannel.dispatchEvent('page:load', {
          fields: [],
          layout: PageLayout.stringifyLayoutDefinition({ devices: [] }),
          layoutDeviceId: 'test-device-id',
          droppableRenderingIds: [],
          styles: {},
        });

        await nextTick();

        const result = testGeneralChannel.getEmittedEvents('canvas:set-personalization-mode').slice(-1);
        expect(result[0].isPersonalizationMode).toBe(false);
      });
    });
  });

  describe('given "canvas:parse" event message', () => {
    const PAGE_STATE: InitialPageState = {
      fields: [
        {
          itemId: '5AE00CB4-0C7E-49C6-B622-536F35B11CC0',
          itemVersion: 1,
          fieldId: '75577384-3C97-45DA-A847-81B00500E250',
          revision: '58366c56-033f-425a-bac5-a455dbeab90b',
          value: { rawValue: 'Sample 2' },
          reset: false,
        },
        {
          itemId: '5AE00CB4-0C7E-49C6-B622-536F35B11CC0',
          itemVersion: 1,
          fieldId: 'A60ACD61-A6DB-4182-8329-C957982CEC74',
          revision: '58366c56-033f-425a-bac5-a455dbeab90b',
          value: { rawValue: '<p><br /></p>' },
          reset: false,
        },
      ],
      layout: PageLayout.stringifyLayoutDefinition({ devices: [] }),
      layoutDeviceId: 'layout-device-id',
      droppableRenderingIds: [],
      styles: {},
    };

    it('should emit afterParse$', async () => {
      // prepare
      const afterParseSpy = jasmine.createSpy('afterParse$');
      const subscription = sut.afterParse$.subscribe(afterParseSpy);

      // act
      testGeneralChannel.dispatchEvent('page:load', PAGE_STATE);
      await nextTick();

      // assert
      expect(afterParseSpy).toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('should addState to history', async () => {
      testGeneralChannel.dispatchEvent('page:load', PAGE_STATE);
      await nextTick();

      expect(rpcServiceSpy.notifyKnownWorkspaceItemState).toHaveBeenCalled();
      const [state, ctx] = rpcServiceSpy.notifyKnownWorkspaceItemState.calls.mostRecent().args;
      expect(state).toEqual(
        jasmine.objectContaining({
          itemId: INITIAL_CONTEXT.itemId,
          fields: PAGE_STATE.fields,
          layout: PAGE_STATE.layout,
          revision: DEFAULT_TEST_ITEM.revision,
        }),
      );
      expect(ctx).toEqual({
        itemId: INITIAL_CONTEXT.itemId,
        language: INITIAL_CONTEXT.language,
        siteName: INITIAL_CONTEXT.siteName,
        itemVersion: INITIAL_CONTEXT.itemVersion,
        variant: undefined,
      });
    });
  });

  describe('given "field:change" event message', () => {
    const itemId = 'test-itemId';
    const fieldId = 'testField42';
    const itemVersion = 2;

    const fieldChangeData: Field = {
      fieldId,
      itemId,
      itemVersion,
      value: { rawValue: '42' },
      revision: 'revision001',
      reset: false,
    };

    beforeEach(async () => {
      // Populate initial value to correctly set context.
      await testGeneralChannel.dispatchEvent('page:load', {
        fields: [],
        layout: PageLayout.stringifyLayoutDefinition({ devices: [] }),
        layoutDeviceId: 'layout-device-id',
        droppableRenderingIds: [],
        styles: {},
      });
    });

    it('should update history', async () => {
      testGeneralChannel.dispatchEvent('field:change', fieldChangeData);
      await nextTick();

      expect(rpcServiceSpy.save).toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), false);
    });

    it('should save', async () => {
      testGeneralChannel.dispatchEvent('field:change', fieldChangeData);
      await nextTick();

      expect(rpcServiceSpy.save).toHaveBeenCalled();
      const [update] = rpcServiceSpy.save.calls.mostRecent().args;
      expect(update).toEqual({
        fields: [
          jasmine.objectContaining({
            fieldId,
            itemId,
            itemVersion,
            value: { rawValue: '42' },
            reset: false,
          }),
        ],
      });
    });

    it('should save with the context at the time of "page:load"', async () => {
      contextService.provideTestValue({ itemId: 'new item', language: 'new catalan', siteName: 'boringsite' });

      testGeneralChannel.dispatchEvent('field:change', fieldChangeData);
      await nextTick();

      expect(rpcServiceSpy.save).toHaveBeenCalledTimes(1);
      const [, context] = rpcServiceSpy.save.calls.mostRecent().args;
      expect(context.itemId).toBe(INITIAL_CONTEXT.itemId);
      expect(context.siteName).toBe(INITIAL_CONTEXT.siteName);
      expect(context.language).toBe(INITIAL_CONTEXT.language);
    });

    it('should update the context if there is a new "page:load" message', async () => {
      const newContext = { itemId: 'new item', language: 'new catalan', siteName: 'boringsite' };
      contextService.provideTestValue(newContext);
      await nextTick();

      await testGeneralChannel.dispatchEvent('page:load', {
        fields: [],
        layout: PageLayout.stringifyLayoutDefinition({ devices: [] }),
        layoutDeviceId: 'layout-device-id',
        droppableRenderingIds: [],
        styles: {},
      });

      testGeneralChannel.dispatchEvent('field:change', fieldChangeData);
      await nextTick();

      expect(rpcServiceSpy.save).toHaveBeenCalledTimes(1);
      const [, context] = rpcServiceSpy.save.calls.mostRecent().args;
      expect(context.itemId).toBe(newContext.itemId);
      expect(context.siteName).toBe(newContext.siteName);
      expect(context.language).toBe(newContext.language);
    });
  });

  describe('given modified layout via Canvas.Services', () => {
    beforeEach(async () => {
      // Populate initial value to correctly set context.
      await testGeneralChannel.dispatchEvent('page:load', {
        fields: [],
        layout: PageLayout.stringifyLayoutDefinition({
          devices: [
            {
              id: 'layout-device-id-1',
              layoutId: 'device1Layout',
              placeholders: [],
              renderings: [],
            },
          ],
        }),
        layoutDeviceId: 'layout-device-id-1',
        droppableRenderingIds: [],
        styles: {},
      });
    });

    it('should update history', async () => {
      await canvasServices.getCurrentLayout().insertRendering('rendering-id', 'ph-key', undefined);

      expect(rpcServiceSpy.save).toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), false);
    });

    it('should save', async () => {
      await canvasServices.getCurrentLayout().insertRendering('new-rendering-id-42', 'ph-key', undefined);

      expect(rpcServiceSpy.save).toHaveBeenCalledTimes(1);
      const [savedState] = rpcServiceSpy.save.calls.mostRecent().args;
      expect(savedState.layout).toContain('new-rendering-id-42');
    });

    it('should reload canvas', async () => {
      const urlSpy = createSpyObserver();
      sut.canvasUrl$.subscribe(urlSpy);

      await canvasServices.getCurrentLayout().insertRendering('new-rendering-id-42', 'ph-key', undefined);

      expect(urlSpy.next).toHaveBeenCalledTimes(2);
    });

    it('should invoke rendering:insert hook', async () => {
      await canvasServices.getCurrentLayout().insertRendering('rendering-id', 'ph-key', undefined);

      expect(ngCommandManagerSpy.invoke).toHaveBeenCalledWith('pages:editor:rendering:insert', jasmine.anything());
    });

    it('should cancel insertion if demanded by rendering:insert hook', async () => {
      ngCommandManagerSpy.invoke.and.callFake((_cmd, ctx) => Promise.resolve({ ...ctx, cancelRenderingInsert: true }));

      const wasInserted = await canvasServices.getCurrentLayout().insertRendering('rendering-id', 'ph-key', undefined);

      expect(rpcServiceSpy.save).not.toHaveBeenCalled();
      expect(wasInserted).toBeFalse();
    });

    it('should not reload canvas if requested', async () => {
      await canvasServices.getCurrentLayout().insertRendering('new-rendering-id-42', 'ph-key', undefined);
      const layout = PageLayout.parseLayoutDefinition(rpcServiceSpy.save.calls.mostRecent().args[0].layout!);
      const urlSpy = createSpyObserver();
      sut.canvasUrl$.subscribe(urlSpy);

      await canvasServices
        .getCurrentLayout()
        .updateRenderings(
          [{ renderingInstanceId: layout.devices[0].renderings[0].instanceId, update: { dataSource: 'new-ds' } }],
          { reloadCanvas: false, skipHistory: false },
        );

      expect(urlSpy.next).toHaveBeenCalledTimes(1);
    });

    it('should save with the context at the time of "page:load"', async () => {
      contextService.provideTestValue({ itemId: 'new item', language: 'new catalan', siteName: 'boringsite' });

      await canvasServices.getCurrentLayout().insertRendering('rendering-id', 'ph-key', undefined);

      expect(rpcServiceSpy.save).toHaveBeenCalledTimes(1);
      const [, context] = rpcServiceSpy.save.calls.mostRecent().args;
      expect(context.itemId).toBe(INITIAL_CONTEXT.itemId);
      expect(context.siteName).toBe(INITIAL_CONTEXT.siteName);
      expect(context.language).toBe(INITIAL_CONTEXT.language);
    });

    it('should update the context if there is a new "page:load" message', async () => {
      const newContext = { itemId: 'new item', language: 'new catalan', siteName: 'boringsite' };
      contextService.provideTestValue(newContext);
      await nextTick();

      const updatedLayout = PageLayout.stringifyLayoutDefinition({
        devices: [
          {
            id: 'device1',
            layoutId: 'device1Layout',
            placeholders: [],
            renderings: [],
          },
        ],
      });
      await testGeneralChannel.dispatchEvent('page:load', {
        fields: [],
        layout: updatedLayout,
        layoutDeviceId: 'device1',
        droppableRenderingIds: [],
        styles: {},
      });

      await canvasServices.getCurrentLayout().insertRendering('rendering-id', 'ph-key', undefined);

      expect(rpcServiceSpy.save).toHaveBeenCalledTimes(1);
      const [, context] = rpcServiceSpy.save.calls.mostRecent().args;
      expect(context.itemId).toBe(newContext.itemId);
      expect(context.siteName).toBe(newContext.siteName);
      expect(context.language).toBe(newContext.language);
    });
  });

  describe('given "chrome:select" event message', () => {
    it('should update chromeSelect$ accordingly', async () => {
      await testGeneralChannel.dispatchEvent('chrome:select', {
        chromeId: 'chrome_id_upd',
        chromeType: 'placeholder',
        placeholderKey: 'placeholder-key',
        name: 'placeholder-key',
        displayName: 'placeholder-displayName',
        contextItem: { id: 'id', version: 42, language: 'lang' },
        allowedRenderingIds: [],
      });

      const currentSelection = await firstValueFrom(canvasServices.chromeSelect$.pipe(first()));
      expect(currentSelection?.selection?.chrome.chromeId).toBe('chrome_id_upd');
    });
  });

  describe('sendRhsEditorMessage()', () => {
    const testChannelDef: MessagingP2PChannelDef<{ 'test:event': string }, { 'test:event': string }, {}, {}> = {
      name: 'test-channel',
    };

    it('should send a message', async () => {
      await testGeneralChannel.dispatchEvent('chrome:select', {
        chromeId: 'chrome_id_42',
        chromeType: 'placeholder',
        placeholderKey: 'placeholder-key',
        name: 'placeholder-key',
        displayName: 'placeholder-displayName',
        contextItem: { id: 'id', version: 42, language: 'lang' },
        allowedRenderingIds: [],
      });
      const connection = canvasServices.chromeSelect!.selection!.messaging;
      connection.reconnect();
      const channel = connection.getChannel(testChannelDef);
      const data = 'Steven Seagal is a great actor';

      channel.emit('test:event', data);

      const rhsMessages = testGeneralChannel.getEmittedEvents('chrome:rhs:message');
      expect(rhsMessages.length).toBe(1);
      const [rhsMsg] = rhsMessages;
      expect(rhsMsg.chromeId).toBe('chrome_id_42');
    });

    it('should skip messages from canvas if connection is created with a delay', async () => {
      // JUSTIFICATION
      // We consider Canvas handlers as passive components, i.e. they cannot initiate talk to RHS.
      // Instead, RHS is connecting to them and uses them to modify and observe their behavior.
      // We design handlers in a way that connection moment does not matter, as we read state after connection.

      // arrange
      const placeholderInfo = {
        chromeId: '100500',
      } as PlaceholderChromeInfo;

      // Create a temp connection to capture a message our channel should receive.
      let msg: unknown;
      const tmpConn = createVirtualP2PConnection({
        postMessage: (m) => {
          msg = m;
        },
        onMessage: () => () => undefined,
      });
      tmpConn.reconnect();
      tmpConn.getChannel(testChannelDef).emit('test:event', 'hello from other side');

      await testGeneralChannel.dispatchEvent('chrome:select', {
        chromeId: 'chrome_id_42',
        chromeType: 'placeholder',
        placeholderKey: 'placeholder-key',
        name: 'placeholder-key',
        displayName: 'placeholder-displayName',
        contextItem: { id: 'id', version: 42, language: 'lang' },
        allowedRenderingIds: [],
      });
      const chromeConnection = canvasServices.chromeSelect!.selection!.messaging;

      const receivedEventSpy = jasmine.createSpy();

      // act
      await testGeneralChannel.dispatchEvent('chrome:select', placeholderInfo);
      testGeneralChannel.dispatchEvent('chrome:rhs:message', { chromeId: '100500', msg });

      await nextTick();
      chromeConnection.getChannel(testChannelDef).on('test:event', receivedEventSpy);
      chromeConnection.reconnect();

      // assert
      expect(receivedEventSpy).not.toHaveBeenCalled();
    });

    it('should continue emitting events for the same chrome after it is deselected', async () => {
      // arrange
      const placeholderInfo1 = {
        chromeId: 'ph_1',
      } as PlaceholderChromeInfo;
      const placeholderInfo2 = {
        chromeId: 'ph_2',
      } as PlaceholderChromeInfo;

      await testGeneralChannel.dispatchEvent('chrome:select', placeholderInfo1);
      const chromeConnection = canvasServices.chromeSelect!.selection!.messaging;

      // Create a temp connection to capture a message our channel should receive.
      let msg: unknown;
      const tmpConn = createVirtualP2PConnection({
        postMessage: (m) => {
          msg = m;
        },
        onMessage: () => () => undefined,
      });
      tmpConn.reconnect();
      tmpConn.getChannel(testChannelDef).emit('test:event', 'hello from other side');

      const receivedEventSpy = jasmine.createSpy();
      chromeConnection.getChannel(testChannelDef).on('test:event', receivedEventSpy);
      chromeConnection.reconnect();

      // act
      await testGeneralChannel.dispatchEvent('chrome:select', placeholderInfo1);
      testGeneralChannel.dispatchEvent('chrome:rhs:message', { chromeId: placeholderInfo1.chromeId, msg });
      await testGeneralChannel.dispatchEvent('chrome:select', placeholderInfo2);
      testGeneralChannel.dispatchEvent('chrome:rhs:message', { chromeId: placeholderInfo2.chromeId, msg });
      await testGeneralChannel.dispatchEvent('chrome:select', placeholderInfo1);
      testGeneralChannel.dispatchEvent('chrome:rhs:message', { chromeId: placeholderInfo1.chromeId, msg });

      // assert
      await nextTick();
      expect(receivedEventSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('reloadCanvas()', () => {
    it('should emit a canvas:before-reload event and trigger reload if connected', async () => {
      await testGeneralChannel.dispatchEvent('page:load', {
        fields: [],
        layout: PageLayout.stringifyLayoutDefinition({ devices: [] }),
        layoutDeviceId: 'layout-device-id',
        droppableRenderingIds: [],
        styles: {},
      });
      const observer = createSpyObserver();
      sut.canvasUrl$.subscribe(observer);

      const chromeToSelectAfterReload: BasicChromeInfo = { chromeId: 'chromeId1', chromeType: 'rendering' };
      await sut.reloadCanvas(chromeToSelectAfterReload);

      expect(testGeneralChannel.getEmittedEvents('canvas:before-unload').length).toBe(1);
      expect(testGeneralChannel.getEmittedEvents('canvas:before-unload')[0].chromeToSelect).toBe(
        chromeToSelectAfterReload,
      );
      expect(observer.next).toHaveBeenCalledTimes(2);
    });

    it('should NOT emit a canvas:before-reload event when trigger reload if NOT connected', async () => {
      const observer = createSpyObserver();
      sut.canvasUrl$.subscribe(observer);

      await sut.reloadCanvas();

      expect(testGeneralChannel.getEmittedEvents('canvas:before-unload').length).toBe(0);
      expect(observer.next).toHaveBeenCalledTimes(2);
    });
  });

  describe('editSourceCode()', () => {
    it('should open Edit data source dialog', async () => {
      await testGeneralChannel.registeredRpcServicesImpl?.editSourceCode('New code');

      expect(editSourceCodeService.promptEditSourceCode).toHaveBeenCalledWith('New code');
    });
  });

  describe('canvasUrl$', () => {
    it('should provide initial url if connected later', () => {
      const spy = createSpyObserver();

      sut.canvasUrl$.subscribe(spy);

      expect(spy.next).toHaveBeenCalledTimes(1);
    });

    it('should provide URL based on context', () => {
      const urlSpy = spyObservable(sut.canvasUrl$);

      const { canvasUrl } = urlSpy.next.calls.mostRecent().args[0];
      expect(canvasUrl.context.itemId).toBe(INITIAL_CONTEXT.itemId);
      expect(canvasUrl.context.language).toBe(INITIAL_CONTEXT.language);
      expect(canvasUrl.context.siteName).toBe(INITIAL_CONTEXT.siteName);
    });

    it('should change URL if new context provided', () => {
      const urlSpy = spyObservable(sut.canvasUrl$);
      contextService.setTestItemId('updated-item-id');

      expect(urlSpy.next).toHaveBeenCalledTimes(2);
      const { canvasUrl } = urlSpy.next.calls.mostRecent().args[0];
      expect(canvasUrl.context.itemId).toBe('updated-item-id');
    });

    describe('Context source is BEACON', () => {
      it('should emit the first time', () => {
        sut = new CanvasPageService(
          messagingServiceSpy,
          contextService,
          canvasServices,
          editorWorkspaceServiceSpy,
          globalMessaging as any,
          ngCommandManagerSpy,
          personalizationService,
          abTestComponentService,
          dialogOverlayService,
          translateService,
          mediaPickerService,
          editSourceCodeService,
          addPhoneNumberService,
          contentItemDialogService,
          personalizationLayoutService,
          renderingDetailsService,
          fieldsTrackerService,
          canvasPageStateManager,
          pageInteractionsGuardService,
        );
        const urlSpy = spyObservable(sut.canvasUrl$);

        contextService.provideTestValue(
          {
            itemId: 'fakeitemid',
            language: 'fakelang',
            deviceLayoutId: 'fakedevicelayoutid',
            siteName: 'fakesite',
          },
          { eventSource: 'CANVAS_BEACON' },
        );

        expect(urlSpy.next).toHaveBeenCalledTimes(1);
      });

      it('should ignore changes from BEACON when its not the first change', () => {
        sut = new CanvasPageService(
          messagingServiceSpy,
          contextService,
          canvasServices,
          editorWorkspaceServiceSpy,
          globalMessaging as any,
          ngCommandManagerSpy,
          personalizationService,
          abTestComponentService,
          dialogOverlayService,
          translateService,
          mediaPickerService,
          editSourceCodeService,
          addPhoneNumberService,
          contentItemDialogService,
          personalizationLayoutService,
          renderingDetailsService,
          fieldsTrackerService,
          canvasPageStateManager,
          pageInteractionsGuardService,
        );
        contextService.provideTestValue({
          itemId: 'fakeitemid',
          language: 'fakelang',
          deviceLayoutId: 'fakedevicelayoutid',
          siteName: 'fakesite',
        });
        const urlSpy = spyObservable(sut.canvasUrl$);

        contextService.provideTestValue(
          {
            itemId: 'fakeitemid2',
            language: 'fakelang2',
            deviceLayoutId: 'fakedevicelayoutid2',
            siteName: 'fakesite',
          },
          { eventSource: 'CANVAS_BEACON' },
        );

        expect(urlSpy.next).toHaveBeenCalledTimes(1);
      });

      it('should re-emit the latest value from context', async () => {
        // arrange
        const urlSpy = spyObservable(sut.canvasUrl$);
        contextService.provideTestValue({
          itemId: 'fakeitemid-upd',
          language: 'fakelang',
          deviceLayoutId: 'fakedevicelayoutid',
          siteName: 'fakesite',
        });

        // act
        await sut.reloadCanvas();

        // assert
        const { canvasUrl } = urlSpy.next.calls.mostRecent().args[0];
        expect(canvasUrl.context.itemId).toBe('fakeitemid-upd');
      });

      it('should re-emit the latest value after page load', async () => {
        // arrange
        const urlSpy = spyObservable(sut.canvasUrl$);
        contextService.provideTestValue({
          itemId: 'fakeitemid-upd',
          language: 'fakelang',
          deviceLayoutId: 'fakedevicelayoutid',
          siteName: 'fakesite',
        });
        await testGeneralChannel.dispatchEvent('page:load', {
          fields: [],
          layout: PageLayout.stringifyLayoutDefinition({ devices: [] }),
          layoutDeviceId: 'layout-device-id',
          droppableRenderingIds: [],
          styles: {},
        });

        // act
        await sut.reloadCanvas();

        // assert
        const { canvasUrl } = urlSpy.next.calls.mostRecent().args[0];
        expect(canvasUrl.context.itemId).toBe('fakeitemid-upd');
      });
    });
  });

  describe('disposal', () => {
    it('should unsubscribe from events Editing Shell events', () => {
      sut.ngOnDestroy();

      expect(eventReceiverSpy.disconnect).toHaveBeenCalled();
    });

    it('should reset chrome selection', () => {
      testGeneralChannel.dispatchEvent('chrome:select', {
        chromeId: 'chrome_id_42',
        chromeType: 'placeholder',
        placeholderKey: 'placeholder-key',
        name: 'placeholder-key',
        displayName: 'placeholder-displayName',
        contextItem: { id: 'id', version: 42, language: 'lang' },
        allowedRenderingIds: [],
      });

      sut.ngOnDestroy();

      expect(canvasServices.chromeSelect).toEqual({ selection: undefined, eventSource: undefined });
    });
  });

  describe('loadingState', () => {
    it('should set loadingState to false when page is loaded', async () => {
      testGeneralChannel.dispatchEvent('page:load', {
        fields: [],
        layout: PageLayout.stringifyLayoutDefinition({ devices: [] }),
        layoutDeviceId: 'test-device-id',
        droppableRenderingIds: [],
        styles: {},
      });

      await nextTick();

      const latestNotifiedIsLoadingState = editorWorkspaceServiceSpy.setCanvasLoadState.calls.mostRecent().args[0];
      expect(latestNotifiedIsLoadingState).toEqual({ isLoading: false, itemId: 'foo', language: 'maorie' });
    });
  });

  describe('removeRendering()', () => {
    it('should show warning dialog if rendering to remove have AB-test variants', async () => {
      // Arrange
      const rules: Rule[] = [
        {
          uniqueId: '{00000000-0000-0000-0000-000000000000}',
          name: 'default',
          conditions: 'default',
          actions: [
            {
              uniqueId: '',
              id: '',
              dataSource: '',
            },
          ],
        },
      ];
      const layout = jasmine.createSpyObj<CanvasLayoutServices>({ getRenderingPersonalizationRules: rules });
      const impl = jasmine.createSpyObj<CanvasServicesImpl>({}, { layout });
      canvasServices.setCanvasServicesImpl(impl);

      // Act
      abTestComponentService.getAbTestsConfiguredOnPage.and.returnValue(Promise.resolve([mockComponentFlowDefinition]));
      await testGeneralChannel.dispatchEvent('chrome:remove', {
        chromeId: 'ch-1',
        chromeType: 'rendering',
        displayName: 'displayName',
        renderingDefinitionId: 'aab',
        renderingInstanceId: 'foo1bar2baz30000aaaabbbbcccc1234',
        contextItem: { id: '', language: '', version: 1 },
        inlineEditorProtocols: [],
        isPersonalized: false,
        appliedPersonalizationActions: [],
        compatibleRenderings: [],
        parentPlaceholderChromeInfo: {} as any,
      });

      await nextTick();

      testWarningDialogComponent = new TestWarningDialogComponent();
      spyOn(WarningDialogComponent, 'show').and.returnValue({ component: testWarningDialogComponent } as any);

      // Assert
      expect(testWarningDialogComponent.text).toEqual('Dialog text');
    });
  });
});
