/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import {
  TestMessagingP2PChannelFromChannel,
  makeTestMessagingP2PChannelFromDef,
} from '@sitecore/horizon-messaging/dist/testing';
import { RenderingPropertiesSdkMessagingService } from 'app/editor/right-hand-side/rendering-details/rendering-properties.sdk-messaging.service';
import { CanvasLayoutServices, CanvasServices } from 'app/editor/shared/canvas.services';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { CanvasChannel, CanvasChannelDef } from '../rendering-details/rendering-details.component';
import { RenderingDetailsService } from '../rendering-details/rendering-details.service';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { PlaceholderDetailsComponent } from './placeholder-details.component';
import { PlaceholderPropertiesSdkMessagingService } from './placeholder-properties.sdk-messaging.service';

describe(PlaceholderDetailsComponent.name, () => {
  let sut: PlaceholderDetailsComponent;
  let fixture: ComponentFixture<PlaceholderDetailsComponent>;
  let messaging: TestMessagingP2PChannelFromChannel<CanvasChannel>;
  let messagingRpc: jasmine.SpyObj<{
    canRemove(): Promise<boolean>;
    postInlineEditorMessage(msg: unknown): Promise<void>;
  }>;
  let setRpcServicesImplSpy: jasmine.Spy;
  let renderingPropertiesRegionMessagingService: jasmine.SpyObj<RenderingPropertiesSdkMessagingService>;
  let placeholderPropertiesSdkMessagingService: jasmine.SpyObj<PlaceholderPropertiesSdkMessagingService>;
  let rhsMessaging: jasmine.SpyObj<RhsEditorMessaging>;
  let canvasServices: jasmine.SpyObj<CanvasServices>;
  let canvasLayoutServices: jasmine.SpyObj<CanvasLayoutServices>;

  beforeEach(waitForAsync(() => {
    renderingPropertiesRegionMessagingService = jasmine.createSpyObj<RenderingPropertiesSdkMessagingService>(
      'Global messaging',
      ['setRpcImpl', 'resetRpcImpl', 'emitReconnectEvent'],
    );

    placeholderPropertiesSdkMessagingService = jasmine.createSpyObj<PlaceholderPropertiesSdkMessagingService>(
      'Global messaging',
      ['setRpcImpl', 'resetRpcImpl', 'emitReconnectEvent'],
    );

    const renderingDetailsService = jasmine.createSpyObj<RenderingDetailsService>('Rendering Details Service', [
      'getRenderingDetails',
      'setRenderingDetails',
    ]);

    TestBed.configureTestingModule({
      declarations: [PlaceholderDetailsComponent],
      imports: [TranslateModule, TranslateServiceStubModule, FormsModule, SitecoreExtensibilityModule],
      providers: [
        { provide: RenderingPropertiesSdkMessagingService, useValue: renderingPropertiesRegionMessagingService },
        { provide: PlaceholderPropertiesSdkMessagingService, useValue: placeholderPropertiesSdkMessagingService },
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
          provide: PersonalizationService,
          useValue: jasmine.createSpyObj<PersonalizationService>({
            getIsInPersonalizationMode: true,
          }),
        },
        {
          provide: RenderingDetailsService,
          useValue: renderingDetailsService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceholderDetailsComponent);
    sut = fixture.componentInstance;

    messagingRpc = jasmine.createSpyObj('rpc', ['canRemove', 'postInlineEditorMessage']);

    canvasServices = TestBedInjectSpy(CanvasServices);
    canvasLayoutServices = canvasServices.getCurrentLayout() as any;

    canvasLayoutServices.getRendering.and.returnValue({
      dataSource: null,
      instanceId: '',
      parameters: {},
      placeholderKey: '',
      id: '',
    });

    messaging = makeTestMessagingP2PChannelFromDef(CanvasChannelDef, messagingRpc);
    setRpcServicesImplSpy = spyOn(messaging, 'setRpcServicesImpl');

    sut.chrome = {
      chromeId: '-1',
      name: 'name1',
      chromeType: 'placeholder',
      placeholderKey: 'key1',
      displayName: 'placeholder1',
      contextItem: {
        id: 'ctx-item-id',
        language: 'ctx-item-lng',
        version: 22,
      },
      allowedRenderingIds: [],
      parentRenderingChromeInfo: {
        chromeId: 'parentChromeId',
        chromeType: 'rendering',
        displayName: 'displayName',
        renderingInstanceId: 'test-rendering-instance-id',
        renderingDefinitionId: 'test-rendering-id',
        contextItem: {
          id: 'ctx-item-id',
          language: 'ctx-item-lng',
          version: 22,
        },
        inlineEditorProtocols: ['dummy-protocol'],
        isPersonalized: false,
        appliedPersonalizationActions: [],
        compatibleRenderings: [],
        parentPlaceholderChromeInfo: {} as any,
      },
    };

    rhsMessaging = jasmine.createSpyObj<RhsEditorMessaging>('messaging', {
      getChannel: messaging as any,
      onReconnect: undefined,
      changeRemotePeer: undefined,
    });
    rhsMessaging.onReconnect.and.callFake((callback) => {
      callback();
    });
    sut.rhsMessaging = rhsMessaging;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(sut).toBeTruthy();
  });

  describe('right hand side messaging', () => {
    it('should set implementation for page composer messaging', () => {
      fixture.detectChanges();

      expect(renderingPropertiesRegionMessagingService.setRpcImpl).toHaveBeenCalledWith(
        jasmine.objectContaining({
          getInlineEditorProtocols: jasmine.any(Function),
          postInlineEditorMessage: jasmine.any(Function),
          getRenderingDetails: jasmine.any(Function),
          setRenderingDetails: jasmine.any(Function),
          getIsInPersonalizationMode: jasmine.any(Function),
        }),
      );
    });

    it('should set implementation for Horizon messaging', () => {
      fixture.detectChanges();

      expect(setRpcServicesImplSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          postPropertiesEditorMessage: jasmine.any(Function),
        }),
      );
    });

    it('should redirect canvas messaging to parent rendering', () => {
      fixture.detectChanges();

      expect(rhsMessaging.changeRemotePeer).toHaveBeenCalledWith(sut.chrome.parentRenderingChromeInfo!.chromeId);
    });

    it('should reset implementation on Destroy', () => {
      fixture.detectChanges();

      sut.ngOnDestroy();

      expect(renderingPropertiesRegionMessagingService.resetRpcImpl).toHaveBeenCalled();
      expect(placeholderPropertiesSdkMessagingService.resetRpcImpl).toHaveBeenCalled();
    });

    it('should temporary retrun false personalizationMode', () => {
      fixture.detectChanges();

      const { getIsInPersonalizationMode } =
        renderingPropertiesRegionMessagingService.setRpcImpl.calls.mostRecent().args[0];
      expect(getIsInPersonalizationMode()).toBe(false);
    });
  });

  describe('placeholder properties messaging', () => {
    it('should set implementation for placeholder properties messaging', () => {
      fixture.detectChanges();

      expect(placeholderPropertiesSdkMessagingService.setRpcImpl).toHaveBeenCalledWith(
        jasmine.objectContaining({
          getPlaceholderDetails: jasmine.any(Function),
        }),
      );
    });
  });
});
