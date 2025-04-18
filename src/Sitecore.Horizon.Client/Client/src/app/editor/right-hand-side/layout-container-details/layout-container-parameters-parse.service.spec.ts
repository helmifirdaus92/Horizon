/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { LayoutContainerParametersParseService } from './layout-container-parameters-parse.service';
import { LayoutContainerModel } from './layout-container-rendering-service';

describe('LayoutContainerParametersParseService', () => {
  let service: LayoutContainerParametersParseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutContainerParametersParseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('serializeLayoutContainerParameters', () => {
    let layoutContainerModel: LayoutContainerModel;

    beforeEach(() => {
      layoutContainerModel = {
        columns: [
          { direction: 'horizontal', position: 'top-left', size: 'basis-1-2', wrap: false },
          { direction: 'vertical', position: 'distributed-center', size: 'basis-1-4', wrap: false },
          { direction: 'horizontal', position: 'bottom-right', size: 'basis-1-4', wrap: true },
        ],
        containerStyles: {
          width: { value: '100%', unit: 'px' },
          gap: { value: 10, unit: 'px' },
          padding: { value: { top: 10, right: 20, bottom: 30, left: 40 }, unit: '' },
        },
        layoutTemplateKey: '1/2-1/4-1/4',
        stackBreakpoint: '',
      };
    });

    it('should serialize container styles into an inline styles string', () => {
      const result = service.serializeLayoutContainerParameters(layoutContainerModel);
      expect(result.ContainerStyles).toEqual('gap: 10px; width: 100%; padding: 10px 20px 30px 40px');
    });

    it('should serialize limited width into an a value in px', () => {
      layoutContainerModel.containerStyles.width = { value: 500, unit: 'px' };
      const result = service.serializeLayoutContainerParameters(layoutContainerModel);
      expect(result.ContainerStyles).toContain('gap: 10px; width: 500px; padding: 10px 20px 30px 40px');
    });

    it('should serialize column sizes into a record', () => {
      const result = service.serializeLayoutContainerParameters(layoutContainerModel);
      expect(result.EnabledColumns).toEqual('3');
      expect(result.ColumnSize1).toEqual('basis-1-2');
      expect(result.ColumnSize2).toEqual('basis-1-4');
      expect(result.ColumnSize3).toEqual('basis-1-4');
    });

    it('should serialize column layout into a column styles parameters', () => {
      const result = service.serializeLayoutContainerParameters(layoutContainerModel);
      expect(result.ColumnStyle1).toEqual('flex-row no-wrap justify-start items-start');
      expect(result.ColumnStyle2).toEqual('flex-col no-wrap justify-distributed items-center');
      expect(result.ColumnStyle3).toEqual('flex-row wrap justify-end items-end');
    });
  });

  describe('parseLayoutContainerModel', () => {
    let renderingParameters: Record<string, string>;

    beforeEach(() => {
      renderingParameters = {
        EnabledColumns: '3',
        ColumnSize1: 'basis-1-2',
        ColumnSize2: 'basis-1-4',
        ColumnSize3: 'basis-1-4',
        ColumnStyle1: 'flex-row no-wrap justify-start items-start',
        ColumnStyle2: 'flex-col no-wrap justify-distributed items-center',
        ColumnStyle3: 'flex-row wrap justify-end items-end',
        ContainerStyles: 'gap: 10px; width: 100%; padding: 10px 20px 30px 40px',
      };
    });

    it('should parse container styles', () => {
      const result = service.parseLayoutContainerModel(renderingParameters);
      expect(result.containerStyles).toEqual({
        width: { value: '100%', unit: '' },
        gap: { value: 10, unit: 'px' },
        padding: { value: { top: 10, right: 20, bottom: 30, left: 40 }, unit: 'px' },
      });
    });

    it('should parse invalid values in container styles to default values', () => {
      renderingParameters.ContainerStyles = 'gap: foo; width: bar; padding: baz';
      const result = service.parseLayoutContainerModel(renderingParameters);
      expect(result.containerStyles).toEqual({
        width: { value: '100%', unit: '' },
        gap: { value: 0, unit: 'px' },
        padding: { value: { top: 0, right: 0, bottom: 0, left: 0 }, unit: 'px' },
      });
    });

    it('should parse column sizes', () => {
      const result = service.parseLayoutContainerModel(renderingParameters);
      expect(result.columns).toEqual([
        jasmine.objectContaining({ size: 'basis-1-2' }),
        jasmine.objectContaining({ size: 'basis-1-4' }),
        jasmine.objectContaining({ size: 'basis-1-4' }),
      ]);
    });

    it('should have 0 columns when EnabledColumns is incorrect', () => {
      renderingParameters.EnabledColumns = 'foo';

      const result = service.parseLayoutContainerModel(renderingParameters);
      expect(result.columns.length).toEqual(0);
    });

    it('should identify layout template from columns', () => {
      const result = service.parseLayoutContainerModel(renderingParameters);
      expect(result.layoutTemplateKey).toEqual('1/2-1/4-1/4');
    });

    it('should return custom layout template when columns sizes do not match to any layout', () => {
      renderingParameters.ColumnSize1 = 'basis-1-5';
      const result = service.parseLayoutContainerModel(renderingParameters);
      expect(result.layoutTemplateKey).toEqual('custom');
    });

    it('should parse column styles', () => {
      const result = service.parseLayoutContainerModel(renderingParameters);
      expect(result.columns).toEqual([
        jasmine.objectContaining({ direction: 'horizontal', position: 'top-left', wrap: false }),
        jasmine.objectContaining({ direction: 'vertical', position: 'distributed-center', wrap: false }),
        jasmine.objectContaining({ direction: 'horizontal', position: 'bottom-right', wrap: true }),
      ]);
    });

    it('should parse an empty column style to a default layout', () => {
      renderingParameters.ColumnStyle1 = '';
      const result = service.parseLayoutContainerModel(renderingParameters);
      expect(result.columns[0]).toEqual(
        jasmine.objectContaining({ direction: 'vertical', position: 'top-left', wrap: false }),
      );
    });
  });
});
