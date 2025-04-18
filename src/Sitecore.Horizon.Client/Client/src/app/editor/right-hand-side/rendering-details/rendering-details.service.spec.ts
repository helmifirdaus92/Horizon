/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { CanvasLayoutServices, CanvasServices } from 'app/editor/shared/canvas.services';
import { RenderingDefinition } from 'app/editor/shared/layout/page-layout';
import {
  CdpSiteDataService,
  cdpSiteData,
} from 'app/pages/left-hand-side/personalization/personalization-services/cdp-site-data.service';
import { PersonalizationLayoutService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { of } from 'rxjs';
import { RenderingDetailsUpdate } from 'sdk/contracts/rendering-properties.contract';
import { RenderingDetailsService } from './rendering-details.service';

describe('RenderingDetailsService', () => {
  let sut: RenderingDetailsService;
  let canvasServicesSpy: jasmine.SpyObj<CanvasServices>;
  let context: ContextServiceTesting;
  let personalizationServiceSpy: jasmine.SpyObj<PersonalizationService>;
  let personalizationLayoutServiceSpy: jasmine.SpyObj<PersonalizationLayoutService>;
  let canvasLayoutServicesSpy: jasmine.SpyObj<CanvasLayoutServices>;
  let configurationServiceSpy: jasmine.SpyObj<ConfigurationService>;
  let cdpSiteDataServiceSpy: jasmine.SpyObj<CdpSiteDataService>;

  beforeEach(() => {
    canvasLayoutServicesSpy = jasmine.createSpyObj('CanvasLayoutServices', ['getRendering', 'updateRenderings']);
    canvasServicesSpy = jasmine.createSpyObj('CanvasServices', {
      getCurrentLayout: canvasLayoutServicesSpy,
    });
    personalizationServiceSpy = jasmine.createSpyObj('PersonalizationService', [
      'getIsInPersonalizationMode',
      'isDefaultVariant',
    ]);
    personalizationLayoutServiceSpy = jasmine.createSpyObj('PersonalizationLayoutService', [
      'addSetRenderingParametersPersonalizationRule',
      'getPersonalizedRenderingInfo',
      'addRenderingDetailsPersonalizationRule',
    ]);
    configurationServiceSpy = jasmine.createSpyObj('ConfigurationService', ['isParametersPersonalizationEnabled']);
    configurationServiceSpy.isParametersPersonalizationEnabled.and.returnValue(true);

    cdpSiteDataServiceSpy = jasmine.createSpyObj('CdpSiteDataService', {
      watchCdpSiteData: of({
        hasPagePersonalization: () => false,
        hasPageWithAbTest: () => false,
        hasComponentAbTest: () => false,
      } as cdpSiteData),
    });

    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        RenderingDetailsService,
        { provide: CanvasServices, useValue: canvasServicesSpy },
        { provide: PersonalizationService, useValue: personalizationServiceSpy },
        { provide: PersonalizationLayoutService, useValue: personalizationLayoutServiceSpy },
        { provide: ConfigurationService, useValue: configurationServiceSpy },
        {
          provide: CdpSiteDataService,
          useValue: cdpSiteDataServiceSpy,
        },
      ],
    });

    sut = TestBed.inject(RenderingDetailsService);
  });

  beforeEach(() => {
    context = TestBed.inject(ContextServiceTesting);
  });

  describe('getRenderingDetails', () => {
    let rendering: RenderingDefinition;

    beforeEach(() => {
      const parameters = { param1: 'value1', param2: 'value2' };
      rendering = {
        instanceId: '123',
        id: '456',
        placeholderKey: 'placeholder1',
        dataSource: 'ds1',
        parameters,
      };
    });

    describe('when parameters personalization feature is not supported', () => {
      it('should return rendering details from canvas service', async () => {
        configurationServiceSpy.isParametersPersonalizationEnabled.and.returnValue(false);
        personalizationServiceSpy.isDefaultVariant.and.returnValue(false);
        canvasLayoutServicesSpy.getRendering.and.returnValue(rendering);

        const result = await sut.getRenderingDetails(rendering.instanceId);

        expect(result).toEqual({
          instanceId: rendering.instanceId,
          renderingId: rendering.id,
          placeholderKey: rendering.placeholderKey,
          dataSource: rendering.dataSource,
          parameters: rendering.parameters,
        });
      });
    });

    describe('when in default mode', () => {
      it('should return rendering details from canvas service when in default mode', async () => {
        canvasLayoutServicesSpy.getRendering.and.returnValue(rendering);
        personalizationServiceSpy.isDefaultVariant.and.returnValue(true);

        const result = await sut.getRenderingDetails(rendering.instanceId);

        expect(result).toEqual({
          instanceId: rendering.instanceId,
          renderingId: rendering.id,
          placeholderKey: rendering.placeholderKey,
          dataSource: rendering.dataSource,
          parameters: rendering.parameters,
        });
      });
    });

    describe('when in personalization mode', () => {
      beforeEach(() => {
        context.setTestVariant('123');
        canvasLayoutServicesSpy.getRendering.and.returnValue(rendering);
      });

      it('should enrich rendering with personalized datasource', async () => {
        cdpSiteDataServiceSpy.watchCdpSiteData.and.returnValue(
          of({ hasPagePersonalization: () => true, hasComponentAbTest: () => true } as any),
        );
        personalizationLayoutServiceSpy.getPersonalizedRenderingInfo.and.returnValue(
          Promise.resolve({ dataSource: 'ds2' }),
        );

        const result = await sut.getRenderingDetails(rendering.instanceId);

        expect(result).toEqual({
          instanceId: rendering.instanceId,
          renderingId: rendering.id,
          placeholderKey: rendering.placeholderKey,
          dataSource: 'ds2',
          parameters: rendering.parameters,
          personalizationVariantRenderingId: rendering.id,
        });
      });

      it('should enrich rendering with personalized rendering id', async () => {
        cdpSiteDataServiceSpy.watchCdpSiteData.and.returnValue(
          of({ hasPagePersonalization: () => true, hasComponentAbTest: () => true } as any),
        );
        personalizationLayoutServiceSpy.getPersonalizedRenderingInfo.and.returnValue(
          Promise.resolve({ renderingId: 'personalized-id1' }),
        );

        const result = await sut.getRenderingDetails(rendering.instanceId);

        expect(result).toEqual({
          instanceId: rendering.instanceId,
          renderingId: 'personalized-id1',
          placeholderKey: rendering.placeholderKey,
          dataSource: rendering.dataSource,
          parameters: rendering.parameters,
          personalizationVariantRenderingId: 'personalized-id1',
        });
      });

      it('should enrich rendering with personalized rendering parameters', async () => {
        cdpSiteDataServiceSpy.watchCdpSiteData.and.returnValue(
          of({ hasPagePersonalization: () => true, hasComponentAbTest: () => true } as any),
        );
        personalizationLayoutServiceSpy.getPersonalizedRenderingInfo.and.returnValue(
          Promise.resolve({ renderingParameters: { param1: 'value3' } }),
        );

        const result = await sut.getRenderingDetails(rendering.instanceId);

        expect(result).toEqual({
          instanceId: rendering.instanceId,
          renderingId: rendering.id,
          placeholderKey: rendering.placeholderKey,
          dataSource: rendering.dataSource,
          parameters: { param1: 'value3' },
          personalizationVariantRenderingId: rendering.id,
        });
      });

      it('should enrich rendering with personalized rendering parameters in a/b test mode', async () => {
        cdpSiteDataServiceSpy.watchCdpSiteData.and.returnValue(
          of({
            hasPagePersonalization: () => false,
            hasComponentAbTest: () => true,
          } as any),
        );
        personalizationLayoutServiceSpy.getPersonalizedRenderingInfo.and.returnValue(
          Promise.resolve({ renderingParameters: { param1: 'value3' } }),
        );

        const result = await sut.getRenderingDetails(rendering.instanceId);

        expect(result).toEqual({
          instanceId: rendering.instanceId,
          renderingId: rendering.id,
          placeholderKey: rendering.placeholderKey,
          dataSource: rendering.dataSource,
          parameters: { param1: 'value3' },
          personalizationVariantRenderingId: rendering.id,
        });
      });
    });
  });

  describe('setRenderingDetails', () => {
    describe('when parameters personalization feature is not supported', () => {
      beforeEach(() => {
        context.setTestVariant('variant001');
        configurationServiceSpy.isParametersPersonalizationEnabled.and.returnValue(false);
        cdpSiteDataServiceSpy.watchCdpSiteData.and.returnValue(
          of({ hasPagePersonalization: () => true, hasComponentAbTest: () => true } as any),
        );
      });

      it('should update rendering details in canvas', async () => {
        const options = { reloadRequired: true };
        const renderingInstanceId = '123';
        const details = {
          renderingId: 'rd23',
          placeholderKey: 'ph2',
          dataSource: 'ds3',
          parameters: { param1: 'value3' },
        };

        await sut.setRenderingDetails(renderingInstanceId, details, options);

        expect(canvasLayoutServicesSpy.updateRenderings).toHaveBeenCalledWith(
          [
            {
              renderingInstanceId,
              update: {
                id: details.renderingId,
                placeholderKey: details.placeholderKey,
                dataSource: details.dataSource,
                parameters: details.parameters,
              },
            },
          ],
          { reloadCanvas: true, skipHistory: false },
        );
      });
    });

    describe('when in default mode', () => {
      beforeEach(() => {
        context.setTestVariant(undefined);
      });

      it('should update rendering details in canvas', async () => {
        const options = { reloadRequired: true };
        const renderingInstanceId = '123';
        const details = {
          renderingId: 'rd23',
          placeholderKey: 'ph2',
          dataSource: 'ds3',
          parameters: { param1: 'value3' },
        };

        await sut.setRenderingDetails(renderingInstanceId, details, options);

        expect(canvasLayoutServicesSpy.updateRenderings).toHaveBeenCalledWith(
          [
            {
              renderingInstanceId,
              update: {
                id: details.renderingId,
                placeholderKey: details.placeholderKey,
                dataSource: details.dataSource,
                parameters: details.parameters,
              },
            },
          ],
          { reloadCanvas: true, skipHistory: false },
        );
      });
    });

    describe('when in personalization mode', () => {
      let rendering: RenderingDefinition;

      beforeEach(() => {
        const parameters = { param1: 'value1', param2: 'value2' };
        rendering = {
          instanceId: '123',
          id: '456',
          placeholderKey: 'placeholder1',
          dataSource: 'ds1',
          parameters,
        };

        context.setTestVariant('variant001');
        canvasLayoutServicesSpy.getRendering.and.returnValue(rendering);
        personalizationLayoutServiceSpy.getPersonalizedRenderingInfo.and.returnValue(
          Promise.resolve({
            dataSource: undefined,
            renderingId: undefined,
            renderingParameters: undefined,
          }),
        );
      });

      it('should not pass values for personalization when update matches the rendering in canvas', async () => {
        cdpSiteDataServiceSpy.watchCdpSiteData.and.returnValue(
          of({ hasPagePersonalization: () => true, hasComponentAbTest: () => true } as any),
        );
        const renderingInstanceId = '123';
        const details: RenderingDetailsUpdate = {
          renderingId: '456',
          dataSource: 'ds1',
          parameters: { param1: 'value1', param2: 'value2' },
        };
        const options = { reloadRequired: true };

        await sut.setRenderingDetails(renderingInstanceId, details, options);

        expect(personalizationLayoutServiceSpy.addRenderingDetailsPersonalizationRule).toHaveBeenCalledWith(
          renderingInstanceId,
          context.variant as string,
          {
            renderingId: undefined,
            dataSource: undefined,
            renderingParameters: undefined,
          },
          options.reloadRequired,
        );
      });

      it('should not pass values for personalization when update matches the rendering in personalization', async () => {
        cdpSiteDataServiceSpy.watchCdpSiteData.and.returnValue(
          of({ hasPagePersonalization: () => true, hasComponentAbTest: () => true } as any),
        );
        const renderingInstanceId = 'uid1';
        const details: RenderingDetailsUpdate = {
          renderingId: 'p-r1',
          dataSource: 'p-ds1',
          parameters: { foo: 'personalized-bar' },
        };
        const options = { reloadRequired: true };

        personalizationLayoutServiceSpy.getPersonalizedRenderingInfo.and.returnValue(
          Promise.resolve({
            renderingId: 'p-r1',
            dataSource: 'p-ds1',
            renderingParameters: { foo: 'personalized-bar' },
          }),
        );

        await sut.setRenderingDetails(renderingInstanceId, details, options);

        expect(personalizationLayoutServiceSpy.addRenderingDetailsPersonalizationRule).toHaveBeenCalledWith(
          renderingInstanceId,
          context.variant as string,
          {
            renderingId: undefined,
            dataSource: undefined,
            renderingParameters: undefined,
          },
          options.reloadRequired,
        );
      });

      it('should pass values for personalization when update differs from the rendering in canvas and personalization', async () => {
        cdpSiteDataServiceSpy.watchCdpSiteData.and.returnValue(
          of({ hasPagePersonalization: () => true, hasComponentAbTest: () => true } as any),
        );
        const renderingInstanceId = 'uid1';
        const details: RenderingDetailsUpdate = {
          renderingId: 'p-r1',
          dataSource: 'p-ds1',
          parameters: { foo: 'personalized-bar' },
        };
        const options = { reloadRequired: true };

        await sut.setRenderingDetails(renderingInstanceId, details, options);

        expect(personalizationLayoutServiceSpy.addRenderingDetailsPersonalizationRule).toHaveBeenCalledWith(
          renderingInstanceId,
          context.variant as string,
          {
            renderingId: 'p-r1',
            dataSource: 'p-ds1',
            renderingParameters: { foo: 'personalized-bar' },
          },
          options.reloadRequired,
        );
      });

      it('should pass values for personalization from the rendering in canvas and personalization when in a/b test mode', async () => {
        cdpSiteDataServiceSpy.watchCdpSiteData.and.returnValue(
          of({ hasPagePersonalization: () => true, hasComponentAbTest: () => true } as any),
        );
        const renderingInstanceId = 'uid1';
        const details: RenderingDetailsUpdate = {
          renderingId: 'p-r1',
          dataSource: 'p-ds1',
          parameters: { foo: 'personalized-bar' },
        };
        const options = { reloadRequired: true };

        await sut.setRenderingDetails(renderingInstanceId, details, options);

        expect(personalizationLayoutServiceSpy.addRenderingDetailsPersonalizationRule).toHaveBeenCalledWith(
          renderingInstanceId,
          context.variant as string,
          {
            renderingId: 'p-r1',
            dataSource: 'p-ds1',
            renderingParameters: { foo: 'personalized-bar' },
          },
          options.reloadRequired,
        );
      });
    });
  });
});
