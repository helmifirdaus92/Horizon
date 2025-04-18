/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { DEFAULT_TEST_CONTEXT } from '../client-state/context.service.testing';
import { XmCloudFeatureCheckerService } from '../xm-cloud/xm-cloud-feature-checker.service';
import { ItemDalService, ItemField, ItemFieldValidationResult } from './item.dal.service';
import { ItemInsertOption } from './item.interface';

const queries = require('graphql-tag/loader!./item.dal.service.graphql');
const siteId = '227bc0ff-6237-42b6-851f-49e68c1998e8';

describe(ItemDalService.name, () => {
  let sut: ItemDalService;
  let controller: ApolloTestingController;
  let xmCloudFeatureCheckerServiceSpy: jasmine.SpyObj<XmCloudFeatureCheckerService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule.withClients(['global'])],
      providers: [
        ItemDalService,
        {
          provide: XmCloudFeatureCheckerService,
          useValue: jasmine.createSpyObj('XmCloudFeatureCheckerService', ['isErrorSeveritySupported']),
        },
      ],
    });

    sut = TestBed.inject(ItemDalService);
    controller = TestBed.inject(ApolloTestingController);
    xmCloudFeatureCheckerServiceSpy = TestBedInjectSpy(XmCloudFeatureCheckerService);
  });

  afterEach(() => {
    controller.verify();
  });

  describe('getRawItem', () => {
    it('should query rawItem and emit the result', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const spy = jasmine.createSpy();

      sut.getRawItem(itemId, language, siteName).subscribe(spy);
      tick();

      const op = controller.expectOne(queries['GetRawItemByPath']);
      expect(op.operation.variables).toEqual({ path: itemId, language, site: siteName });

      const result = {
        id: itemId,
        displayName: 'aha!',
        name: 'also aha!',
        icon: 'spd-1',
        path: '/a/b',
        version: 1,
        language,
        createdBy: 'dev',
        creationDate: new Date(1990, 4).toString(),
        url: 'url',
        template: {
          id: '123',
          name: 'name',
          path: 'x/y',
        },
        workflow: {
          id: 'id',
          displayName: 'workflowname',
        },
      };

      op.flush({ data: { rawItem: result } });
      tick();

      expect(spy).toHaveBeenCalledWith(result);
      flush();
    }));
  });

  describe('getItemVersions', () => {
    it('should query item and its versions', fakeAsync(() => {
      const { itemId, language, siteName, itemVersion } = DEFAULT_TEST_CONTEXT;
      const itemVersionSpy = jasmine.createSpy();

      sut.getItemVersions(itemId, language, siteName, itemVersion).subscribe(itemVersionSpy);
      tick();

      const op = controller.expectOne(queries['GetItemVersions']);
      expect(op.operation.variables).toEqual({ path: itemId, language, site: siteName, version: itemVersion });

      const result = {
        id: itemId,
        versions: [
          {
            version: 1,
            versionName: '',
            updatedBy: 'user1',
            updatedDate: '2021-09-07T11:18:55Z',
            language: 'en',
            isLatestPublishableVersion: true,
          },
          {
            version: 2,
            versionName: '',
            updatedBy: 'user1',
            updatedDate: '2021-09-07T11:18:55Z',
            language: 'da',
            isLatestPublishableVersion: false,
          },
        ],
      };

      op.flush({ data: { item: result } });
      tick();

      expect(itemVersionSpy).toHaveBeenCalledWith(result);
      flush();
    }));
  });

  describe('getItemDisplayName', () => {
    it('should query the item display name and emit the result', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const spy = jasmine.createSpy();

      sut.getItemDisplayName(itemId, language, siteName).subscribe(spy);
      tick();

      const op = controller.expectOne(queries['GetRawItemDisplayName']);
      expect(op.operation.variables).toEqual({ path: itemId, language, site: siteName });

      const result = {
        id: itemId,
        displayName: 'aha!',
        __typename: 'Page',
      };

      op.flush({ data: { rawItem: result } });
      tick();

      expect(spy).toHaveBeenCalledWith(result.displayName);
      flush();
    }));
  });

  describe('getItemPath', () => {
    it('should query the item path and emit the result', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const spy = jasmine.createSpy();

      sut.getItemPath(itemId, language, siteName).subscribe(spy);
      tick();

      const op = controller.expectOne(queries['GetRawItemPath']);
      expect(op.operation.variables).toEqual({ path: itemId, language, site: siteName });

      const result = {
        id: itemId,
        path: 'aha!',
        __typename: 'Page',
      };

      op.flush({ data: { rawItem: result } });
      tick();

      expect(spy).toHaveBeenCalledWith(result.path);
      flush();
    }));
  });

  describe('getItemField', () => {
    it('should query the item field and emit the result', fakeAsync(() => {
      const { itemId, language, itemVersion } = DEFAULT_TEST_CONTEXT;
      const fieldId = '123';

      const mockResponse = {
        data: {
          item: {
            itemId: 'id001',
            version: 1,
            revision: { value: 'rev001' },
            language: {
              name: 'en',
            },
            access: {
              canRead: true,
              canWrite: true,
            },
            field: {
              value: 'value',
              containsStandardValue: true,
              access: {
                canRead: true,
                canWrite: true,
              },
              templateField: {
                section: {
                  name: 'sectionName',
                },
                templateFieldId: 'templateFieldId',
                name: 'text',
                type: 'Single-Line Text',
                dataSource: {
                  items: {
                    nodes: [{ displayName: 'ds1', itemId: 'id1', hasPresentation: true, hasChildren: true }],
                    pageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
                  },
                },
                versioning: 'SHARED',
              },
              validation: [],
            },
          },
        },
      };

      const expectedField: ItemField = {
        item: {
          id: 'id001',
          version: 1,
          revision: 'rev001',
          language: 'en',
          access: {
            canRead: true,
            canWrite: true,
          },
        },
        value: { rawValue: 'value' },
        containsStandardValue: true,
        access: {
          canRead: true,
          canWrite: true,
        },
        templateField: {
          sectionName: 'sectionName',
          templateFieldId: 'templateFieldId',
          name: 'text',
          type: 'Single-Line Text',
          dataSource: [{ displayName: 'ds1', itemId: 'id1', hasPresentation: true, hasChildren: true } as any],
          versioning: 'SHARED',
          dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        },
        validation: [],
      };
      const resultSpy = createSpyObserver();

      sut.fetchItemField(fieldId, itemId, language, itemVersion).subscribe(resultSpy);
      tick();

      const query = controller.expectOne(queries['GetItemField']);
      query.flush(mockResponse);
      tick();

      expect(query.operation.variables).toEqual({
        fieldId,
        itemId,
        language,
        version: itemVersion,
        dsStartCursor: undefined,
      });

      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual(expectedField);
      flush();
    }));
  });

  describe('getFieldDataSources', () => {
    it('should query the field datasources and emit the result', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const fieldId = '123';
      const spy = jasmine.createSpy();

      sut.getFieldDataSources(itemId, fieldId, language, siteName).subscribe(spy);
      tick();

      const op = controller.expectOne(queries['GetFieldDataSources']);
      expect(op.operation.variables).toEqual({ path: itemId, fieldId, language, site: siteName });

      const result = {
        id: itemId,
        template: {
          id: '123',
          field: {
            id: fieldId,
            sources: ['a', 'b'],
          },
        },
      };

      op.flush({ data: { item: result } });
      tick();

      expect(spy).toHaveBeenCalledWith(result.template.field.sources);
      flush();
    }));
  });

  describe('getItemInsertOptions', () => {
    it('should query the Item insert options and emit the result', fakeAsync(() => {
      const path = 'path';
      const kind = 'page';
      const language = 'language';
      const site = 'site';

      const insertOptions: ItemInsertOption[] = [
        { displayName: 'Option 1', id: '1' },
        { displayName: 'Option 2', id: '2' },
      ];
      const mockResponse = {
        data: {
          item: {
            id: 'item-id',
            insertOptions,
          },
        },
      };

      const resultSpy = createSpyObserver();

      sut.getItemInsertOptions(path, kind, language, site).subscribe(resultSpy);
      tick();

      const query = controller.expectOne(queries['GetItemInsertOptions']);
      query.flush(mockResponse);
      tick();

      expect(query.operation.variables).toEqual({
        path,
        kind: 'PAGE',
        language,
        site,
      });

      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual(insertOptions);
      flush();
    }));
  });

  describe('getItemType', () => {
    it('should query the item and emit the result', fakeAsync(() => {
      const { itemId, itemVersion, language, siteName } = DEFAULT_TEST_CONTEXT;
      const spy = jasmine.createSpy();

      sut.getItemType(itemId, language, siteName, siteId, itemVersion).subscribe(spy);
      tick();

      const op = controller.expectOne(queries['GetItemType']);
      expect(op.operation.variables).toEqual({ path: itemId, language, site: siteName, version: itemVersion });

      const result = {
        id: itemId,
        version: 1,
        template: {
          id: 'templateId001',
          baseTemplateIds: ['2bb25752-b3bc-4f13-b9cb-38b906d21a33', '77b1399f-5f30-4643-a054-59bbb1c7c62c'],
        },
        ancestors: [
          {
            template: {
              id: 'parentTemplateId',
            },
          },
        ],
        __typename: 'Page',
      };

      op.flush({ data: { item: result } });
      tick();

      expect(spy).toHaveBeenCalledWith({
        id: result.id,
        version: result.version,
        ancestors: result.ancestors,
        baseTemplateIds: ['2bb25752-b3bc-4f13-b9cb-38b906d21a33', '77b1399f-5f30-4643-a054-59bbb1c7c62c'],
        kind: result.__typename,
      });
      flush();
    }));

    it('should query the item without provided item version and emit the result', fakeAsync(() => {
      const { itemId, language, siteName } = DEFAULT_TEST_CONTEXT;
      const spy = jasmine.createSpy();

      sut.getItemType(itemId, language, siteName, siteId, undefined).subscribe(spy);
      tick();

      const op = controller.expectOne(queries['GetItemType']);
      expect(op.operation.variables).toEqual({ path: itemId, language, site: siteName, version: undefined });

      const result = {
        id: itemId,
        version: 1,
        template: {
          id: 'templateId001',
          baseTemplateIds: ['2bb25752-b3bc-4f13-b9cb-38b906d21a33', '77b1399f-5f30-4643-a054-59bbb1c7c62c'],
        },
        ancestors: [
          {
            template: {
              id: 'parentTemplateId',
            },
          },
        ],
        __typename: 'Page',
      };

      op.flush({ data: { item: result } });
      tick();

      expect(spy).toHaveBeenCalledWith({
        id: result.id,
        version: result.version,
        ancestors: result.ancestors,
        baseTemplateIds: ['2bb25752-b3bc-4f13-b9cb-38b906d21a33', '77b1399f-5f30-4643-a054-59bbb1c7c62c'],
        kind: result.__typename,
      });
      flush();
    }));
  });

  describe('fetchItemFields', () => {
    it('should fetch fields without error severity when feature is not supported', fakeAsync(async () => {
      const { itemId, language, itemVersion } = DEFAULT_TEST_CONTEXT;
      xmCloudFeatureCheckerServiceSpy.isErrorSeveritySupported.and.returnValue(Promise.resolve(false));

      const mockResponse = {
        data: {
          item: {
            itemId,
            language: { name: language },
            version: itemVersion,
            revision: { value: 'rev1' },
            access: { canWrite: true, canRead: true },
            fields: {
              nodes: [
                {
                  value: 'test',
                  containsStandardValue: false,
                  access: { canWrite: true, canRead: true },
                  templateField: {
                    section: { name: 'Content' },
                    templateFieldId: 'field1',
                    name: 'Content',
                    type: 'Rich Text',
                    dataSource: {
                      items: { nodes: [], pageInfo: { hasNextPage: false, startCursor: '', endCursor: '' } },
                    },
                    versioning: 'VERSIONED',
                  },
                  validation: [{ results: { nodes: [{ message: '', valid: true, validator: 'test' }] } }],
                },
              ],
            },
          },
        },
      };

      const promise = sut.fetchItemFields(itemId, language, itemVersion);
      tick();

      const op = controller.expectOne(queries['GetItemFields']);
      op.flush(mockResponse);
      tick();

      const result = await promise;

      expect(op.operation.variables).toEqual({
        itemId,
        language,
        version: itemVersion,
        fieldsStartCursor: undefined,
      });
      expect(result.length).toBe(1);
      flush();
    }));

    it('should fetch fields with error severity when feature is supported', fakeAsync(async () => {
      const { itemId, language, itemVersion } = DEFAULT_TEST_CONTEXT;
      xmCloudFeatureCheckerServiceSpy.isErrorSeveritySupported.and.returnValue(Promise.resolve(true));

      const mockResponse = {
        data: {
          item: {
            itemId,
            language: { name: language },
            version: itemVersion,
            revision: { value: 'rev1' },
            access: { canWrite: true, canRead: true },
            fields: {
              nodes: [
                {
                  value: 'test',
                  containsStandardValue: false,
                  access: { canWrite: true, canRead: true },
                  templateField: {
                    section: { name: 'Content' },
                    templateFieldId: 'field1',
                    name: 'Content',
                    type: 'Rich Text',
                    dataSource: {
                      items: { nodes: [], pageInfo: { hasNextPage: false, startCursor: '', endCursor: '' } },
                    },
                    versioning: 'VERSIONED',
                  },
                  validation: [
                    {
                      results: {
                        nodes: [{ message: 'Warning message', valid: true, validator: 'test', result: 'Warning' }],
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
      };

      const promise = sut.fetchItemFields(itemId, language, itemVersion);
      tick();

      const op = controller.expectOne(queries['GetItemFieldsWithErrorSeverity']);
      op.flush(mockResponse);
      tick();

      const result = await promise;

      expect(result[0].validation[0].result).toBe(ItemFieldValidationResult.Warning);
      flush();
    }));
  });
});
