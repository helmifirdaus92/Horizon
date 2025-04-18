/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContentTreeService } from 'app/pages/content-tree/content-tree.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { EditingMetadataChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  EditingMetadataCanvasRpcServices,
  EditingMetadataHorizonRpcServices,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { RenderingHostFeaturesService } from 'app/shared/rendering-host/rendering-host-features.service';
import { RenderingHostResolverService } from 'app/shared/rendering-host/rendering-host-resolver.service';
import { RenderingHostService } from 'app/shared/rendering-host/rendering-host.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, of } from 'rxjs';
import { LayoutSwitchService } from '../shared/site-language-switcher/site-language-dropdowns/layout-switch/layout-switch.service';
import { EditingMetadataCanvasService } from './editing-metadata-canvas.service';
import { EditingMetadataService, LayoutDataRequestContext } from './editing-metadata.service';

describe(EditingMetadataCanvasService.name, () => {
  let service: EditingMetadataCanvasService;
  let featureFlagsService: jasmine.SpyObj<FeatureFlagsService>;
  let layoutSwitchService: jasmine.SpyObj<LayoutSwitchService>;
  let messagingService: jasmine.SpyObj<MessagingService>;
  let rhFeatureService: jasmine.SpyObj<RenderingHostFeaturesService>;
  let editingMetadataService: jasmine.SpyObj<EditingMetadataService>;
  let contextService: jasmine.SpyObj<ContextService>;
  let contentTreeService: jasmine.SpyObj<ContentTreeService>;
  let renderingHostService: jasmine.SpyObj<RenderingHostService>;
  let editingMetadataChannel: TestMessagingP2PChannel<
    unknown,
    unknown,
    EditingMetadataCanvasRpcServices,
    EditingMetadataHorizonRpcServices
  >;

  beforeEach(() => {
    featureFlagsService = jasmine.createSpyObj('FeatureFlagsService', ['isFeatureEnabled']);
    messagingService = jasmine.createSpyObj('MessagingService', ['getEditinMetadataChannel']);
    rhFeatureService = jasmine.createSpyObj('RenderingHostFeaturesService', ['isFeatureEnabled']);
    editingMetadataService = jasmine.createSpyObj('EditingMetadataService', [
      'getEditingData',
      'loadAndCacheEditingData',
    ]);

    contextService = jasmine.createSpyObj('ContextService', {
      getItem: Promise.resolve({ route: '/routeFormContextService' } as any),
    });
    contentTreeService = jasmine.createSpyObj('ContentTreeService', ['getTreeItem']);

    editingMetadataChannel = makeTestMessagingP2PChannelFromDef(EditingMetadataChannelDef, {});
    messagingService.getEditinMetadataChannel.and.returnValue(editingMetadataChannel);

    layoutSwitchService = jasmine.createSpyObj('LayoutSwitchService', {
      getLayoutEditingKind: Promise.resolve('FINAL'),
    });

    TestBed.configureTestingModule({
      providers: [
        EditingMetadataCanvasService,
        { provide: FeatureFlagsService, useValue: featureFlagsService },
        { provide: MessagingService, useValue: messagingService },
        { provide: RenderingHostFeaturesService, useValue: rhFeatureService },
        { provide: EditingMetadataService, useValue: editingMetadataService },
        { provide: ContextService, useValue: contextService },
        {
          provide: RenderingHostResolverService,
          useValue: jasmine.createSpyObj('RenderingHostResolverService', ['isLocalRenderingHostSelected']),
        },
        {
          provide: RenderingHostService,
          useValue: jasmine.createSpyObj('RenderingHostService ', [
            'isShallowChromeMetadataEnabled',
            'isDirectIntegrationEnabled',
          ]),
        },
        { provide: ContentTreeService, useValue: contentTreeService },
        { provide: LayoutSwitchService, useValue: layoutSwitchService },
      ],
    });

    renderingHostService = TestBedInjectSpy(RenderingHostService);
    renderingHostService.isShallowChromeMetadataEnabled.and.returnValue(Promise.resolve(true));
    renderingHostService.isDirectIntegrationEnabled.and.returnValue(Promise.resolve(true));
    service = TestBed.inject(EditingMetadataCanvasService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should proxy RPC call to editing data service', async () => {
    const layoutDataRequestContext: LayoutDataRequestContext = {
      itemId: 'id1',
      language: 'en',
      siteName: 's1',
    };
    await editingMetadataChannel.registeredRpcServicesImpl?.getEditingMetadata(layoutDataRequestContext);

    expect(editingMetadataService.getEditingData).toHaveBeenCalledWith(layoutDataRequestContext);
  });

  it('should dispose messaging RPC on ngOnDestroy', () => {
    const layoutDataRequestContext: LayoutDataRequestContext = {
      itemId: 'id1',
      language: 'en',
      siteName: 's1',
    };

    service.ngOnDestroy();
    expect(() => {
      editingMetadataChannel.registeredRpcServicesImpl?.getEditingMetadata(layoutDataRequestContext);
    }).toThrowError();
  });

  it('should inject metadata into the canvas state and start pre-loading editing data  if the feature is enabled', async () => {
    const context = {
      itemId: 'id1',
      language: 'en',
      siteName: 's1',
    };
    contentTreeService.getTreeItem.and.returnValue({ item: { route: '/' } } as any);
    featureFlagsService.isFeatureEnabled.and.returnValue(true);
    rhFeatureService.isFeatureEnabled.and.returnValue(Promise.resolve(true));
    const canvasState$ = of({
      canvasUrl: {
        context: context,
      },
    });
    const result = await firstValueFrom(service.injectEditingMetadata(canvasState$));

    expect(result.metadataMode).toBeTrue();
    expect(editingMetadataService.loadAndCacheEditingData).toHaveBeenCalledWith(context);
  });

  it('should get route from the tree', async () => {
    const context = {
      itemId: 'id1',
      language: 'en',
      siteName: 's1',
    };
    const routeFromTree = '/routeFromTree';
    contentTreeService.getTreeItem.and.returnValue({ item: { route: routeFromTree } } as any);
    featureFlagsService.isFeatureEnabled.and.returnValue(true);
    rhFeatureService.isFeatureEnabled.and.returnValue(Promise.resolve(true));
    const canvasState$ = of({
      canvasUrl: {
        context: context,
      },
    });
    const result = await firstValueFrom(service.injectEditingMetadata(canvasState$));

    expect(result.route).toBe(routeFromTree);
  });

  it('should fetch route if tree is not yet fetched data to build tree', async () => {
    const context = {
      itemId: 'id1',
      language: 'en',
      siteName: 's1',
    };

    contentTreeService.getTreeItem.and.returnValue({ item: { route: undefined } } as any);
    featureFlagsService.isFeatureEnabled.and.returnValue(true);
    rhFeatureService.isFeatureEnabled.and.returnValue(Promise.resolve(true));
    const canvasState$ = of({
      canvasUrl: {
        context: context,
      },
    });
    const result = await firstValueFrom(service.injectEditingMetadata(canvasState$));

    expect(result.route).toBe('/routeFormContextService');
  });

  it('should set layoutKind if feature is enabled', async () => {
    const context = {
      itemId: 'id1',
      language: 'en',
      siteName: 's1',
    };

    contentTreeService.getTreeItem.and.returnValue({ item: { route: undefined } } as any);
    featureFlagsService.isFeatureEnabled.and.returnValue(true);
    rhFeatureService.isFeatureEnabled.and.returnValue(Promise.resolve(true));
    const canvasState$ = of({
      canvasUrl: {
        context: context,
      },
    });
    const result = await firstValueFrom(service.injectEditingMetadata(canvasState$));

    expect(result.layoutKind).toBe('FINAL');
  });
});
