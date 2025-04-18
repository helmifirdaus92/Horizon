/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { RpcServicesImplementation } from '@sitecore/horizon-messaging';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { MessagingEventsEmitterChannel } from '@sitecore/page-composer-sdk';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { CanvasLayoutServices, CanvasServices } from 'app/editor/shared/canvas.services';
import { FieldState } from 'app/editor/shared/history/field-state';
import { HistoryService } from 'app/editor/shared/history/history.service';
import { SaveResult } from 'app/editor/shared/save/save.interfaces';
import { SaveService } from 'app/editor/shared/save/save.service';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { GlobalMessagingTesting, GlobalMessagingTestingModule } from 'app/testing/global-messaging-testing';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { BehaviorSubject, NEVER, Observable, of, Subject } from 'rxjs';
import { EditingCanvasEvents, EditingShellContract, EditingShellEvents, SaveOptions, WorkspaceItemState } from 'sdk';
import { Context } from '../client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from '../client-state/context.service.testing';
import { ActiveDevice, DeviceService } from '../client-state/device.service';
import { ItemChange, ItemChangeService } from '../client-state/item-change-service';
import { ConfigurationService } from '../configuration/configuration.service';
import { StaticConfigurationService } from '../configuration/static-configuration.service';
import { Item } from '../graphql/item.interface';
import { EditingChannelDef } from '../messaging/horizon-canvas.contract.defs';
import {
  EditingCanvasRpcServices,
  EditingHorizonEvents,
  EditingHorizonRpcServices,
} from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging.service';
import { PipesModule } from '../pipes/pipes.module';
import { EditingShellHostService } from './editing-shell.host.service';

const INITIAL_CONTEXT: Context = {
  itemId: 'foo',
  itemVersion: 1,
  variant: undefined,
  language: 'en',
  siteName: 'test.com',
};

const layoutKind = 'FINAL';

describe(EditingShellHostService.name, () => {
  let sut: EditingShellHostService;
  let globalMessaging: GlobalMessagingTesting;
  let contextService: ContextServiceTesting;
  let eventEmitterFake: MessagingEventsEmitterChannel<EditingShellEvents>;
  let activeDevice$: BehaviorSubject<ActiveDevice>;
  let isPersonalizationMode$: Observable<boolean>;
  let historyServiceSpy: jasmine.SpyObj<HistoryService>;
  let itemChangeServiceSpy: jasmine.SpyObj<ItemChangeService>;
  let saveServiceSpy: jasmine.SpyObj<SaveService>;
  let personalizationServiceSpy: jasmine.SpyObj<PersonalizationService>;
  let canvasServices: jasmine.SpyObj<CanvasServices>;
  let canvasLayoutServices: jasmine.SpyObj<CanvasLayoutServices>;
  let editingTestChannel: TestMessagingP2PChannel<
    EditingCanvasEvents,
    EditingHorizonEvents,
    EditingCanvasRpcServices,
    EditingHorizonRpcServices
  >;
  let authenticationService: jasmine.SpyObj<AuthenticationService>;

  const canvasEditingChannelRpcSpy = jasmine.createSpyObj<RpcServicesImplementation<EditingCanvasRpcServices>>(
    'EditingChannelRpc',
    ['updatePageState', 'selectChrome', 'getChildRenderings', 'getChildPlaceholders'],
  );

  const staticConfigurationServiceMock: Partial<StaticConfigurationService> = {
    xMCloudSystemId: '123',
  };

  beforeEach(async () => {
    activeDevice$ = new BehaviorSubject<ActiveDevice>({
      id: 'desktop-small',
      name: 'Desktop small',
      width: 1024,
      isDefault: true,
    });
    isPersonalizationMode$ = new BehaviorSubject<boolean>(false).asObservable();

    editingTestChannel = makeTestMessagingP2PChannelFromDef(EditingChannelDef, canvasEditingChannelRpcSpy);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        PipesModule,
        ContextServiceTestingModule,
        GlobalMessagingTestingModule,
        StaticConfigurationServiceStubModule,
      ],
      providers: [
        EditingShellHostService,
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>({
            getEditingCanvasChannel: undefined,
            connectEditingShell: undefined,
          }),
        },
        {
          provide: SaveService,
          useValue: jasmine.createSpyObj<SaveService>(['updateWorkspaceItemState', 'savePage']),
        },
        {
          provide: DeviceService,
          useValue: {
            active$: activeDevice$,
          },
        },
        {
          provide: HistoryService,
          useValue: jasmine.createSpyObj<HistoryService>('HistoryService', [
            'clear',
            'setContext',
            'addState',
            'addFieldUpdate',
            'undo',
            'redo',
          ]),
        },
        {
          provide: ItemChangeService,
          useValue: jasmine.createSpyObj<ItemChangeService>({
            notifyChange: undefined,
            watchForChanges: NEVER,
          }),
        },
        {
          provide: StaticConfigurationService,
          useValue: staticConfigurationServiceMock,
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>(
            'ConfigurationService',
            {},
            {
              clientLanguage: 'lang-Lang',
            },
          ),
        },
        {
          provide: PersonalizationService,
          useValue: jasmine.createSpyObj<PersonalizationService>([
            'getIsInPersonalizationMode',
            'isPersonalizationMode$',
          ]),
        },
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>('MessagingService', ['getEditingCanvasChannel']),
        },
        {
          provide: CanvasServices,
          useValue: jasmine.createSpyObj<CanvasServices>({
            getCurrentLayout: jasmine.createSpyObj<CanvasLayoutServices>([
              'getRendering',
              'findRendering',
              'updateRenderings',
              'removeRendering',
            ]),
          }),
        },
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj<AuthenticationService>({
            getBearerToken: Promise.resolve('test-token'),
          }),
        },
      ],
    });

    ConfigurationService.xmCloudTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'test-org',
      url: 'http://test-platform-url',
      gqlEndpointUrl: 'https://test-platform-url/graph',
      cdpEmbeddedTenantId: '123',
      customerEnvironmentType: 'prd',
      environmentId: '321',
      environmentName: 'prodev',
      projectId: '12',
      projectName: 'proj',
    };

    const messaging = TestBedInjectSpy(MessagingService);
    messaging.getEditingCanvasChannel.and.returnValue(editingTestChannel);

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(INITIAL_CONTEXT);

    historyServiceSpy = TestBedInjectSpy(HistoryService);
    historyServiceSpy.clear.and.callThrough();
    historyServiceSpy.setContext.and.callThrough();
    itemChangeServiceSpy = TestBedInjectSpy(ItemChangeService);

    saveServiceSpy = TestBedInjectSpy(SaveService);
    authenticationService = TestBedInjectSpy(AuthenticationService);

    personalizationServiceSpy = TestBedInjectSpy(PersonalizationService);
    personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(false);
    (personalizationServiceSpy.isPersonalizationMode$ as Observable<boolean>) = isPersonalizationMode$;

    canvasServices = TestBedInjectSpy(CanvasServices);
    canvasLayoutServices = canvasServices.getCurrentLayout() as any;

    globalMessaging = TestBed.inject(GlobalMessagingTesting);
    eventEmitterFake = globalMessaging.createEventEmitter(EditingShellContract);
    spyOn(globalMessaging, 'createEventEmitter').and.returnValue(eventEmitterFake);

    spyOn(contextService, 'getItem').and.returnValue(
      Promise.resolve({
        id: INITIAL_CONTEXT.itemId,
        version: INITIAL_CONTEXT.itemVersion,
        layoutEditingKind: layoutKind,
      } as Item),
    );

    sut = TestBed.inject(EditingShellHostService);
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
  });

  it('should be create', () => {
    expect(sut).toBeTruthy();
  });

  describe('init', () => {
    it('should emit initial state', () => {
      const emit = spyOn(eventEmitterFake, 'emit');
      spyOn(globalMessaging, 'createRpc');

      sut.init();

      expect(emit).toHaveBeenCalledWith('device:change', jasmine.anything());
      expect(emit).toHaveBeenCalledWith('context:change', jasmine.anything());
      expect(emit).toHaveBeenCalledWith('isPersonalizationMode:change', jasmine.anything());
      expect(emit).toHaveBeenCalledTimes(3);
      expect(globalMessaging.createRpc).toHaveBeenCalled();
    });

    it('should provide getStaticConfiguration via messaging', async () => {
      sut.init();
      const rpc = await globalMessaging.getRpc(EditingShellContract);

      expect(await rpc.getStaticConfiguration()).toEqual({
        platformUrl: 'http://test-platform-url',
      });
    });

    it('should provide getLocalizationInfo via messaging', async () => {
      sut.init();
      const rpc = await globalMessaging.getRpc(EditingShellContract);

      expect(await rpc.getLocalizationInfo()).toEqual({
        clientLanguage: 'lang-Lang',
      });
    });
  });

  describe('Global messaging', () => {
    describe('getAuthenticationBearerToken', () => {
      it('should proxy getAuthenticationBearerToken call to bearerTokenService', async () => {
        sut.init();
        const rpc = await globalMessaging.getRpc(EditingShellContract);

        await rpc.getAuthenticationBearerToken();

        expect(authenticationService.getBearerToken).toHaveBeenCalled();
      });
    });
    describe('selectChrome', () => {
      it('should proxy selectChrome event to Canvas', async () => {
        sut.init();
        const rpc = await globalMessaging.getRpc(EditingShellContract);

        rpc.selectChrome('someId', 'placeholder');

        expect(editingTestChannel.getEmittedEvents('chrome:select')[0]).toEqual({
          id: 'someId',
          chromeType: 'placeholder',
        });
      });
    });

    describe('highlightChrome', () => {
      it('should proxy highlightChrome event to Canvas', async () => {
        sut.init();
        const rpc = await globalMessaging.getRpc(EditingShellContract);

        rpc.highlightChrome('someId', 'placeholder');

        expect(editingTestChannel.getEmittedEvents('chrome:highlight')[0]).toEqual({
          id: 'someId',
          chromeType: 'placeholder',
        });
      });
    });

    describe('getChildRenderings', () => {
      it('should proxy getChildRenderings call to Canvas', async () => {
        canvasEditingChannelRpcSpy.getChildRenderings.and.returnValue([]);
        sut.init();
        const rpc = await globalMessaging.getRpc(EditingShellContract);

        await rpc.getChildRenderings('renderingInstanceId001');

        expect(canvasEditingChannelRpcSpy.getChildRenderings).toHaveBeenCalledWith('renderingInstanceId001');
      });
    });

    describe('deleteRendering', () => {
      it('should proxy deleteRendering call to CanvasService', async () => {
        sut.init();
        const rpc = await globalMessaging.getRpc(EditingShellContract);

        const saveOptions: SaveOptions = { skipHistory: true, updateCanvas: true };
        await rpc.deleteRendering('renderingInstanceId001', saveOptions);

        expect(canvasLayoutServices.removeRendering).toHaveBeenCalledWith(
          'renderingInstanceId001',
          saveOptions.skipHistory,
          saveOptions.updateCanvas,
        );
      });
    });

    describe('notifyKnownWorkspaceItemState', () => {
      it('should send context item workspace state to save service', async () => {
        canvasEditingChannelRpcSpy.getChildRenderings.and.returnValue([]);
        sut.init();
        const rpc = await globalMessaging.getRpc(EditingShellContract);
        const expectedRevision = 'correctRevision';
        const testState: WorkspaceItemState = {
          itemId: INITIAL_CONTEXT.itemId,
          language: INITIAL_CONTEXT.language,
          revision: expectedRevision,

          fields: [
            {
              fieldId: 'field001',
              itemId: INITIAL_CONTEXT.itemId,
              revision: 'revisions001',
              value: { rawValue: 'value001' },
              itemVersion: 1,
              reset: false,
            },
          ],
          layout: '',
        };

        await rpc.notifyKnownWorkspaceItemState(testState, INITIAL_CONTEXT);

        expect(saveServiceSpy.updateWorkspaceItemState.calls.mostRecent().args[0]).toEqual(testState);
      });
    });
  });

  describe('history', () => {
    describe('WHEN item changes', () => {
      it('should set history context', () => {
        expect(historyServiceSpy.setContext).toHaveBeenCalledOnceWith(
          INITIAL_CONTEXT.itemId,
          INITIAL_CONTEXT.itemVersion!,
          INITIAL_CONTEXT.variant,
          INITIAL_CONTEXT.language,
        );
      });
    });

    describe('IF previous context was a Personalized page', () => {
      it('should clear history', () => {
        // Arrange: Personalized page
        personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(true);
        // Act
        contextService.setTestVariant('variant A');

        // Arrange: Not personalized page
        personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(false);
        // Act
        contextService.setTestVariant(undefined);

        expect(historyServiceSpy.clear.calls.mostRecent().args).toEqual([
          INITIAL_CONTEXT.itemId,
          INITIAL_CONTEXT.itemVersion!,
          INITIAL_CONTEXT.language,
        ]);
        expect(historyServiceSpy.setContext.calls.mostRecent().args).toEqual([
          INITIAL_CONTEXT.itemId,
          INITIAL_CONTEXT.itemVersion,
          undefined,
          INITIAL_CONTEXT.language,
        ]);
      });
    });

    describe('IF current context is a Personalized page', () => {
      it('should clear history', () => {
        personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(true);
        contextService.setTestVariant('variant A');

        expect(historyServiceSpy.clear).toHaveBeenCalledOnceWith(
          INITIAL_CONTEXT.itemId,
          INITIAL_CONTEXT.itemVersion!,
          INITIAL_CONTEXT.language,
        );
        expect(historyServiceSpy.setContext.calls.mostRecent().args).toEqual([
          INITIAL_CONTEXT.itemId,
          INITIAL_CONTEXT.itemVersion,
          'variant A',
          INITIAL_CONTEXT.language,
        ]);
      });
    });
  });

  describe('item change service messaging', () => {
    it('should emit sdk messaging events', () => {
      const notifications$ = new Subject<ItemChange>();
      itemChangeServiceSpy.watchForChanges.and.returnValue(notifications$);
      const itemModifySpy = jasmine.createSpy();
      globalMessaging.getEventReceiver(EditingShellContract).on('item:modify', itemModifySpy);
      sut.init();

      notifications$.next({ itemId: 'item1', scopes: ['name'] });
      notifications$.next({ itemId: 'item2', scopes: ['data-fields', 'workflow'] });

      expect(itemModifySpy).toHaveBeenCalledWith({ itemId: 'item1', scopes: ['name'] });
      expect(itemModifySpy).toHaveBeenCalledWith({ itemId: 'item2', scopes: ['data-fields', 'workflow'] });
    });

    it('should update service on RPC call', async () => {
      sut.init();
      const rpc = await globalMessaging.getRpc(EditingShellContract);

      await rpc.notifyItemModified({ itemId: 'item1', scopes: ['name', 'display-name'] });

      expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalledWith('item1', ['name', 'display-name']);
    });

    it('should normalize incoming ID values', async () => {
      sut.init();
      const rpc = await globalMessaging.getRpc(EditingShellContract);

      await rpc.notifyItemModified({ itemId: '{CD7C2A36-2E83-4146-B966-18EFA403AD23}', scopes: [] });

      expect(itemChangeServiceSpy.notifyChange).toHaveBeenCalledWith(
        'cd7c2a36-2e83-4146-b966-18efa403ad23',
        jasmine.anything(),
      );
    });
  });

  describe('given PageStateUpdate defined', () => {
    it('undo', async () => {
      const state = {
        fields: new Array<FieldState>(),
      };
      historyServiceSpy.undo.and.returnValue(state);
      const syncEmit = spyOn(eventEmitterFake, 'syncEmit');

      await sut.undo();

      expect(syncEmit).toHaveBeenCalledWith('workspaceItem:state:change', state);
    });

    it('redo', async () => {
      const state = {
        fields: new Array<FieldState>(),
      };
      historyServiceSpy.redo.and.returnValue(state);
      const syncEmit = spyOn(eventEmitterFake, 'syncEmit');

      await sut.redo();

      expect(syncEmit).toHaveBeenCalledWith('workspaceItem:state:change', state);
    });

    describe('savePage', () => {
      it('should fetch layout kind from item details and pass it to save', async () => {
        sut.init();
        const rpc = await globalMessaging.getRpc(EditingShellContract);
        const saveOpResult: SaveResult = {
          errors: [],
          savedItems: [
            {
              fields: [{ id: 'id', originalValue: '', value: 'value', reset: false }],
              id: '124',
              language: 'en',
              revision: '1',
              version: 1,
            },
          ],
          validationErrors: [],
          warnings: [],
          newCreatedVersions: [{ itemId: 'test-item-1', displayName: 'foo', versionNumber: 2 }],
        };
        saveServiceSpy.savePage.and.returnValue(of(saveOpResult));

        const fieldStateA = new FieldState('fieldIdA', 'itemA', { rawValue: 'valueA' }, false, 1);

        await rpc.save({ fields: [fieldStateA], layout: 'abc' }, INITIAL_CONTEXT, false);

        expect(contextService.getItem).toHaveBeenCalled();
        expect(saveServiceSpy.savePage).toHaveBeenCalledWith(jasmine.anything(), jasmine.anything(), layoutKind);
      });
    });
  });
});
