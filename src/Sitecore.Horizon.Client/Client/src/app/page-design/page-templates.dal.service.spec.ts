/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { createSpyObserver } from 'app/testing/test.utils';
import {
  ASSIGN_PAGE_DESIGN_MUTATION,
  ASSIGN_PAGE_DESIGN_PARTIALS_MUTATION,
  COPY_ITEM_MUTATION,
  CREATE_ITEM_MUTATION,
  DELETE_ITEM_MUTATION,
  GET_ITEM_DETAILS_QUERY,
  GET_MOVE_TO_PERMISSIONS_QUERY,
  PAGE_TEMPLATES_CONFIGURE_PAGE_DESIGNS_MUTATION,
  PAGE_TEMPLATES_PAGE_DESIGN_PARTIALS_QUERY,
  PAGE_TEMPLATES_PAGE_DESIGNS_QUERY,
  PAGE_TEMPLATES_PAGE_DESIGNS_ROOTS_QUERY,
  PAGE_TEMPLATES_PAGE_DESIGNS_ROOTS_WITH_CHILDREN_QUERY,
  PAGE_TEMPLATES_PARTIAL_DESIGNS_ROOTS_QUERY,
  PAGE_TEMPLATES_PARTIAL_DESIGNS_ROOTS_WITH_CHILDREN_QUERY,
  PAGE_TEMPLATES_PARTIALS_DESIGNS_QUERY,
  PAGE_TEMPLATES_TENANT_TEMPLATES_QUERY,
  PAGE_TEMPLATES_USAGE_COUNT_QUERY,
  PageTemplatesDalService,
  RENAME_ITEM_MUTATION,
  TEMPLATES_STANDARD_VALUES_MUTATION,
  UPDATE_ITEM_INSERT_OPTIONS_MUTATION,
  UPDATE_STANDARD_VALUES_INSERT_OPTIONS_MUTATION,
} from './page-templates.dal.service';
import {
  AssignPageDesignInput,
  AssignPageDesignPartialsInput,
  InsertOptionsUpdateInput,
  ItemBulkOperationOutputResponse,
  ItemResponse,
  ItemTemplate,
  ItemTemplateBulkOperationOutput,
  PAGE_DESIGN_FOLDER_TEMPLATE_ID,
  PAGE_DESIGN_TEMPLATE_ID,
  PARTIAL_DESIGN_FOLDER_TEMPLATE_ID,
  PARTIAL_DESIGN_TEMPLATE_ID,
} from './page-templates.types';
import { adminPermissions } from './shared/page-templates-test-data';

describe(PageTemplatesDalService.name, () => {
  let sut: PageTemplatesDalService;
  let apolloTestingController: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule.withClients(['global'])],
      providers: [PageTemplatesDalService],
    });

    sut = TestBed.inject(PageTemplatesDalService);
    apolloTestingController = TestBed.inject(ApolloTestingController);
  });

  describe('getTenantPageTemplates', () => {
    it('should query the tenant page templates and emit the result', fakeAsync(() => {
      const siteName = 'test-site-name';

      const gqlPageTemplates = [
        {
          template: { templateId: 'a69b65f0e0c14c89af3fe3cf9a003943', name: 'Page Template' },
          pageDesign: {
            path: '/path/to/page-design',
            displayName: 'page design',
            itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
            name: 'page-design',
            hasChildren: true,
            thumbnailUrl: '',
            hasPresentation: false,
            createdAt: {
              value: '20230428T111641Z',
            },
            updatedAt: {
              value: '20230429T111641Z',
            },
            template: {
              baseTemplates: {
                nodes: [
                  {
                    templateId: 'a87a00b1e6db45ab8b54636fec3b5523',
                  },
                  {
                    templateId: 'ab86861a60354569832bfa5a3f8fddd9',
                  },
                ],
              },
            },
          },
        },
      ];

      const resultSpy = createSpyObserver();

      sut.getTenantPageTemplates(siteName, true, false).subscribe(resultSpy);
      tick();

      const query = apolloTestingController.expectOne(PAGE_TEMPLATES_TENANT_TEMPLATES_QUERY);
      query.flush({ data: { tenantTemplates: gqlPageTemplates } });
      tick();

      expect(query.operation.variables).toEqual({
        siteName: 'test-site-name',
        includeTemplateAccessField: true,
        includeStandardValuesItem: false,
      });
      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual(gqlPageTemplates);
      flush();
    }));
  });

  describe('getPageDesignsRoots', () => {
    it('should query the page design roots and emit the result', fakeAsync(() => {
      const siteName = 'test-site-name';
      const language = 'test-lang';

      const gqlPageDesignRoots = [
        {
          siteName: 'MySite',
          root: {
            path: '/path/to/root1',
            displayName: 'root1',
            itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
            name: 'home',
            hasChildren: true,
            thumbnailUrl: '',
            hasPresentation: false,
            createdAt: {
              value: '20230428T111641Z',
            },
            updatedAt: {
              value: '20230429T111641Z',
            },
            template: {
              baseTemplates: {
                nodes: [
                  {
                    templateId: 'a87a00b1e6db45ab8b54636fec3b5523',
                  },
                  {
                    templateId: 'ab86861a60354569832bfa5a3f8fddd9',
                  },
                ],
              },
            },
            insertOptions: [
              {
                templateId: 'e0dd13c1aa104649bd7786767d6fd54c',
                baseTemplates: {
                  nodes: [
                    {
                      templateId: 'a15decde0e4946e69d19fc41c292a0e9',
                    },
                    {
                      templateId: '023f5d48979d4381bc5e149e36abd3bd',
                    },
                  ],
                },
              },
            ],
            children: {
              nodes: [
                {
                  path: '/path/to/root1/page-design',
                  displayName: 'Page Design',
                  itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
                  name: 'page-design',
                  hasChildren: false,
                  thumbnailUrl: '/root1-page-design-thumbnail.jpg',
                  hasPresentation: true,
                  createdAt: {
                    value: '20230428T111641Z',
                  },
                  updatedAt: {
                    value: '20230429T111641Z',
                  },
                  template: {
                    baseTemplates: {
                      nodes: [
                        {
                          templateId: 'ab86861a60354569832bfa5a3f8fddd9',
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      ];

      const resultSpy = createSpyObserver();

      sut.getPageDesignsRoots(siteName, language).subscribe(resultSpy);
      tick();

      const query = apolloTestingController.expectOne(PAGE_TEMPLATES_PAGE_DESIGNS_ROOTS_WITH_CHILDREN_QUERY);
      query.flush({ data: { pageDesignsRoots: gqlPageDesignRoots } });
      tick();

      expect(query.operation.variables).toEqual({
        siteName,
        versionLanguage: language,
        includeTemplateIDs: [PAGE_DESIGN_TEMPLATE_ID, PAGE_DESIGN_FOLDER_TEMPLATE_ID],
      });
      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual(gqlPageDesignRoots);
      flush();
    }));
  });

  describe('getPartialDesignsRoots', () => {
    it('should query the partial design roots and emit the result', fakeAsync(() => {
      const siteName = 'test-site-name';
      const language = 'test-lang';

      const gqlPartialDesignsRoots = [
        {
          siteName: 'MySite',
          root: {
            path: '/path/to/root1',
            displayName: 'root1',
            itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
            name: 'root1',
            hasChildren: true,
            thumbnailUrl: '',
            hasPresentation: false,
            createdAt: {
              value: '20230428T111641Z',
            },
            updatedAt: {
              value: '20230429T111641Z',
            },
            insertOptions: [
              {
                templateId: '0a2950fb0113480aaf63cd1514d7ddc3',
                baseTemplates: {
                  nodes: [
                    {
                      templateId: '25f01f50553444f9b1babcbb60b2d13d',
                    },
                    {
                      templateId: 'b4544407e6e14050998383d48c2dd8f8',
                    },
                  ],
                },
              },
            ],
            template: {
              baseTemplates: {
                nodes: [
                  {
                    templateId: 'A87A00B1-E6DB-45AB-8B54-636FEC3B5523',
                  },
                  {
                    templateId: 'B87A00B1-E6DB-45AB-8B54-636FEC3B5567',
                  },
                ],
              },
            },
            children: {
              nodes: [
                {
                  path: '/path/to/root1/partial-design',
                  displayName: 'Partial Design',
                  itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
                  name: 'partial-design',
                  hasChildren: false,
                  thumbnailUrl: '/root1-partial-design-thumbnail.jpg',
                  hasPresentation: true,
                  createdAt: {
                    value: '20230428T111641Z',
                  },
                  updatedAt: {
                    value: '20230429T111641Z',
                  },
                  template: {
                    baseTemplates: {
                      nodes: [
                        {
                          templateId: 'B87A00B1-E6DB-45AB-8B54-636FEC3B5567',
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      ];

      const resultSpy = createSpyObserver();

      sut.getPartialDesignsRoots(siteName, language).subscribe(resultSpy);
      tick();

      const query = apolloTestingController.expectOne(PAGE_TEMPLATES_PARTIAL_DESIGNS_ROOTS_WITH_CHILDREN_QUERY);
      query.flush({ data: { partialDesignsRoots: gqlPartialDesignsRoots } });
      tick();

      expect(query.operation.variables).toEqual({
        siteName,
        versionLanguage: language,
        includeTemplateIDs: [PARTIAL_DESIGN_FOLDER_TEMPLATE_ID, PARTIAL_DESIGN_TEMPLATE_ID],
      });
      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual(gqlPartialDesignsRoots);
      flush();
    }));
  });

  describe('getPageDesignsRootsWithoutChildren', () => {
    it('should query the page design roots without children and emit the result', fakeAsync(() => {
      const siteName = 'MySite';

      const gqlPageDesignRootsOnly = [
        {
          siteName: 'MySite',
          root: {
            path: '/path/to/root1',
            displayName: 'root1',
            itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
            name: 'home',
            template: {
              baseTemplates: {
                nodes: [
                  {
                    templateId: 'a87a00b1e6db45ab8b54636fec3b5523',
                  },
                ],
              },
            },
            insertOptions: [
              {
                templateId: 'e0dd13c1aa104649bd7786767d6fd54c',
                baseTemplates: {
                  nodes: [
                    {
                      templateId: 'a15decde0e4946e69d19fc41c292a0e9',
                    },
                  ],
                },
              },
            ],
          },
        },
      ];

      const resultSpy = createSpyObserver();

      sut.getPageDesignsRootsWithoutChildren(siteName).subscribe(resultSpy);
      tick();

      const query = apolloTestingController.expectOne(PAGE_TEMPLATES_PAGE_DESIGNS_ROOTS_QUERY);
      query.flush({ data: { pageDesignsRoots: gqlPageDesignRootsOnly } });
      tick();

      expect(query.operation.variables).toEqual({ siteName });
      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual(gqlPageDesignRootsOnly);
      flush();
    }));
  });

  describe('getPartialDesignsRootsWithoutChildren', () => {
    it('should query the partial design roots without children and emit the result', fakeAsync(() => {
      const siteName = 'test-site-name';

      const gqlPartialDesignsRootsOnly = [
        {
          siteName: 'MySite',
          root: {
            displayName: 'root1',
            itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
            name: 'root1',
            insertOptions: [
              {
                templateId: '0a2950fb0113480aaf63cd1514d7ddc3',
                baseTemplates: {
                  nodes: [
                    {
                      templateId: '25f01f50553444f9b1babcbb60b2d13d',
                    },
                  ],
                },
              },
            ],
            template: {
              baseTemplates: {
                nodes: [
                  {
                    templateId: 'A87A00B1-E6DB-45AB-8B54-636FEC3B5523',
                  },
                ],
              },
            },
          },
        },
      ];

      const resultSpy = createSpyObserver();

      sut.getPartialDesignsRootsWithoutChildren(siteName).subscribe(resultSpy);
      tick();

      const query = apolloTestingController.expectOne(PAGE_TEMPLATES_PARTIAL_DESIGNS_ROOTS_QUERY);
      query.flush({ data: { partialDesignsRoots: gqlPartialDesignsRootsOnly } });
      tick();

      expect(query.operation.variables).toEqual({ siteName });
      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual(gqlPartialDesignsRootsOnly);
      flush();
    }));
  });

  describe('getPageDesignFlatList', () => {
    it('should query the page design flat list and emit the result', fakeAsync(() => {
      const siteName = 'test-site-name';

      const gqlPageDesigns = [
        {
          pageDesign: {
            path: 'page-design-1',
            displayName: 'page design 1',
            itemId: '1930bbeb-7805-471a-a3be-4858ac7cf696',
            name: 'page-design-1',
            hasChildren: true,
            thumbnailUrl: '',
            hasPresentation: false,
            createdAt: {
              value: '20230428T111641Z',
            },
            updatedAt: {
              value: '20230429T111641Z',
            },
            template: {
              baseTemplates: {
                nodes: [
                  {
                    templateId: '0407560f-387b-4a90-adbe-398b077890e9',
                  },
                ],
              },
            },
          },
          siteName: 'test-site-name',
        },
        {
          pageDesign: {
            path: 'page-design-2',
            displayName: 'page design 2',
            itemId: '2830bbeb-7805-471a-a3be-4858ac7cf696',
            name: 'page-design-2',
            hasChildren: true,
            thumbnailUrl: '',
            hasPresentation: false,
            createdAt: {
              value: '20230428T111641Z',
            },
            updatedAt: {
              value: '20230429T111641Z',
            },
            template: {
              baseTemplates: {
                nodes: [
                  {
                    templateId: '0407560f-387b-4a90-adbe-398b077890e9',
                  },
                ],
              },
            },
          },
          siteName: 'test-site-name',
        },
      ];

      const resultSpy = createSpyObserver();

      sut.getPageDesignFlatList(siteName).subscribe(resultSpy);
      tick();

      const query = apolloTestingController.expectOne(PAGE_TEMPLATES_PAGE_DESIGNS_QUERY);
      query.flush({ data: { pageDesigns: gqlPageDesigns } });
      tick();

      expect(query.operation.variables).toEqual({ siteName: 'test-site-name' });
      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual(gqlPageDesigns);
      flush();
    }));
  });

  describe('getPartialDesignFlatList', () => {
    it('should query the partial design flat list and emit the result', fakeAsync(() => {
      const siteName = 'test-site-name';

      const gqlPartialDesigns = [
        {
          partialDesign: {
            path: 'partial-design-1',
            displayName: 'partial design 1',
            itemId: '1930bbeb-7805-471a-a3be-4858ac7cf696',
            name: 'partial-design-1',
            hasChildren: true,
            thumbnailUrl: '',
            hasPresentation: false,
            createdAt: {
              value: '20230428T111641Z',
            },
            updatedAt: {
              value: '20230429T111641Z',
            },
            template: {
              baseTemplates: {
                nodes: [
                  {
                    templateId: '0407560f-387b-4a90-adbe-398b077890e9',
                  },
                ],
              },
            },
          },
          siteName: 'test-site-name',
        },
        {
          partialDesign: {
            path: 'page-partial-2',
            displayName: 'page partial 2',
            itemId: '2830bbeb-7805-471a-a3be-4858ac7cf696',
            name: 'page-partial-2',
            hasChildren: true,
            thumbnailUrl: '',
            hasPresentation: false,
            createdAt: {
              value: '20230428T111641Z',
            },
            updatedAt: {
              value: '20230429T111641Z',
            },
            template: {
              baseTemplates: {
                nodes: [
                  {
                    templateId: '0407560f-387b-4a90-adbe-398b077890e9',
                  },
                ],
              },
            },
          },
          siteName: 'test-site-name',
        },
      ];

      const resultSpy = createSpyObserver();

      sut.getPartialDesignFlatList(siteName).subscribe(resultSpy);
      tick();

      const query = apolloTestingController.expectOne(PAGE_TEMPLATES_PARTIALS_DESIGNS_QUERY);
      query.flush({ data: { partialDesigns: gqlPartialDesigns } });
      tick();

      expect(query.operation.variables).toEqual({ siteName: 'test-site-name' });
      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual(gqlPartialDesigns);
      flush();
    }));
  });

  describe('getPageDesignPartials', () => {
    it('should query the partial designs of page design by its id and emit the result', fakeAsync(() => {
      const pageDesignId = 'ffg3a2c2-3a9d-4d6e-a0bf-9a5fe6c8b2d0';
      const mockResponse = {
        data: {
          item: {
            field: {
              value:
                '{0407560f-387b-4a90-adbe-398b077890e9}|{0407560f-387b-4a90-adbe-398b077890e1}|{0407560f-387b-4a90-adbe-398b077890e2}',
            },
          },
        },
      };

      const resultSpy = createSpyObserver();

      sut.getPageDesignPartials(pageDesignId).subscribe(resultSpy);
      tick();

      const query = apolloTestingController.expectOne(PAGE_TEMPLATES_PAGE_DESIGN_PARTIALS_QUERY);
      query.flush(mockResponse);
      tick();

      expect(query.operation.variables).toEqual({ pageDesignId });
      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual([
        '0407560f-387b-4a90-adbe-398b077890e9',
        '0407560f-387b-4a90-adbe-398b077890e1',
        '0407560f-387b-4a90-adbe-398b077890e2',
      ]);
      flush();
    }));
  });

  describe('getTemplatesUsageCount', () => {
    it('should query the items by templateId and emit the result', fakeAsync(() => {
      const templateId = 'ffg3a2c2-3a9d-4d6e-a0bf-9a5fe6c8b2d0';
      const mockResponse = {
        data: {
          search: {
            totalCount: 3,
          },
        },
      };

      const resultSpy = createSpyObserver();

      sut.getTemplatesUsageCount(templateId).subscribe(resultSpy);
      tick();

      const query = apolloTestingController.expectOne(PAGE_TEMPLATES_USAGE_COUNT_QUERY);
      query.flush(mockResponse);
      tick();

      expect(query.operation.variables).toEqual({
        includeFieldValue: templateId,
        excludeFieldValue: '__Standard Values',
      });
      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual(3);
      flush();
    }));
  });

  describe('getItemDetail', () => {
    it('should query the item detail by itemId and language and emit the result', fakeAsync(() => {
      const itemId = 'ffg3a2c2-3a9d-4d6e-a0bf-9a5fe6c8b2d0';
      const language = 'en';
      const itemWithDetails = {
        path: 'page-design-2',
        displayName: 'page design 2',
        itemId: '2830bbeb-7805-471a-a3be-4858ac7cf696',
        name: 'page-design-2',
        hasChildren: true,
        thumbnailUrl: '',
        hasPresentation: false,
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          baseTemplates: {
            nodes: [
              {
                templateId: '0407560f-387b-4a90-adbe-398b077890e9',
              },
            ],
          },
        },
      };
      const mockResponse = {
        data: {
          item: itemWithDetails,
        },
      };

      const resultSpy = createSpyObserver();

      sut.getItemDetails(itemId, language).subscribe(resultSpy);
      tick();

      const query = apolloTestingController.expectOne(GET_ITEM_DETAILS_QUERY);
      query.flush(mockResponse);
      tick();

      expect(query.operation.variables).toEqual({
        itemId,
        language,
      });
      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual(itemWithDetails);
      flush();
    }));
  });

  describe('getMoveToPermissions', () => {
    it('should query the move to permissions by itemId, language, and destinationId and emit the result', fakeAsync(() => {
      const itemId = 'ffg3a2c2-3a9d-4d6e-a0bf-9a5fe6c8b2d0';
      const destinationId = 'ffg3a2c2-3a9d-4d6e-a0bf-9a5fe6c8b2d0';
      const language = 'en';
      const itemWithMoveToAccess = {
        access: {
          canMoveTo: true,
        },
      };
      const mockResponse = {
        data: {
          item: itemWithMoveToAccess,
        },
      };

      const resultSpy = createSpyObserver();

      sut.getMoveToPermissions(itemId, language, destinationId).subscribe(resultSpy);
      tick();

      const query = apolloTestingController.expectOne(GET_MOVE_TO_PERMISSIONS_QUERY);
      query.flush(mockResponse);
      tick();

      expect(query.operation.variables).toEqual({
        itemId,
        language,
        destinationId,
      });
      expect(resultSpy.next).toHaveBeenCalledTimes(1);
      const [result] = resultSpy.next.calls.mostRecent().args;
      expect(result).toEqual(true);
      flush();
    }));
  });

  describe('createTemplatesStandardValuesItems', () => {
    it('should execute updateItemTemplate mutation for every input id', fakeAsync(() => {
      const templateIds = ['template-id1', 'template-id2'];

      const itemTemplate1: ItemTemplate = {
        name: 'template1',
        templateId: 'template-id1',
        standardValuesItem: {
          itemId: 'sv-item-id1',
          insertOptions: [],
        },
      };
      const itemTemplate2: ItemTemplate = {
        name: 'template2',
        templateId: 'template-id2',
        standardValuesItem: {
          itemId: 'sv-item-id2',
          insertOptions: [],
        },
      };

      const expectedResult: ItemTemplateBulkOperationOutput = {
        templates: [{ ...itemTemplate1 }, { ...itemTemplate2 }],
        errorMessage: null,
        successful: true,
      };
      const spy = createSpyObserver();

      // act
      sut.createTemplatesStandardValuesItems(templateIds).subscribe(spy);
      const op = apolloTestingController.expectOne(TEMPLATES_STANDARD_VALUES_MUTATION(templateIds));

      op.flush({ data: { T1: { itemTemplate: itemTemplate1 }, T2: { itemTemplate: itemTemplate2 } } });
      tick();

      // assert
      expect(spy.next).toHaveBeenCalledWith(expectedResult);
      flush();
    }));
  });

  describe('updateStandardValuesInsertOptions', () => {
    it('should execute updateItem mutation for every standard value item id', fakeAsync(() => {
      const insertOptionsUpdates: InsertOptionsUpdateInput[] = [
        { itemId: 'sv-item-id1', insertOptions: '{template-id1}|{template-id2}' },
        { itemId: 'sv-item-id2', insertOptions: '{template-id3}' },
      ];

      const vsItem1: ItemResponse = {
        path: '/path/to/sv-item-id1',
        displayName: 'sv-item-id1',
        itemId: 'sv-item-id1',
        name: 'name',
        hasChildren: false,
        thumbnailUrl: 'thumbnail-url',
        hasPresentation: true,
        insertOptions: [],
        version: 1,
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          name: 'temp01',
          templateId: 'temp01-id',
          baseTemplates: {
            nodes: [
              {
                templateId: 'templateId1',
              },
              {
                templateId: 'templateId2',
              },
            ],
          },
        },
        access: adminPermissions,
      };
      const vsItem2: ItemResponse = {
        path: '/path/to/sv-item-id2',
        displayName: 'sv-item-id2',
        itemId: 'sv-item-id2',
        name: 'name',
        hasChildren: false,
        thumbnailUrl: 'thumbnail-url',
        hasPresentation: true,
        insertOptions: [],
        version: 1,
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          name: 'temp01',
          templateId: 'temp01-id',
          baseTemplates: {
            nodes: [
              {
                templateId: 'templateId1',
              },
              {
                templateId: 'templateId2',
              },
            ],
          },
        },
        access: adminPermissions,
      };

      const expectedResult: ItemBulkOperationOutputResponse = {
        items: [{ ...vsItem1 }, { ...vsItem2 }],
        errorMessage: null,
        successful: true,
      };
      const spy = createSpyObserver();

      // act
      sut.updateStandardValuesInsertOptions(insertOptionsUpdates).subscribe(spy);
      const op = apolloTestingController.expectOne(
        UPDATE_STANDARD_VALUES_INSERT_OPTIONS_MUTATION(insertOptionsUpdates),
      );

      op.flush({ data: { I1: { item: vsItem1 }, I2: { item: vsItem2 } } });
      tick();

      // assert
      expect(spy.next).toHaveBeenCalledWith(expectedResult);
      flush();
    }));
  });

  describe('createItem', () => {
    it('should execute the createItem mutation', fakeAsync(() => {
      // arrange
      const name = 'item-name';
      const parent = 'parent-id';
      const templateId = 'templateId';
      const language = 'en';

      const createItemInput = {
        name,
        parent,
        templateId,
        language,
      };

      const spy = createSpyObserver();

      // act
      sut.createItem(createItemInput).subscribe(spy);
      const op = apolloTestingController.expectOne(CREATE_ITEM_MUTATION);
      const item = {
        path: '/path/to/item',
        displayName: 'item',
        itemId: 'itemId',
        name: 'name',
        hasChildren: false,
        thumbnailUrl: 'thumbnail-url',
        hasPresentation: true,
        insertOptions: [],
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          baseTemplates: {
            nodes: [
              {
                templateId: 'templateId1',
              },
              {
                templateId: 'templateId2',
              },
            ],
          },
        },
        access: adminPermissions,
      };

      const result = { successful: true, errorMessage: null, item };
      op.flush({ data: { createItem: result } });
      tick();

      // assert
      expect(op.operation.variables).toEqual({
        input: {
          name,
          parent,
          templateId,
          language,
        },
      });
      expect(spy.next).toHaveBeenCalledWith(result);
      flush();
    }));
  });

  describe('copyItem', () => {
    it('should execute the copyItem mutation', fakeAsync(() => {
      // arrange
      const copyItemName = 'item-name';
      const itemId = 'itemId';
      const targetParentId = 'parentId';

      const copyItemInput = {
        copyItemName,
        itemId,
        targetParentId,
      };

      const spy = createSpyObserver();

      // act
      sut.copyItem(copyItemInput, false).subscribe(spy);
      const op = apolloTestingController.expectOne(COPY_ITEM_MUTATION);
      const item = {
        path: '/path/to/item',
        displayName: 'item',
        itemId: 'itemId',
        name: 'name',
        hasChildren: false,
        thumbnailUrl: 'thumbnail-url',
        hasPresentation: true,
        insertOptions: [],
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          baseTemplates: {
            nodes: [
              {
                templateId: 'templateId1',
              },
              {
                templateId: 'templateId2',
              },
            ],
          },
        },
        access: adminPermissions,
      };

      const result = { successful: true, errorMessage: null, item };
      op.flush({ data: { copyItem: result } });
      tick();

      // assert
      expect(op.operation.variables).toEqual({
        input: {
          copyItemName,
          deepCopy: true,
          itemId,
          targetParentId,
        },
        isTemplate: false,
      });
      expect(spy.next).toHaveBeenCalledWith(result);
      flush();
    }));
  });

  describe('renameItem', () => {
    it('should execute the renameItem mutation', fakeAsync(() => {
      // arrange
      const newName = 'item-name';
      const itemId = 'itemId';

      const renameItemInput = {
        itemId,
        newName,
      };

      const spy = createSpyObserver();

      // act
      sut.renameItem(renameItemInput).subscribe(spy);
      const op = apolloTestingController.expectOne(RENAME_ITEM_MUTATION);
      const item = {
        path: '/path/to/item',
        displayName: 'item',
        itemId: 'itemId',
        name: 'name',
        hasChildren: false,
        thumbnailUrl: 'thumbnail-url',
        hasPresentation: true,
        insertOptions: [],
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          baseTemplates: {
            nodes: [
              {
                templateId: 'templateId1',
              },
              {
                templateId: 'templateId2',
              },
            ],
          },
        },
        access: adminPermissions,
      };

      const result = { successful: true, errorMessage: null, item };
      op.flush({ data: { renameItem: result } });
      tick();

      // assert
      expect(op.operation.variables).toEqual({
        input: {
          itemId,
          newName,
        },
      });
      expect(spy.next).toHaveBeenCalledWith(result);
      flush();
    }));
  });

  describe('deleteItem', () => {
    it('should execute the deleteItem mutation', fakeAsync(() => {
      // arrange
      const itemId = 'itemId';

      const deleteItemInput = {
        itemId,
        permanently: false,
      };

      const spy = createSpyObserver();

      // act
      sut.deleteItem(deleteItemInput).subscribe(spy);
      const op = apolloTestingController.expectOne(DELETE_ITEM_MUTATION);

      const result = { successful: true, errorMessage: null, item: null };
      op.flush({ data: { deleteItem: result } });
      tick();

      // assert
      expect(op.operation.variables).toEqual({
        input: {
          itemId,
          permanently: false,
        },
      });
      expect(spy.next).toHaveBeenCalledWith(result);
      flush();
    }));
  });

  describe('configurePageDesign', () => {
    it('should execute the configurePageDesign mutation', fakeAsync(() => {
      // arrange
      const siteName = 'test-site-name';

      const mapping = [
        {
          templateId: 'template_001',
          pageDesignId: 'design_001',
        },
        {
          templateId: 'template_002',
          pageDesignId: 'design_002',
        },
        {
          templateId: 'template_003',
          pageDesignId: 'design_001',
        },
      ];

      const configurePageDesignsInput = {
        siteName: 'test-site-name',
        mapping,
      };

      const spy = createSpyObserver();

      // act
      sut.configurePageDesign(configurePageDesignsInput).subscribe(spy);
      const op = apolloTestingController.expectOne(PAGE_TEMPLATES_CONFIGURE_PAGE_DESIGNS_MUTATION);

      const result = { success: true, errorMessage: null };
      op.flush({ data: { configurePageDesigns: result } });
      tick();

      // assert
      expect(op.operation.variables).toEqual({
        input: {
          mapping,
          siteName,
        },
      });
      expect(spy.next).toHaveBeenCalledWith(result);
      flush();
    }));
  });

  describe('assignPageDesignPartials', () => {
    it('should execute the assignPageDesignPartials mutation', fakeAsync(() => {
      // arrange
      const pageDesignId = 'page-design-id';

      const partialDesignIds = ['id1', 'id2', 'id3'];

      const assignPageDesignPartialsInput: AssignPageDesignPartialsInput = {
        pageDesignId,
        partialDesignIds,
      };

      const item = {
        displayName: 'item',
        itemId: 'pageDesignId',
        name: 'name',
        field: {
          value: partialDesignIds,
        },
      };

      const spy = createSpyObserver();

      // act
      sut.assignPageDesignPartials(assignPageDesignPartialsInput).subscribe(spy);
      const op = apolloTestingController.expectOne(ASSIGN_PAGE_DESIGN_PARTIALS_MUTATION);

      const result = { success: true, errorMessage: null };
      op.flush({ data: { updateItem: { success: true, errorMessage: null, item } } });
      tick();

      // assert
      expect(op.operation.variables).toEqual({
        input: {
          itemId: pageDesignId,
          fields: [{ name: 'PartialDesigns', value: 'id1|id2|id3' }],
        },
      });
      expect(spy.next).toHaveBeenCalledWith(result);
      flush();
    }));
  });

  describe('assignPageDesign', () => {
    it('should execute the assignPageDesign mutation', fakeAsync(() => {
      // arrange
      const itemId = 'item-id';

      const pageDesignId = 'page-design-id';

      const assignPageDesignInput: AssignPageDesignInput = {
        itemId,
        pageDesignId,
      };

      const item = {
        displayName: 'item',
        itemId: 'itemId',
        name: 'name',
        field: {
          value: pageDesignId,
        },
      };

      const spy = createSpyObserver();

      // act
      sut.assignPageDesign(assignPageDesignInput).subscribe(spy);
      const op = apolloTestingController.expectOne(ASSIGN_PAGE_DESIGN_MUTATION);

      const result = { success: true, errorMessage: null };
      op.flush({ data: { updateItem: { success: true, errorMessage: null, item } } });
      tick();

      // assert
      expect(op.operation.variables).toEqual({
        input: {
          itemId,
          fields: [{ name: 'Page Design', value: 'page-design-id' }],
        },
      });
      expect(spy.next).toHaveBeenCalledWith(result);
      flush();
    }));
  });

  describe('updatePageInsertOptions', () => {
    it('should execute the updatePageInsertOptions mutation', fakeAsync(() => {
      // arrange
      const insertOptionsUpdateInput: InsertOptionsUpdateInput = {
        itemId: 'item-id',
        insertOptions: 'template-id1 | template-id2',
      };

      const spy = createSpyObserver();

      // act
      sut.updatePageInsertOptions(insertOptionsUpdateInput).subscribe(spy);
      const op = apolloTestingController.expectOne(UPDATE_ITEM_INSERT_OPTIONS_MUTATION);
      const result = { successful: true, errorMessage: null, item: null };
      op.flush({ data: { updateItem: result } });
      tick();

      // assert
      expect(op.operation.variables).toEqual({
        input: {
          itemId: 'item-id',
          fields: [{ name: '__Masters', value: 'template-id1 | template-id2' }],
        },
      });
      expect(spy.next).toHaveBeenCalledWith(result);
      flush();
    }));
  });
});
