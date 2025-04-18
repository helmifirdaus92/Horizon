/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import {
  BYOC_RENDERING_ID,
  FEAAS_RENDERING_ID,
} from 'app/editor/right-hand-side/feaas-rhs-region/feaas-extension-filter';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { of } from 'rxjs';
import { RenderingInitializationContext } from 'sdk/contracts/commands.contract';
import { DatasourcePickerRpc } from 'sdk/contracts/datasource-picker.contract';
import { FEaaSComponent, FEaaSExternalComponent } from './feaas-component-types';
import { FEaaSComponentsDalService } from './feaas-components.dal.service';
import { FEaaSComponentsService } from './feaas-components.service';

describe(FEaaSComponentsService.name, () => {
  let sut: FEaaSComponentsService;
  let mockMessaging: Partial<NgGlobalMessaging>;
  let mockDalService: Partial<FEaaSComponentsDalService>;
  let mockTimedNotificationService: Partial<TimedNotificationsService>;
  let mockTranslateService: Partial<TranslateService>;
  let mockDatasourcePickerRpc: DatasourcePickerRpc;
  let invokeCommandManagerCallback: (context: any) => Promise<RenderingInitializationContext>;

  const fEaaSComponent: FEaaSComponent = {
    name: 'name1',
    id: 'id1',
    dataSettings: 'componentDataSetting',
    published: true,
    isExternal: false,
    canUseXMDatasources: true,
  } as FEaaSComponent;

  const externalFEaaSComponent: FEaaSExternalComponent = {
    name: 'external',
    id: 'external_id',
    title: 'external_title',
    isExternal: true,
  } as FEaaSExternalComponent;

  beforeEach(() => {
    const mockCommandManager = {
      register: (_command: string, cb: () => Promise<RenderingInitializationContext>) => {
        invokeCommandManagerCallback = cb;
      },
    };

    window['FED_UI'] = {
      getCommandManager: () => {
        return mockCommandManager;
      },
    } as any;

    mockDatasourcePickerRpc = {
      prompt: () => Promise.resolve({ status: 'OK', datasource: 'datasource1' }) as any,
    };

    mockMessaging = {
      getRpc: jasmine.createSpy().and.returnValue(Promise.resolve(mockDatasourcePickerRpc)),
    };

    mockDalService = {
      componentsCollections$: of([]),
      configuration: Promise.resolve({ cdnHostName: 'example.com', frontEndUrl: 'https://abcd' }),
      utils: Promise.resolve({ getUniqueId: () => 'abcdefg' }),
    };

    mockTimedNotificationService = {
      push: jasmine.createSpy(),
    };

    mockTranslateService = {
      get: jasmine.createSpy().and.returnValue('Translated message'),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: NgGlobalMessaging, useValue: mockMessaging },
        { provide: FEaaSComponentsDalService, useValue: mockDalService },
        { provide: TimedNotificationsService, useValue: mockTimedNotificationService },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });

    sut = TestBed.inject(FEaaSComponentsService);
  });

  afterEach(() => {
    delete window['FED_UI'];
  });

  it('should create the service', () => {
    expect(sut).toBeTruthy();
  });

  describe('renderingParametersHook', () => {
    it('should add FEaaS parameters to the rendering parameters for FEaaS components', async () => {
      sut.startInsertComponent(fEaaSComponent);

      const mockRenderingContext = {
        renderingDetails: {
          renderingId: FEAAS_RENDERING_ID,
          parameters: {},
        },
      };
      const result = await invokeCommandManagerCallback(mockRenderingContext);

      expect(result.renderingDetails.parameters.ComponentId).toBe(fEaaSComponent.id);
      expect(result.renderingDetails.parameters.ComponentLabel).toBe(fEaaSComponent.name);
    });

    it('should add external FEaaS parameters to the rendering parameters for FEaaS external components', async () => {
      sut.startInsertComponent(externalFEaaSComponent);

      const mockRenderingContext = {
        renderingDetails: {
          renderingId: BYOC_RENDERING_ID,
          parameters: {},
        },
      };
      const result = await invokeCommandManagerCallback(mockRenderingContext);

      expect(result.renderingDetails.parameters.ComponentName).toBe(externalFEaaSComponent.id || '');
      expect(result.renderingDetails.parameters.ComponentLabel).toBe(externalFEaaSComponent.title || '');
    });

    it('should add datasource when datasource picker returned OK result', async () => {
      mockDatasourcePickerRpc.prompt = () => Promise.resolve({ status: 'OK', datasource: 'item001' }) as any;

      fEaaSComponent.datasourceIds = ['dataaource1'];
      sut.startInsertComponent(fEaaSComponent as any);

      const mockRenderingContext = {
        renderingDetails: {
          renderingId: FEAAS_RENDERING_ID,
          parameters: {},
        },
      };
      const result = await invokeCommandManagerCallback(mockRenderingContext);

      expect(result.renderingDetails.parameters.ComponentId).toBe(fEaaSComponent.id);
      expect(result.renderingDetails.dataSource).toBe('item001');
      expect(mockTimedNotificationService.push).not.toHaveBeenCalled();
    });

    it('should pass correct renderingDetails into the Datasource Picker', async () => {
      mockDatasourcePickerRpc.prompt = () => Promise.resolve({ status: 'OK', datasource: 'item001' }) as any;
      const mockDatasourcePickerRpcPromptSpy = spyOn(mockDatasourcePickerRpc, 'prompt').and.callThrough();

      fEaaSComponent.datasourceIds = ['dataaource1'];
      sut.startInsertComponent(fEaaSComponent as any);

      const mockRenderingContext = {
        renderingDetails: {
          renderingId: FEAAS_RENDERING_ID,
          parameters: {
            pramOne: 'Value',
          },
        },
      };
      await invokeCommandManagerCallback(mockRenderingContext);

      expect(mockDatasourcePickerRpcPromptSpy.calls.mostRecent().args[0].renderingDetails as any).toEqual({
        ComponentDataOverride: 'componentDataSetting',
        ComponentHTMLOverride: '',
        ComponentHostName: 'example.com',
        ComponentId: 'id1',
        ComponentInstanceId: 'abcdefg',
        ComponentLabel: 'name1',
        ComponentName: 'name1',
        ComponentRevision: 'staged',
        ComponentVersion: 'responsive',
        LibraryId: undefined,
        pramOne: 'Value',
      });
    });
  });
});
