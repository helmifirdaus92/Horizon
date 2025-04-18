/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import {
  makeTestMessagingP2PChannelFromDef,
  TestMessagingP2PChannelFromChannel,
} from '@sitecore/horizon-messaging/dist/testing';
import { NgCommandManager } from '@sitecore/ng-page-composer';
import { InfoButtonModule } from '@sitecore/ng-spd-lib';
import { ToggleButtonsComponent } from 'app/component-lib/toggle-buttons/toggle-buttons.component';
import { RenderingPropertiesSdkMessagingService } from 'app/editor/right-hand-side/rendering-details/rendering-properties.sdk-messaging.service';
import { CanvasLayoutServices, CanvasServices } from 'app/editor/shared/canvas.services';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { PersonalizationAPIService } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.service';
import { AbTestComponentService } from 'app/pages/left-hand-side/personalization/personalization-services/ab-test-component.service';
import { FlowDefinitionsService } from 'app/pages/left-hand-side/personalization/personalization-services/flow-definitions.service';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { PersonalizationModule } from 'app/pages/left-hand-side/personalization/personalization.module';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { DatasourceDialogService } from 'app/shared/dialogs/datasource-dialog/datasource-dialog.service';
import { WarningDialogModule } from 'app/shared/dialogs/warning-dialog/warning-dialog.module';
import { RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { RecreateOnChangeModule } from 'app/shared/utils/recreate-on-change/recreate-on-change.module';
import { getExplorerAppUrl } from 'app/shared/utils/utils';
import {
  StaticConfigurationServiceStub,
  StaticConfigurationServiceStubModule,
} from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { DatasourceDialogCommands } from 'sdk';
import { OptimizeContentPanelService } from '../optimize-content/optimize-content-panel/optimize-content-panel.service';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { CanvasChannel, CanvasChannelDef, RenderingDetailsComponent } from './rendering-details.component';
import { RenderingDetailsService } from './rendering-details.service';
import { RenderingFieldsService } from './rendering-fields.service';

@Component({
  selector: 'app-rendering-details-personalized',
  template: '',
})
class TestRenderingDetailsPersonalizedComponent {
  @Input() chrome!: RenderingChromeInfo;
  @Input() rhsMessaging!: RhsEditorMessaging;
  @Input() displayName!: string;
  @Input() isRenderingHidden!: boolean;
  @Input() dataSource$: any;
}

@Component({
  selector: 'app-test-component',
  template: '',
})
class TestComponentComponent {
  @Input() chrome!: RenderingChromeInfo;
}

describe(RenderingDetailsComponent.name, () => {
  let sut: RenderingDetailsComponent;
  let fixture: ComponentFixture<RenderingDetailsComponent>;
  let messaging: TestMessagingP2PChannelFromChannel<CanvasChannel>;
  let messagingRpc: jasmine.SpyObj<{
    canRemove(): Promise<boolean>;
    postInlineEditorMessage(msg: unknown): Promise<void>;
  }>;
  let setRpcServicesImplSpy: jasmine.Spy;
  let renderingPropertiesRegionMessagingServiceSpy: jasmine.SpyObj<RenderingPropertiesSdkMessagingService>;
  let rhsMessaging: jasmine.SpyObj<RhsEditorMessaging>;
  let canvasServices: jasmine.SpyObj<CanvasServices>;
  let canvasLayoutServices: jasmine.SpyObj<CanvasLayoutServices>;
  let datasourceDialogServiceSpy: jasmine.SpyObj<DatasourceDialogService>;
  let personalizationServiceSpy: jasmine.SpyObj<PersonalizationService>;
  let renderingFieldsServiceSpy: jasmine.SpyObj<RenderingFieldsService>;
  let staticConfigurationServiceStub: StaticConfigurationServiceStub;
  let contextService: ContextServiceTesting;

  const defaultRendering = () => {
    return {
      dataSource: null,
      instanceId: 'instanceId1',
      parameters: { param1: 'value1', param2: 'value2' },
      placeholderKey: '',
      id: '',
    };
  };

  const renderingWithDataSource = () => {
    return {
      dataSource: 'rid1-data-source',
      instanceId: 'instanceId2',
      parameters: { param1: 'value1', param2: 'value2' },
      placeholderKey: '',
      id: '',
    };
  };

  const Initial_Context = {
    itemId: 'itemId1',
    language: 'lang1',
    siteName: 'website1',
  };

  beforeEach(waitForAsync(() => {
    renderingPropertiesRegionMessagingServiceSpy = jasmine.createSpyObj<RenderingPropertiesSdkMessagingService>(
      'Global messaging',
      ['setRpcImpl', 'resetRpcImpl', 'emitReconnectEvent'],
    );
    datasourceDialogServiceSpy = jasmine.createSpyObj<DatasourceDialogService>('dialog', ['show']);

    TestBed.configureTestingModule({
      declarations: [RenderingDetailsComponent, TestRenderingDetailsPersonalizedComponent, TestComponentComponent],
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        FormsModule,
        SitecoreExtensibilityModule,
        AppLetModule,
        InfoButtonModule,
        PersonalizationModule,
        ContextServiceTestingModule,
        WarningDialogModule,
        PipesModule,
        StaticConfigurationServiceStubModule,
        RecreateOnChangeModule,
        ToggleButtonsComponent,
      ],
      providers: [
        { provide: RenderingPropertiesSdkMessagingService, useValue: renderingPropertiesRegionMessagingServiceSpy },
        {
          provide: CanvasServices,
          useValue: jasmine.createSpyObj<CanvasServices>({
            getCurrentLayout: jasmine.createSpyObj<CanvasLayoutServices>([
              'getRendering',
              'removeRendering',
              'getRenderingPersonalizationRules',
              'moveRenderingWithinSamePlaceholder',
            ]),
          }),
        },
        {
          provide: NgCommandManager,
          useValue: jasmine.createSpyObj<NgCommandManager<DatasourceDialogCommands>>({ invoke: undefined }),
        },

        {
          provide: DatasourceDialogService,
          useValue: datasourceDialogServiceSpy,
        },
        {
          provide: PersonalizationService,
          useValue: jasmine.createSpyObj<PersonalizationService>('PersonalizationService', [
            'getIsInPersonalizationMode',
            'isDefaultVariant',
          ]),
        },
        {
          provide: RenderingDetailsService,
          useValue: jasmine.createSpyObj<RenderingDetailsService>('RenderingDetailsService', [
            'getRenderingDetails',
            'setRenderingDetails',
          ]),
        },
        {
          provide: RenderingFieldsService,
          useValue: jasmine.createSpyObj<RenderingFieldsService>('RenderingFieldsService', [
            'fetchTextRenderingFields',
          ]),
        },
        {
          provide: PersonalizationAPIService,
          useValue: jasmine.createSpyObj<PersonalizationAPIService>('PersonalizationAPIService', [
            'createComponentFlowDefinition',
          ]),
        },
        {
          provide: FlowDefinitionsService,
          useValue: jasmine.createSpyObj<FlowDefinitionsService>('FlowDefinitionsService', ['getPageFlowDefinitions']),
        },
        {
          provide: AbTestComponentService,
          useValue: jasmine.createSpyObj<AbTestComponentService>('AbTestComponentService', [
            'getAbTestsConfiguredOnPage',
            'refetchFlows',
          ]),
        },
        {
          provide: OptimizeContentPanelService,
          useValue: jasmine.createSpyObj<OptimizeContentPanelService>('OptimizeContentPanelService', [
            'openPanel',
            'closePanel',
          ]),
        },
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj('MessagingService', {
            getEditingCanvasChannel: {},
          } as any),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenderingDetailsComponent);
    sut = fixture.componentInstance;

    messagingRpc = jasmine.createSpyObj('rpc', ['canRemove']);

    canvasServices = TestBedInjectSpy(CanvasServices);
    personalizationServiceSpy = TestBedInjectSpy(PersonalizationService);
    canvasLayoutServices = canvasServices.getCurrentLayout() as any;

    canvasLayoutServices.getRendering.and.returnValue(defaultRendering());

    messaging = makeTestMessagingP2PChannelFromDef(CanvasChannelDef, messagingRpc);
    setRpcServicesImplSpy = spyOn(messaging, 'setRpcServicesImpl');
    staticConfigurationServiceStub = TestBed.inject(StaticConfigurationServiceStub);
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(Initial_Context);

    renderingFieldsServiceSpy = TestBedInjectSpy(RenderingFieldsService);
    renderingFieldsServiceSpy.fetchTextRenderingFields.and.returnValue(Promise.resolve([]));

    sut.chrome = {
      chromeId: '-1',
      chromeType: 'rendering',
      displayName: 'displayName',
      renderingInstanceId: 'test-rendering-instance-id',
      renderingDefinitionId: 'test-rendering-id',
      contextItem: {
        id: 'ctx-item-id',
        language: 'ctx-item-lng',
        version: 22,
      },
      isPersonalized: false,
      appliedPersonalizationActions: [],
      inlineEditorProtocols: ['dummy-protocol'],
      compatibleRenderings: [],
      parentPlaceholderChromeInfo: {} as any,
    };

    rhsMessaging = jasmine.createSpyObj<RhsEditorMessaging>('messaging', {
      getChannel: messaging as any,
      onReconnect: undefined,
    });
    rhsMessaging.onReconnect.and.callFake((callback) => {
      callback();
    });
    sut.rhsMessaging = rhsMessaging;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('right hand side messaging', () => {
    it('should set implementation for page composer messaging', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(renderingPropertiesRegionMessagingServiceSpy.setRpcImpl).toHaveBeenCalledWith(
        jasmine.objectContaining({
          getInlineEditorProtocols: jasmine.any(Function),
          postInlineEditorMessage: jasmine.any(Function),
          getRenderingDetails: jasmine.any(Function),
          setRenderingDetails: jasmine.any(Function),
          getIsInPersonalizationMode: jasmine.any(Function),
        }),
      );
      flush();
    }));

    it('should provide implementation for getIsInPersonalizationMode', fakeAsync(() => {
      personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(false);
      fixture.detectChanges();
      tick();

      const { getIsInPersonalizationMode } =
        renderingPropertiesRegionMessagingServiceSpy.setRpcImpl.calls.mostRecent().args[0];
      expect(getIsInPersonalizationMode()).toBe(false);
      flush();
    }));

    it('should set implementation for Horizon messaging', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(setRpcServicesImplSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          postPropertiesEditorMessage: jasmine.any(Function),
        }),
      );
      flush();
    }));

    it('should reset implementation on Destroy', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      sut.ngOnDestroy();

      expect(renderingPropertiesRegionMessagingServiceSpy.resetRpcImpl).toHaveBeenCalled();
      flush();
    }));
  });

  describe('move rendering', () => {
    it('should move rendering WHEN messaging event fired', () => {
      fixture.detectChanges();
      messaging.dispatchEvent('sort:move' as never, 'up' as any);

      expect(canvasLayoutServices.moveRenderingWithinSamePlaceholder).toHaveBeenCalledOnceWith(
        'test-rendering-instance-id',
        'up',
      );
    });
  });

  describe('open rendering WHEN messaging event fired', () => {
    it('should open rendering in explorer if rendering has dataSource ', () => {
      const expectedDataSourcerURL = getExplorerAppUrl(
        'https://explorer-app-url.com/',
        'website1',
        'ctx-item-lng',
        'ctx-item-id',
        22,
      );

      const spy = spyOn(window, 'open');
      canvasLayoutServices.getRendering.and.returnValue(renderingWithDataSource());
      staticConfigurationServiceStub.explorerAppBaseUrl = 'https://explorer-app-url.com/';
      fixture.detectChanges();

      messaging.dispatchEvent('openItemInExplorer' as never);

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(expectedDataSourcerURL);
    });

    it('should open page in explorer if rendering does not have dataSource ', () => {
      const expectedPageURL = getExplorerAppUrl('https://explorer-app-url.com/', 'website1', 'lang1', 'itemid1', 22);

      const spy = spyOn(window, 'open');
      canvasLayoutServices.getRendering.and.returnValue(defaultRendering());
      staticConfigurationServiceStub.explorerAppBaseUrl = 'https://explorer-app-url.com/';
      fixture.detectChanges();

      messaging.dispatchEvent('openItemInExplorer' as never);

      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(expectedPageURL);
    });
  });

  describe('switch rendering details components', () => {
    it('should render rendering-details-personalized component WHEN in personalized mode', () => {
      personalizationServiceSpy.getIsInPersonalizationMode.and.returnValue(true);
      fixture.detectChanges();

      const prComponentInstance = fixture.debugElement.query(
        By.directive(TestRenderingDetailsPersonalizedComponent),
      ).componentInstance;

      expect(prComponentInstance).toBeDefined();
      expect(prComponentInstance.chrome).toEqual(sut.chrome);
      expect(prComponentInstance.rhsMessaging).toEqual(sut.rhsMessaging);
    });
  });
});
