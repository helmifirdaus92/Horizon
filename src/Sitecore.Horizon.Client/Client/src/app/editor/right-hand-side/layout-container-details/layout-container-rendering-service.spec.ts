/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { firstValueFrom } from 'rxjs';
import { RenderingDetails } from 'sdk';
import { RenderingDetailsService } from '../rendering-details/rendering-details.service';
import { LayoutContainerParametersParseService } from './layout-container-parameters-parse.service';
import { LayoutContainerModel, LayoutContainerRenderingService } from './layout-container-rendering-service';

describe('LayoutContainerRenderingService', () => {
  let service: LayoutContainerRenderingService;
  let mockRenderingDetailsService: jasmine.SpyObj<RenderingDetailsService>;
  let mockLayoutContainerParameterParser: jasmine.SpyObj<LayoutContainerParametersParseService>;
  let mockCanvasServices: jasmine.SpyObj<CanvasServices>;
  let mockMessagingService: jasmine.SpyObj<MessagingService>;
  const messagingEmitSpy = jasmine.createSpy();

  beforeEach(() => {
    mockRenderingDetailsService = jasmine.createSpyObj('RenderingDetailsService', [
      'getRenderingDetails',
      'setRenderingDetails',
    ]);
    mockLayoutContainerParameterParser = jasmine.createSpyObj('LayoutContainerParametersParseService', [
      'parseLayoutContainerModel',
      'serializeLayoutContainerParameters',
    ]);
    mockCanvasServices = jasmine.createSpyObj('CanvasServices', ['getCurrentLayout']);
    mockMessagingService = jasmine.createSpyObj('MessagingService', {
      getEditingCanvasChannel: { emit: messagingEmitSpy },
    } as any);

    TestBed.configureTestingModule({
      providers: [
        LayoutContainerRenderingService,
        { provide: RenderingDetailsService, useValue: mockRenderingDetailsService },
        { provide: LayoutContainerParametersParseService, useValue: mockLayoutContainerParameterParser },
        {
          provide: CanvasServices,
          useValue: mockCanvasServices,
        },
        {
          provide: MessagingService,
          useValue: mockMessagingService,
        },
      ],
    });

    service = TestBed.inject(LayoutContainerRenderingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize from rendering', async () => {
    const renderingDetails: RenderingDetails = {
      instanceId: 'testId',
      renderingId: 'testRenderingId',
      dataSource: 'testDataSource',
      placeholderKey: 'testPlaceholderKey',
      parameters: {},
    };
    mockRenderingDetailsService.getRenderingDetails.and.returnValue(Promise.resolve(renderingDetails));
    const exampleModel: LayoutContainerModel = {
      layoutTemplateKey: '1/2-1/2',
      columns: [],
      containerStyles: {
        gap: { value: 0, unit: 'px' },
        padding: { value: { top: 0, right: 0, bottom: 0, left: 0 }, unit: 'px' },
        width: { value: '100%', unit: 'px' },
      },
      stackBreakpoint: '',
    };
    mockLayoutContainerParameterParser.parseLayoutContainerModel.and.returnValue(exampleModel);

    await service.initFromRendering('testId');

    expect(mockRenderingDetailsService.getRenderingDetails).toHaveBeenCalledWith('testId');
    expect(mockLayoutContainerParameterParser.parseLayoutContainerModel).toHaveBeenCalledWith(
      renderingDetails.parameters,
    );

    const currentModel = await firstValueFrom(service.layoutContainerModel$);
    expect(currentModel).toEqual(exampleModel);
  });

  describe('update layout container', () => {
    let layoutContainerModel: LayoutContainerModel;
    let renderingDetails: RenderingDetails;

    beforeEach(async () => {
      layoutContainerModel = {
        layoutTemplateKey: '1/2-1/2',
        columns: [
          {
            direction: 'horizontal',
            position: 'top-left',
            size: 'basis-1/2',
            wrap: true,
          },
          {
            direction: 'vertical',
            position: 'top-right',
            size: 'basis-1/2',
            wrap: false,
          },
        ],
        containerStyles: {
          gap: { value: 10, unit: 'px' },
          padding: { value: { top: 10, right: 20, bottom: 30, left: 40 }, unit: 'px' },
          width: { value: '100%', unit: 'px' },
        },
        stackBreakpoint: '',
      };

      renderingDetails = {
        instanceId: 'testId',
        renderingId: 'testRenderingId',
        dataSource: 'testDataSource',
        placeholderKey: 'testPlaceholderKey',
        parameters: {
          defaultparam1: 'value1',
          defaultparam2: 'value2',
        },
      };
      mockRenderingDetailsService.getRenderingDetails.and.returnValue(Promise.resolve(renderingDetails));
      mockLayoutContainerParameterParser.parseLayoutContainerModel.and.returnValue(layoutContainerModel);
      await service.initFromRendering('testId');
    });

    it('should partially update container styles and save updated parameters', async () => {
      mockLayoutContainerParameterParser.serializeLayoutContainerParameters.and.returnValue({
        layoutParam1: 'layoutValue1',
        layoutParam2: 'layoutValue2',
      });

      await service.updateContainerStyles({ gap: { value: 100, unit: 'px' } });

      expect(mockLayoutContainerParameterParser.serializeLayoutContainerParameters).toHaveBeenCalledWith({
        ...layoutContainerModel,
        containerStyles: { ...layoutContainerModel.containerStyles, gap: { value: 100, unit: 'px' } },
      });

      const updatedParams = {
        defaultparam1: 'value1',
        defaultparam2: 'value2',
        layoutParam1: 'layoutValue1',
        layoutParam2: 'layoutValue2',
      };

      expect(messagingEmitSpy).toHaveBeenCalledWith(
        'layoutComponentStylesSetting:change',
        Object({
          containerInstanceId: 'testId',
          renderingParameters: updatedParams,
          containerType: 'containerStyles',
          columnIndex: undefined,
          breakPoint: undefined,
        }),
      );

      expect(mockRenderingDetailsService.setRenderingDetails).toHaveBeenCalledWith(
        'testId',
        {
          parameters: updatedParams,
        },
        {
          reloadRequired: false,
        },
      );

      const newModel = await firstValueFrom(service.layoutContainerModel$);
      expect(newModel.containerStyles.gap).toEqual({ value: 100, unit: 'px' });
    });

    it('should update a column layout and save updated parameters', async () => {
      mockLayoutContainerParameterParser.serializeLayoutContainerParameters.and.returnValue({
        cloumnLayout2: 'new-value',
      });

      await service.updateColumnLayout({ position: 'center-center' }, 1);

      expect(mockLayoutContainerParameterParser.serializeLayoutContainerParameters).toHaveBeenCalledWith({
        ...layoutContainerModel,
        columns: [layoutContainerModel.columns[0], { ...layoutContainerModel.columns[1], position: 'center-center' }],
      });

      const updatedParams = {
        defaultparam1: 'value1',
        defaultparam2: 'value2',
        cloumnLayout2: 'new-value',
      };

      expect(messagingEmitSpy).toHaveBeenCalledWith(
        'layoutComponentStylesSetting:change',
        Object({
          containerInstanceId: 'testId',
          renderingParameters: updatedParams,
          containerType: 'columnStyles',
          columnIndex: 1,
          breakPoint: undefined,
        }),
      );

      expect(mockRenderingDetailsService.setRenderingDetails).toHaveBeenCalledWith(
        'testId',
        {
          parameters: updatedParams,
        },
        {
          reloadRequired: false,
        },
      );

      const newModel = await firstValueFrom(service.layoutContainerModel$);
      expect(newModel.columns[1].position).toEqual('center-center');
    });

    it('should reset wrap when setting direction to vertical', async () => {
      mockLayoutContainerParameterParser.serializeLayoutContainerParameters.and.returnValue({
        cloumnLayout1: 'new-vertical-value',
      });

      await service.updateColumnLayout({ direction: 'vertical' }, 0);

      const newModel = await firstValueFrom(service.layoutContainerModel$);
      expect(newModel.columns[0].wrap).toEqual(false);
      expect(newModel.columns[0].direction).toEqual('vertical');
    });

    it('should change column sizes and save rendering parameters when updating a layout template', async () => {
      mockLayoutContainerParameterParser.serializeLayoutContainerParameters.and.returnValue({
        columnssizes: 'new-sizes',
      });

      await service.updateLayoutTemplate('1/3-2/3');

      expect(mockLayoutContainerParameterParser.serializeLayoutContainerParameters).toHaveBeenCalledWith({
        ...layoutContainerModel,
        columns: [
          { ...layoutContainerModel.columns[0], size: 'basis-1-3' },
          { ...layoutContainerModel.columns[1], size: 'basis-2-3' },
        ],
      });

      expect(mockRenderingDetailsService.setRenderingDetails).toHaveBeenCalledWith(
        'testId',
        {
          parameters: {
            defaultparam1: 'value1',
            defaultparam2: 'value2',
            columnssizes: 'new-sizes',
          },
        },
        {
          reloadRequired: true,
        },
      );

      const newModel = await firstValueFrom(service.layoutContainerModel$);
      expect(newModel.columns[0].size).toEqual('basis-1-3');
      expect(newModel.columns[1].size).toEqual('basis-2-3');
      expect(newModel.layoutTemplateKey).toEqual('1/3-2/3');
    });

    it('should generate new column sizes and update old ones when new template contains new columns', async () => {
      mockLayoutContainerParameterParser.serializeLayoutContainerParameters.and.returnValue({
        columnssizes: 'new-sizes',
      });

      await service.updateLayoutTemplate('1/3-1/3-1/3');

      const newModel = await firstValueFrom(service.layoutContainerModel$);
      expect(newModel.columns[0].size).toEqual('basis-1-3');
      expect(newModel.columns[1].size).toEqual('basis-1-3');
      expect(newModel.columns[2]).toEqual({
        direction: 'vertical',
        position: 'top-left',
        wrap: false,
        size: 'basis-1-3',
      });
    });

    it('should remove columns when new template contains less columns', async () => {
      mockLayoutContainerParameterParser.serializeLayoutContainerParameters.and.returnValue({
        columnssizes: 'new-sizes',
      });

      await service.updateLayoutTemplate('1/1');

      const newModel = await firstValueFrom(service.layoutContainerModel$);
      expect(newModel.columns.length).toEqual(1);
      expect(newModel.columns[0].size).toEqual('basis-full');
    });
  });
});
