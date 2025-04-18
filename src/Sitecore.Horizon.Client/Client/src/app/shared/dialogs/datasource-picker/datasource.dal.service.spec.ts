/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { ItemInsertOption } from 'app/shared/graphql/item.interface';
import { createGqlError, createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { of } from 'rxjs';
import {
  CreateRawItemResult,
  DatasourceDalService,
  RawItem,
  RawItemAncestor,
  RenderingDefinition,
  ResolvedDataSource,
} from './datasource.dal.service';

const queries = require('graphql-tag/loader!./datasource.graphql');

function mostRecentCallFirstArg(spy: jasmine.Spy) {
  return spy.calls.mostRecent().args[0];
}

describe('DataSourceDalService', () => {
  let sut: DatasourceDalService;
  let controller: ApolloTestingController;
  let configurationService: jasmine.SpyObj<ConfigurationService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule, ApolloTestingModule],
      providers: [
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>('ConfigurationService', [
            'isRenderingDefinitionIncludesBranchTemplate',
          ]),
        },
        DatasourceDalService,
      ],
    });

    configurationService = TestBedInjectSpy(ConfigurationService);
    configurationService.isRenderingDefinitionIncludesBranchTemplate.and.returnValue(false);

    sut = TestBed.inject(DatasourceDalService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be provided', () => {
    expect(sut).toBeTruthy();
  });

  describe('getRenderingDefinition()', () => {
    const path = 'path';
    const contextItemId = 'item';
    const language = 'danish rocks';
    const site = 'yyy.www.zzz';

    it('should fetch the data through gql', fakeAsync(() => {
      const spy = createSpyObserver();
      sut.getRenderingDefinition(path, contextItemId, language, site).subscribe(spy);

      const op = controller.expectOne(queries['GetRenderingDefinition']);
      const vars = op.operation.variables;
      const result: RenderingDefinition = {
        datasourceRootItems: [{ id: '1' }],
        templates: [{ id: 'temp1', name: 'temp1', displayName: 'temp1', path: '' }],
      };

      op.flush({ data: { renderingDefinition: result } });
      tick();

      expect(vars).toEqual({ path, contextItemId, language, site });
      expect(spy.next).toHaveBeenCalledWith(result);
      expect(spy.complete).toHaveBeenCalled();
      expect(spy.error).not.toHaveBeenCalled();
      flush();
    }));

    describe('AND there are errors', () => {
      it('should fail the stream with the error code', fakeAsync(() => {
        const spy = createSpyObserver();
        sut.getRenderingDefinition(path, contextItemId, language, site).subscribe(spy);

        const code = '5001';
        const error = createGqlError('some error', code);

        const op = controller.expectOne(queries['GetRenderingDefinition']);
        op.flush({ errors: [error], data: {} });
        tick();

        expect(spy.error).toHaveBeenCalledWith(code);
        flush();
      }));
    });
  });

  describe('getChildren()', () => {
    const path = 'path';
    const language = 'danish rocks';
    const site = 'yyy.www.zzz';
    const baseTemplateIds = ['temp1'];

    const item: RawItem = {
      id: '1',
      displayName: 'my name is Forest',
      hasChildren: false,
      isFolder: false,
      template: { id: 'temp001', isCompatible: true, baseTemplateIds: ['baseT001'] },
    } as RawItem;

    it('should fetch the data through gql', fakeAsync(() => {
      const spy = createSpyObserver();
      sut.getChildren(path, language, site, baseTemplateIds).subscribe(spy);

      const op = controller.expectOne(queries['GetChildren']);
      const vars = op.operation.variables;

      op.flush({
        data: {
          rawItem: {
            id: 'someid',
            children: [item],
          },
        },
      });
      tick();

      expect(vars).toEqual({ path, language, site, baseTemplateIds });
      expect(spy.next).toHaveBeenCalledWith([item]);
      expect(spy.complete).toHaveBeenCalled();
      expect(spy.error).not.toHaveBeenCalled();
      flush();
    }));

    it('should support Observable `baseTemplateIds`', fakeAsync(() => {
      const spy = createSpyObserver();
      sut.getChildren(path, language, site, of(baseTemplateIds)).subscribe(spy);

      const op = controller.expectOne(queries['GetChildren']);
      const vars = op.operation.variables;

      op.flush({ data: { rawItem: { id: 'someid', children: [item] } } });
      tick();

      expect(vars).toEqual({ path, language, site, baseTemplateIds });
      expect(spy.next).toHaveBeenCalledWith([item]);
      expect(spy.complete).toHaveBeenCalled();
      expect(spy.error).not.toHaveBeenCalled();
      flush();
    }));

    describe('AND there are errors', () => {
      it('should fail the stream with the error code', fakeAsync(() => {
        const spy = createSpyObserver();
        sut.getChildren(path, language, site, baseTemplateIds).subscribe(spy);

        const code = '5001';
        const error = createGqlError('some error', code);

        const op = controller.expectOne(queries['GetChildren']);
        op.flush({ errors: [error], data: {} });
        tick();

        expect(spy.error).toHaveBeenCalledWith(code);
        flush();
      }));
    });
  });

  describe('getAncestorsWithSiblings()', () => {
    const path = 'path';
    const language = 'danish rocks';
    const site = 'yyy.www.zzz';
    const baseTemplateIds = ['temp1'];
    const roots = ['root1'];

    const item: RawItemAncestor = {
      id: '1',
      path: 'path1',
      displayName: 'my name is Forest',
      hasChildren: false,
      isFolder: false,
      template: { id: 'temp1', isCompatible: true, baseTemplateIds: [] },
      parentId: '',
      children: undefined,
    };

    it('should fetch the data through gql', fakeAsync(() => {
      const spy = createSpyObserver();
      sut.getAncestorsWithSiblings(path, language, site, baseTemplateIds, roots).subscribe(spy);

      const op = controller.expectOne(queries['GetAncestorsWithSiblings']);
      const vars = op.operation.variables;

      op.flush({ data: { rawItem: { id: 'someid', ancestorsWithSiblings: [item] } } });
      tick();

      const result: RawItemAncestor = mostRecentCallFirstArg(spy.next)[0];
      // make sure that children is present so that equal matcher succeeds (undefined vs not present fails)
      expect({ ...result, children: result.children }).toEqual(item);

      expect(vars).toEqual({ path, language, site, baseTemplateIds, roots });
      expect(spy.complete).toHaveBeenCalled();
      expect(spy.error).not.toHaveBeenCalled();
      flush();
    }));

    describe('AND there are errors', () => {
      it('should fail the stream with the error code', fakeAsync(() => {
        const spy = createSpyObserver();
        sut.getAncestorsWithSiblings(path, language, site, baseTemplateIds).subscribe(spy);

        const code = '5001';
        const error = createGqlError('some error', code);

        const op = controller.expectOne(queries['GetAncestorsWithSiblings']);
        op.flush({ errors: [error], data: {} });
        tick();

        expect(spy.error).toHaveBeenCalledWith(code);
        flush();
      }));
    });
  });

  describe('resolveDatasource()', () => {
    const source = 'path';
    const contextItemId = 'item';
    const language = 'en';
    const site = 'website';

    it('should fetch the data through graphql', fakeAsync(() => {
      const spy = createSpyObserver();
      sut.resolveDatasource(source, contextItemId, language, site).subscribe(spy);

      const op = controller.expectOne(queries['ResolveDataSource']);
      const vars = op.operation.variables;
      const result: ResolvedDataSource = { id: '1' };

      op.flush({ data: { resolveDataSource: result } });
      tick();

      expect(vars).toEqual({ source, contextItemId, language, site });
      expect(spy.next).toHaveBeenCalledWith(result);
      expect(spy.complete).toHaveBeenCalled();
      expect(spy.error).not.toHaveBeenCalled();
      flush();
    }));

    describe('AND there are errors', () => {
      it('should fail the stream with the error code', fakeAsync(() => {
        const spy = createSpyObserver();
        sut.resolveDatasource(source, contextItemId, language, site).subscribe(spy);

        const code = '5001';
        const error = createGqlError('some error', code);

        const op = controller.expectOne(queries['ResolveDataSource']);
        op.flush({ errors: [error], data: {} });
        tick();

        expect(spy.error).toHaveBeenCalledWith(code);
        flush();
      }));
    });
  });

  describe('getInsertOptions()', () => {
    const itemId = 'id';
    const language = 'en';
    const site = 'website';

    it('should fetch the data through graphql', fakeAsync(() => {
      const spy = createSpyObserver();
      sut.getInsertOptions(itemId, language, site).subscribe(spy);

      const op = controller.expectOne(queries['GetInsertOptions']);
      const vars = op.operation.variables;
      const result: ItemInsertOption[] = [
        { displayName: 'foo', id: 'foo' },
        { displayName: 'bar', id: 'bar' },
      ];

      op.flush({
        data: {
          item: {
            id: itemId,
            insertOptions: result,
          },
        },
      });
      tick();

      expect(vars).toEqual({ itemId, kind: 'ITEM', language, site });
      expect(spy.next).toHaveBeenCalledWith(result);
      expect(spy.complete).toHaveBeenCalled();
      expect(spy.error).not.toHaveBeenCalled();
      flush();
    }));

    describe('when there are errors', () => {
      it('should fail the stream with the error code', fakeAsync(() => {
        const spy = createSpyObserver();
        sut.getInsertOptions(itemId, language, site).subscribe(spy);

        const code = '5001';
        const error = createGqlError('some error', code);

        const op = controller.expectOne(queries['GetInsertOptions']);

        op.flush({ errors: [error], data: {} });
        tick();

        expect(spy.error).toHaveBeenCalledWith(code);
        flush();
      }));
    });
  });

  describe('createRawItem()', () => {
    const templateId = 'template id';
    const parentId = 'id';
    const itemName = 'name';
    const language = 'en';
    const site = 'website';

    it('should fetch the data through graphql', fakeAsync(() => {
      const spy = createSpyObserver();
      sut.createRawItem(language, site, parentId, itemName, templateId).subscribe(spy);

      const op = controller.expectOne(queries['CreateRawItem']);
      const vars = op.operation.variables.input;
      const result: CreateRawItemResult = {
        id: 'new item id',
        displayName: itemName,
        isFolder: false,
      };

      op.flush({
        data: {
          createRawItem: {
            rawItem: result,
            success: true,
          },
        },
      });
      tick();

      expect(vars).toEqual({ language, site, parentId, itemName, templateId });
      expect(spy.next).toHaveBeenCalledWith(result);
      expect(spy.complete).toHaveBeenCalled();
      expect(spy.error).not.toHaveBeenCalled();
      flush();
    }));

    describe('when there are errors', () => {
      it('should fail the stream with the error code', fakeAsync(() => {
        const spy = createSpyObserver();
        sut.createRawItem(language, site, parentId, itemName, templateId).subscribe(spy);

        const code = '5001';
        const error = createGqlError('some error', code);

        const op = controller.expectOne(queries['CreateRawItem']);
        op.flush({ errors: [error], data: {} });
        tick();

        expect(spy.error).toHaveBeenCalledWith(code);
        flush();
      }));
    });
  });
});
