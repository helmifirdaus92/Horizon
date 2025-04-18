/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { BYOC_RENDERING_ID } from 'app/editor/right-hand-side/feaas-rhs-region/feaas-extension-filter';
import { RenderingInitializationContext } from 'sdk';
import { FORM_WRAPPER_RENDERING_ID } from './form-wrapper-filter';
import { FormsEntity } from './forms-components.dal.service';
import { FormsComponentsService } from './forms-components.service';

describe(FormsComponentsService.name, () => {
  let sut: FormsComponentsService;
  let mockMessaging: Partial<NgGlobalMessaging>;
  let invokeCommandManagerCallback: (context: any) => Promise<RenderingInitializationContext>;

  const formsComponent: FormsEntity = {
    name: 'name1',
    id: 'id1',
    thumbnail: 'thumbnail1.png',
  } as FormsEntity;

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

    TestBed.configureTestingModule({
      providers: [{ provide: NgGlobalMessaging, useValue: mockMessaging }],
    });

    sut = TestBed.inject(FormsComponentsService);
  });

  afterEach(() => {
    delete window['FED_UI'];
  });

  it('should create the service', () => {
    expect(sut).toBeTruthy();
  });

  describe('renderingParametersHook', () => {
    it('should add form parameters to the rendering parameters for form wrapper component', async () => {
      sut.startInsertComponent(formsComponent);

      const mockRenderingContext = {
        renderingDetails: {
          renderingId: FORM_WRAPPER_RENDERING_ID,
          parameters: {},
        },
      };
      const result = await invokeCommandManagerCallback(mockRenderingContext);

      expect(result.renderingDetails.parameters.FormId).toBe(formsComponent.id);
    });
  });

  it('should add form parameters to the rendering parameters for BYOC rendering', async () => {
    sut.startInsertComponent(formsComponent);

    const mockRenderingContext = {
      renderingDetails: {
        renderingId: BYOC_RENDERING_ID,
        parameters: {},
      },
    };
    const result = await invokeCommandManagerCallback(mockRenderingContext);

    expect(result.renderingDetails.parameters.ComponentName).toBe(`SitecoreForm?formId=${formsComponent.id}`);
    expect(result.renderingDetails.parameters.ComponentLabel).toBe(formsComponent.name);
  });

  it('should not modify parameters if renderingId is not FORMS_WRAPPER_RENDERING_ID or BYOC_RENDERING_ID', async () => {
    sut.startInsertComponent(formsComponent);

    const mockRenderingContext = {
      renderingDetails: {
        renderingId: 'some-other-rendering-id',
        parameters: {},
      },
    };
    const result = await invokeCommandManagerCallback(mockRenderingContext);

    expect(result.renderingDetails.parameters.FormId).toBeUndefined();
    expect(result.renderingDetails.parameters.ComponentName).toBeUndefined();
    expect(result.renderingDetails.parameters.ComponentLabel).toBeUndefined();
  });
});
