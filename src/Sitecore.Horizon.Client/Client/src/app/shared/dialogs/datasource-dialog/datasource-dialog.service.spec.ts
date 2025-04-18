/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, tick } from '@angular/core/testing';
import { NgCommandManager } from '@sitecore/ng-page-composer';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { ContextService } from 'app/shared/client-state/context.service';
import { Item } from 'app/shared/graphql/item.interface';
import { Site, SiteService } from 'app/shared/site-language/site-language.service';
import { firstValueFrom, of } from 'rxjs';
import { DatasourceDialogCommands } from 'sdk';
import { DatasourceDialogComponent } from './datasource-dialog.component';
import { DatasourceDialogService, DatasourceRenderingDetails } from './datasource-dialog.service';
let ngCommandManagerSpy: jasmine.SpyObj<NgCommandManager<DatasourceDialogCommands>>;

describe('DatasourceDialogService', () => {
  let sut: DatasourceDialogService;

  const contextService = jasmine.createSpyObj<ContextService>(['getItem']);
  contextService.getItem.and.resolveTo({ path: 'path' } as Item);

  const sitesService = jasmine.createSpyObj<SiteService>(['getContextSite']);
  sitesService.getContextSite.and.returnValue({ properties: { isSxaSite: true } } as Site);

  beforeEach(() => {
    const dialogOverlayServiceSpy = jasmine.createSpyObj<DialogOverlayService>(['open']);
    ngCommandManagerSpy = jasmine.createSpyObj<NgCommandManager<DatasourceDialogCommands>>(['invoke', 'register']);
    ngCommandManagerSpy.invoke.and.callFake((_name, ctx) => Promise.resolve(ctx));
    sut = new DatasourceDialogService(dialogOverlayServiceSpy, ngCommandManagerSpy, contextService, sitesService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('show()', () => {
    it('should call open() of given service', fakeAsync(async () => {
      const spy = jasmine.createSpy().and.returnValue({
        component: {
          renderingId$: of('renderingId'),
          initialSelect$: of('initialSelect'),
          onSelect: of(''),
        },
      });
      sut = new DatasourceDialogService({ open: spy } as any, ngCommandManagerSpy, contextService, sitesService);

      sut.show({ renderingId: 'id', select: 'preselected/datasource', mode: 'ChangeDatasource' }).subscribe();
      tick();

      expect(spy).toHaveBeenCalledWith(DatasourceDialogComponent, jasmine.anything());
    }));

    it('should set `itemId$` of the component returned by the service.open()', fakeAsync(async () => {
      const componentObj = {
        renderingId$: of(''),
        initialSelect$: of('initialSelect'),
        onSelect: of(''),
      };

      sut = new DatasourceDialogService(
        { open: () => ({ component: componentObj }) } as any,
        ngCommandManagerSpy,
        contextService,
        sitesService,
      );

      sut.show({ renderingId: 'id1', select: 'preselected/datasource', mode: 'ChangeDatasource' }).subscribe();
      tick();

      const resultItemId = await firstValueFrom(componentObj.renderingId$);

      expect(resultItemId).toEqual('id1');
      flush();
    }));

    it('should set `initialSelect$` of the component returned by the service.open()', fakeAsync(async () => {
      const componentObj = {
        renderingId$: of(''),
        initialSelect$: of(''),
        onSelect: of(''),
      };

      sut = new DatasourceDialogService(
        { open: () => ({ component: componentObj }) } as any,
        ngCommandManagerSpy,
        contextService,
        sitesService,
      );

      sut.show({ renderingId: 'id1', select: 'preselected/datasource', mode: 'ChangeDatasource' }).subscribe();
      tick();

      const resultInitialSelect = await firstValueFrom(componentObj.initialSelect$);
      expect(resultInitialSelect).toEqual('preselected/datasource');
      flush();
    }));

    it('should set `datasourcePickerOptions` of the component returned by the service.open()', fakeAsync(async () => {
      const componentObj = {
        renderingId$: of(''),
        initialSelect$: of('initialSelect'),
        onSelect: of(''),
        datasourcePickerOptions: { compatibleTemplateIds: ['template1', 'template2'] },
      };

      sut = new DatasourceDialogService(
        { open: () => ({ component: componentObj }) } as any,
        ngCommandManagerSpy,
        contextService,
        sitesService,
      );

      sut
        .show(
          { renderingId: 'id1', select: 'preselected/datasource', mode: 'ChangeDatasource' },
          { compatibleTemplateIds: ['t1', 't2'] },
        )
        .subscribe();
      tick();

      const compatibleTemplateIds = componentObj.datasourcePickerOptions.compatibleTemplateIds;

      expect(compatibleTemplateIds).toEqual(['t1', 't2']);
      flush();
    }));

    it('should invoke the command via FEDUI CommandManager and pass custom parameters', fakeAsync(async () => {
      const componentObj = {
        renderingId$: of(''),
        initialSelect$: of(''),
        onSelect: of(''),
      };
      const renderingDetails: DatasourceRenderingDetails = {
        instanceId: 'instance1',
        parameters: { param1: 'value1' },
        placeholderKey: 'placeholderKey1',
      };

      sut = new DatasourceDialogService(
        { open: () => ({ component: componentObj }) } as any,
        ngCommandManagerSpy,
        contextService,
        sitesService,
      );

      sut
        .show(
          { renderingId: 'id1', select: 'preselected/datasource', renderingDetails, mode: 'ChangeDatasource' },
          {
            compatibleTemplateIds: ['t1', 't2'],
            customParameters: { par1: 'par1Value', par2: 'par2Value' },
          },
        )
        .subscribe();
      tick();

      expect(ngCommandManagerSpy.invoke).toHaveBeenCalledWith('pages:editor:datasource:dialog:show', {
        renderingId: 'id1',
        dataSource: 'preselected/datasource',
        renderingDetails,
        compatibleTemplateIds: ['t1', 't2'],
        pipelineArgs: {
          aborted: false,
          mode: 'ChangeDatasource',
          customParameters: { par1: 'par1Value', par2: 'par2Value' },
        },
      });
      flush();
    }));

    it('should overwrite comatibleTemplates with results from command manager hook', fakeAsync(async () => {
      const componentObj = {
        renderingId$: of(''),
        initialSelect$: of('initialSelect'),
        onSelect: of(''),
        datasourcePickerOptions: { compatibleTemplateIds: ['template1', 'template2'] },
      };
      ngCommandManagerSpy.invoke.and.returnValue(
        Promise.resolve({
          compatibleTemplateIds: ['t3', 't4'],
          renderingId: 'id1',
          dataSource: '',
          pipelineArgs: { aborted: false, mode: 'ChangeDatasource' },
        }),
      );

      sut = new DatasourceDialogService(
        { open: () => ({ component: componentObj }) } as any,
        ngCommandManagerSpy,
        contextService,
        sitesService,
      );

      sut
        .show(
          { renderingId: 'id1', select: 'preselected/datasource', mode: 'ChangeDatasource' },
          { compatibleTemplateIds: ['t1', 't2'] },
        )
        .subscribe();
      tick();

      const compatibleTemplateIds = componentObj.datasourcePickerOptions.compatibleTemplateIds;

      expect(compatibleTemplateIds).toEqual(['t3', 't4']);
      flush();
    }));
  });
});
