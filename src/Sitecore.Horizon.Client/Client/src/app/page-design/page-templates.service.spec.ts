/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import {
  AssignPageDesignOutput,
  AssignPageDesignPartialsOutput,
  ConfigurePageDesignsInput,
  ConfigurePageDesignsOutput,
  InsertOptionsUpdateInput,
  Item,
  ItemBulkOperationOutput,
  ItemBulkOperationOutputResponse,
  ItemOperationOutput,
  ItemOperationOutputResponse,
  ItemResponse,
  ItemTemplate,
  ItemTemplateBulkOperationOutput,
  ItemWithSite,
  PageDesignResponse,
  PageDesignRootResponse,
  PageDesignsMappingInput,
  PartialDesignResponse,
  PartialDesignRootResponse,
  StandardValuesItem,
  TenantPageTemplateResponse,
} from 'app/page-design/page-templates.types';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { XmCloudFeatureCheckerService } from 'app/shared/xm-cloud/xm-cloud-feature-checker.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { firstValueFrom, of } from 'rxjs';
import { PageTemplatesDalService } from './page-templates.dal.service';
import { PageTemplatesService } from './page-templates.service';
import { adminPermissions, mockThumbnailUrl } from './shared/page-templates-test-data';

describe(PageTemplatesService.name, () => {
  let sut: PageTemplatesService;
  let pageTemplatesDalService: jasmine.SpyObj<PageTemplatesDalService>;
  let siteService: jasmine.SpyObj<SiteService>;
  let timedNotificationsService: jasmine.SpyObj<TimedNotificationsService>;
  let context: ContextServiceTesting;
  let xmCloudFeatureCheckerService: jasmine.SpyObj<XmCloudFeatureCheckerService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule, TranslateModule, ContextServiceTestingModule, TranslateServiceStubModule],
      providers: [
        {
          provide: PageTemplatesDalService,
          useValue: jasmine.createSpyObj<PageTemplatesDalService>([
            'getTenantPageTemplates',
            'getPageDesignsRoots',
            'getPartialDesignsRoots',
            'getPageDesignFlatList',
            'getPartialDesignFlatList',
            'getPageDesignPartials',
            'assignPageDesignPartials',
            'createItem',
            'copyItem',
            'renameItem',
            'deleteItem',
            'configurePageDesign',
            'getItemChildrenWithAncestors',
            'getTemplatesUsageCount',
            'getItemDetails',
            'getMoveToPermissions',
            'assignPageDesign',
            'createTemplatesStandardValuesItems',
            'updateStandardValuesInsertOptions',
            'updatePageInsertOptions',
          ]),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>(['getSites']),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', ['pushNotification']),
        },
        {
          provide: XmCloudFeatureCheckerService,
          useValue: jasmine.createSpyObj<XmCloudFeatureCheckerService>('XmCloudFeatureCheckerService', [
            'isTemplateAccessFieldAvailable',
            'isTemplateStandardValuesAvailable',
          ]),
        },
      ],
    });
    xmCloudFeatureCheckerService = TestBedInjectSpy(XmCloudFeatureCheckerService);
    xmCloudFeatureCheckerService.isTemplateAccessFieldAvailable.and.resolveTo(true);
    xmCloudFeatureCheckerService.isTemplateStandardValuesAvailable.and.resolveTo(false);

    pageTemplatesDalService = TestBedInjectSpy(PageTemplatesDalService);
    siteService = TestBedInjectSpy(SiteService);
    timedNotificationsService = TestBedInjectSpy(TimedNotificationsService);

    context = TestBed.inject(ContextServiceTesting);
    context.provideDefaultTestContext();

    sut = TestBed.inject(PageTemplatesService);
  });

  describe('getTenantPageTemplates', () => {
    it('should return an Observable of TenantTemplate[] from DAL service', fakeAsync(() => {
      const siteName = 'example.com';
      const tenantTemplates: TenantPageTemplateResponse[] = [
        {
          template: {
            templateId: 'template_001',
            name: 'Homepage Template',
            access: adminPermissions,
          },
          pageDesign: {
            path: '/path/to/page/design1',
            displayName: 'Page Design 1',
            itemId: '1234',
            name: 'Page Design 1',
            version: 1,
            hasChildren: true,
            thumbnailUrl: mockThumbnailUrl,
            hasPresentation: true,
            access: adminPermissions,
            insertOptions: [],
            createdAt: { value: '20230428T111641Z' },
            updatedAt: { value: '20230429T111641Z' },
            template: {
              templateId: 'tmp001',
              name: 'template 001',
              baseTemplates: {
                nodes: [
                  { templateId: 'b97a00b1-e6db-45ab-8b54-636fec3b5523' },
                  { templateId: '1930bbeb-7805-471a-a3be-4858ac7cf696' },
                ],
              },
            },
          },
        },
        {
          template: {
            templateId: 'template_002',
            name: 'About Us Template',
            access: adminPermissions,
          },
          pageDesign: {
            path: '/path/to/page/design2',
            displayName: 'Page Design 2',
            itemId: 'c97a00b1-e6db-45ab-8b54-636fec3b5533',
            name: 'Page Design 2',
            version: 1,
            hasChildren: true,
            thumbnailUrl: mockThumbnailUrl,
            hasPresentation: true,
            access: adminPermissions,
            insertOptions: [],
            createdAt: { value: '20230428T111641Z' },
            updatedAt: { value: '20230429T111641Z' },
            template: {
              templateId: 'tmp001',
              name: 'template 001',
              baseTemplates: {
                nodes: [
                  { templateId: 'b97a00b1-e6db-45ab-8b54-636fec3b5523' },
                  { templateId: '1930bbeb-7805-471a-a3be-4858ac7cf696' },
                ],
              },
            },
          },
        },
      ];

      pageTemplatesDalService.getTenantPageTemplates.and.returnValue(of(tenantTemplates));

      sut.getTenantPageTemplates(siteName).subscribe((tenantTemplateList) => {
        expect(tenantTemplateList).toEqual(tenantTemplateList);
      });

      tick();

      expect(pageTemplatesDalService.getTenantPageTemplates).toHaveBeenCalledWith(siteName, true, false);
      flush();
    }));
  });

  describe('getPageDesignsRoots', () => {
    it('should return an Observable of an array of page design root Items from DAL service result', () => {
      const siteName = 'example.com';
      const language = 'en';

      const rootItem: ItemResponse = {
        path: '/path/to/root1',
        displayName: 'root1',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'root1',
        version: 1,
        hasChildren: true,
        thumbnailUrl: '',
        hasPresentation: false,
        access: adminPermissions,
        insertOptions: [],
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'a87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
              {
                templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
              },
            ],
          },
        },
        ancestors: undefined,
        parent: undefined,
        children: {
          nodes: [
            {
              path: '/path/to/root1/PageDesign',
              displayName: 'Page Design',
              itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
              name: 'PageDesign',
              version: 1,
              hasChildren: false,
              thumbnailUrl: mockThumbnailUrl,
              hasPresentation: true,
              access: adminPermissions,
              insertOptions: [],
              createdAt: {
                value: '20230428T111641Z',
              },
              updatedAt: {
                value: '20230429T111641Z',
              },
              template: {
                templateId: 'tmp001',
                name: 'template 001',
                baseTemplates: {
                  nodes: [
                    {
                      templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
                    },
                  ],
                },
              },
              ancestors: undefined,
              parent: undefined,
            },
          ],
        },
      };

      const expectedItem: Item = {
        path: '/path/to/root1',
        displayName: 'root1',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'root1',
        version: 1,
        hasChildren: true,
        thumbnailUrl: '',
        hasPresentation: false,
        isFolder: true,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        ancestors: undefined,
        parentId: undefined,
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'a87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
              {
                templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
              },
            ],
          },
        },
        children: [
          {
            path: '/path/to/root1/PageDesign',
            displayName: 'Page Design',
            itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
            name: 'PageDesign',
            version: 1,
            hasChildren: false,
            thumbnailUrl: mockThumbnailUrl,
            hasPresentation: true,
            isFolder: false,
            insertOptions: [],
            createdDate: '20230428T111641Z',
            updatedDate: '20230429T111641Z',
            access: adminPermissions,
            children: undefined,
            ancestors: undefined,
            parentId: undefined,
            pageDesignId: undefined,
            template: {
              templateId: 'tmp001',
              name: 'template 001',
              baseTemplates: {
                nodes: [
                  {
                    templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
                  },
                ],
              },
            },
            standardValueItemId: undefined,
          },
        ],
        pageDesignId: undefined,
        standardValueItemId: undefined,
      };

      const pageDesignRoot1: PageDesignRootResponse = {
        root: rootItem,
        siteName,
      };

      const pageDesignRoots: PageDesignRootResponse[] = [pageDesignRoot1];
      const expectedItems: ItemWithSite[] = [{ ...expectedItem, siteName }];

      pageTemplatesDalService.getPageDesignsRoots.and.returnValue(of(pageDesignRoots));

      sut.getPageDesignsRoots(siteName, language).subscribe((items: ItemWithSite[]) => {
        expect(items).toEqual(expectedItems);
      });
    });
  });

  describe('getPartialDesignsRoots', () => {
    it('should return an Observable of an array of partial design root Items from DAL service result', () => {
      const siteName = 'example.com';
      const language = 'en';
      const rootItem: ItemResponse = {
        path: '/path/to/root1',
        displayName: 'root1',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'root1',
        version: 1,
        hasChildren: true,
        thumbnailUrl: '',
        hasPresentation: false,
        access: adminPermissions,
        insertOptions: [],
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'a87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
              {
                templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
              },
            ],
          },
        },
        ancestors: undefined,
        parent: undefined,
        standardValueItemId: undefined,
        children: {
          nodes: [
            {
              path: '/path/to/root1/partial-design',
              displayName: 'Partial Design',
              itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
              name: 'PartialDesign',
              version: 1,
              hasChildren: false,
              thumbnailUrl: mockThumbnailUrl,
              hasPresentation: true,
              access: adminPermissions,
              insertOptions: [],
              createdAt: {
                value: '20230428T111641Z',
              },
              updatedAt: {
                value: '20230429T111641Z',
              },
              template: {
                templateId: 'tmp001',
                name: 'template 001',
                baseTemplates: {
                  nodes: [
                    {
                      templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
                    },
                  ],
                },
              },
              ancestors: undefined,
              parent: undefined,
              standardValueItemId: undefined,
            },
          ],
        },
      };

      const expectedItem: Item = {
        path: '/path/to/root1',
        displayName: 'root1',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'root1',
        version: 1,
        hasChildren: true,
        thumbnailUrl: '',
        hasPresentation: false,
        isFolder: true,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        ancestors: undefined,
        parentId: undefined,
        pageDesignId: undefined,
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'a87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
              {
                templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
              },
            ],
          },
        },
        standardValueItemId: undefined,
        children: [
          {
            path: '/path/to/root1/partial-design',
            displayName: 'Partial Design',
            itemId: 'B18B6AF1-AB87-49FD-ABE2-8A8A5979D5C5',
            name: 'PartialDesign',
            version: 1,
            hasChildren: false,
            thumbnailUrl: mockThumbnailUrl,
            hasPresentation: true,
            isFolder: false,
            insertOptions: [],
            createdDate: '20230428T111641Z',
            updatedDate: '20230429T111641Z',
            access: adminPermissions,
            children: undefined,
            ancestors: undefined,
            parentId: undefined,
            pageDesignId: undefined,
            template: {
              templateId: 'tmp001',
              name: 'template 001',
              baseTemplates: {
                nodes: [
                  {
                    templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
                  },
                ],
              },
            },
            standardValueItemId: undefined,
          },
        ],
      };

      const partialDesignRoot: PartialDesignRootResponse = {
        root: rootItem,
        siteName,
      };
      const partialDesignRoots: PartialDesignRootResponse[] = [partialDesignRoot];

      const expectedPartialDesignRoot: ItemWithSite = {
        ...expectedItem,
        siteName,
      };
      const expectedPartialDesignRoots: ItemWithSite[] = [expectedPartialDesignRoot];

      pageTemplatesDalService.getPartialDesignsRoots.and.returnValue(of(partialDesignRoots));

      sut.getPartialDesignsRoots(siteName, language).subscribe((items) => {
        expect(items).toEqual(expectedPartialDesignRoots);
      });
    });
  });

  describe('getPageDesignsList', () => {
    it('should return an Observable of an array of page design flat list from DAL service result', () => {
      const siteName = 'site1';
      const pageDesignItem1: ItemResponse = {
        path: '/path/to/page-design1',
        displayName: 'page design 1',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'page design 1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        access: adminPermissions,
        insertOptions: [],
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'f87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
              {
                templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
              },
            ],
          },
        },
        ancestors: undefined,
        parent: undefined,
        standardValueItemId: undefined,
      };

      const pageDesignItem2: ItemResponse = {
        path: '/path/to/page-design2',
        displayName: 'page design 2',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'page design 2',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        access: adminPermissions,
        insertOptions: [],
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'd87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
              {
                templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
              },
            ],
          },
        },
        ancestors: undefined,
        parent: undefined,
        standardValueItemId: undefined,
      };

      const expectedPageDesign1: ItemWithSite = {
        path: '/path/to/page-design1',
        displayName: 'page design 1',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'page design 1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: undefined,
        siteName: 'site1',
        ancestors: undefined,
        parentId: undefined,
        pageDesignId: undefined,
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'f87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
              {
                templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
              },
            ],
          },
        },
        standardValueItemId: undefined,
      };

      const expectedPageDesign2: ItemWithSite = {
        path: '/path/to/page-design2',
        displayName: 'page design 2',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'page design 2',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: undefined,
        siteName: 'site1',
        ancestors: undefined,
        parentId: undefined,
        pageDesignId: undefined,
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'd87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
              {
                templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
              },
            ],
          },
        },
        standardValueItemId: undefined,
      };

      const pageDesign1: PageDesignResponse = {
        pageDesign: pageDesignItem1,
        siteName,
      };
      const pageDesign2: PageDesignResponse = {
        pageDesign: pageDesignItem2,
        siteName,
      };

      const pageDesignList: PageDesignResponse[] = [pageDesign1, pageDesign2];
      const expectedItems: ItemWithSite[] = [expectedPageDesign1, expectedPageDesign2];

      pageTemplatesDalService.getPageDesignFlatList.and.returnValue(of(pageDesignList));

      sut.getPageDesignsList(siteName).subscribe((items) => {
        expect(items).toEqual(expectedItems);
      });
    });
  });

  describe('getPartialDesignsList', () => {
    it('should return an Observable of an array of partial design flat list from DAL service result', () => {
      const siteName = 'example.com';
      const partialDesignItem1: ItemResponse = {
        path: '/path/to/partial-design1',
        displayName: 'partial design 1',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'partial design 1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        access: adminPermissions,
        insertOptions: [],
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'f87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
              {
                templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
              },
            ],
          },
        },
        ancestors: undefined,
        parent: { itemId: 'parentId1' },
      };

      const partialDesignItem2: ItemResponse = {
        path: '/path/to/partial-design2',
        displayName: 'partial design 2',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'partial design 2',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        access: adminPermissions,
        insertOptions: [],
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'd87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
              {
                templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
              },
            ],
          },
        },
        ancestors: undefined,
        parent: undefined,
      };

      const expectedPartialDesign1: Item = {
        path: '/path/to/partial-design1',
        displayName: 'partial design 1',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'partial design 1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: undefined,
        ancestors: undefined,
        parentId: 'parentId1',
        pageDesignId: undefined,
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'f87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
              {
                templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
              },
            ],
          },
        },
        standardValueItemId: undefined,
      };

      const expectedPartialDesign2: Item = {
        path: '/path/to/partial-design2',
        displayName: 'partial design 2',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'partial design 2',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: undefined,
        ancestors: undefined,
        parentId: undefined,
        pageDesignId: undefined,
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'd87a00b1-e6db-45ab-8b54-636fec3b5523',
              },
              {
                templateId: 'c57a00b1-e6db-45ab-8b54-636fec3b5520',
              },
            ],
          },
        },
        standardValueItemId: undefined,
      };

      const partialDesign1: PartialDesignResponse = {
        partialDesign: partialDesignItem1,
        siteName,
      };
      const partialDesign2: PartialDesignResponse = {
        partialDesign: partialDesignItem2,
        siteName,
      };

      const partialDesignList: PartialDesignResponse[] = [partialDesign1, partialDesign2];
      const expectedItems: Item[] = [expectedPartialDesign1, expectedPartialDesign2];

      pageTemplatesDalService.getPartialDesignFlatList.and.returnValue(of(partialDesignList));

      sut.getPartialDesignsList(siteName).subscribe((items) => {
        expect(items).toEqual(expectedItems);
      });
    });
  });

  describe('getPageDesignPartials', () => {
    it('should return an Observable of an array of partial design ids from DAL service result', () => {
      // Arrange
      const pageDesignId = 'page-design-id';

      let result: string[] | undefined;
      pageTemplatesDalService.getPageDesignPartials.and.returnValue(of(['id1', 'id2', 'id3']));

      // Act
      sut.getPageDesignPartials(pageDesignId).subscribe((partialIds: string[]) => {
        result = partialIds;
      });

      // Assert
      expect(pageTemplatesDalService.getPageDesignPartials).toHaveBeenCalledWith(pageDesignId);
      expect(result).toEqual(['id1', 'id2', 'id3']);
    });
  });

  describe('getTemplateUsageCount', () => {
    it('should return the template usage count', () => {
      // Arrange
      const templateId = 'example-template-id';

      let result: number | undefined;
      pageTemplatesDalService.getTemplatesUsageCount.and.returnValue(of(3));

      // Act
      sut.getTemplateUsageCount(templateId).subscribe((count: number) => {
        result = count;
      });

      // Assert
      expect(pageTemplatesDalService.getTemplatesUsageCount).toHaveBeenCalledWith(templateId.replace(/-/g, ''));
      expect(result).toBe(3);
    });
  });

  describe('getItemDetails', () => {
    it('should return item details', () => {
      // Arrange
      const templateId = 'example-template-id';
      const language = 'en';

      const expectedDetails = {
        path: '/item-1',
        displayName: 'Iteem 1',
        itemId: '1930bbeb-7805-471a-a3be-4858ac7cf696',
        name: 'item-1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        insertOptions: undefined,
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: undefined,
        ancestors: undefined,
        parentId: 'parentId',
        pageDesignId: undefined,
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: '0407560f-387b-4a90-adbe-398b077890e9',
              },
            ],
          },
        },
        standardValueItemId: undefined,
      };

      const itemDetails = {
        path: '/item-1',
        displayName: 'Iteem 1',
        itemId: '1930bbeb-7805-471a-a3be-4858ac7cf696',
        name: 'item-1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        access: adminPermissions,
        hasPresentation: true,
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230429T111641Z',
        },
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: '0407560f-387b-4a90-adbe-398b077890e9',
              },
            ],
          },
        },
        ancestors: undefined,
        parent: { itemId: 'parentId' },
      };
      pageTemplatesDalService.getItemDetails.and.returnValue(of(itemDetails));

      // Act
      sut.getItemDetails(templateId, language).subscribe((output) => {
        expect(output).toEqual(expectedDetails);
      });

      // Assert
      expect(pageTemplatesDalService.getItemDetails).toHaveBeenCalledWith(templateId, language);
    });
  });

  describe('getMoveToPermissions', () => {
    it('should return move to permissions', () => {
      // Arrange
      const templateId = 'example-template-id';
      const language = 'en';
      const destinationId = 'ffg3a2c2-3a9d-4d6e-a0bf-9a5fe6c8b2d0';

      const expectedResult = true;

      const actualResult = true;
      pageTemplatesDalService.getMoveToPermissions.and.returnValue(of(actualResult));

      // Act
      sut.getMoveToPermissions(templateId, language, destinationId).subscribe((output) => {
        expect(output).toEqual(expectedResult);
      });

      // Assert
      expect(pageTemplatesDalService.getMoveToPermissions).toHaveBeenCalledWith(templateId, language, destinationId);
    });
  });

  describe('createTemplatesStandardValuesItems', () => {
    it('should returns template items with thier standard values item', () => {
      const tempalteIds = ['id1', 'id2'];

      const templateItem1: ItemTemplate = {
        name: 'template1',
        templateId: 'id1',
        standardValuesItem: {
          itemId: 'itemId1',
        },
      };
      const templateItem2: ItemTemplate = {
        name: 'template2',
        templateId: 'id2',
        standardValuesItem: {
          itemId: 'itemId2',
        },
      };
      const templatesStandardValuesItemsResponse: ItemTemplateBulkOperationOutput = {
        successful: true,
        errorMessage: null,
        templates: [templateItem1, templateItem2],
      };
      const expectedResult: ItemTemplateBulkOperationOutput = {
        successful: true,
        errorMessage: null,
        templates: [{ ...templateItem1 }, { ...templateItem2 }],
      };
      pageTemplatesDalService.createTemplatesStandardValuesItems.and.returnValue(
        of(templatesStandardValuesItemsResponse),
      );

      // Act
      sut.createTemplatesStandardValuesItems(tempalteIds).subscribe((output) => {
        expect(output).toEqual(expectedResult);
      });

      // Assert
      expect(pageTemplatesDalService.createTemplatesStandardValuesItems).toHaveBeenCalledWith(tempalteIds);
    });
  });

  describe('updateStandardValuesInsertOptions', () => {
    it('should call updateStandardValuesInsertOptions with correct input and return update results', () => {
      const updates: StandardValuesItem[] = [
        { itemId: 'id1', insertOptions: [{ templateId: 'template1' }, { templateId: 'template2' }] },
        { itemId: 'id2', insertOptions: [{ templateId: 'template3' }] },
      ];

      const expectedInput: InsertOptionsUpdateInput[] = [
        { itemId: 'id1', insertOptions: '{template1}|{template2}' },
        { itemId: 'id2', insertOptions: '{template3}' },
      ];

      const svItem1: ItemResponse = {
        path: '/sv-item-1',
        displayName: 'SV Item 1',
        itemId: '1930bbeb-7805-471a-a3be-4858ac7cf696',
        name: 'sv-item-1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        access: adminPermissions,
        createdAt: {
          value: '20230428T111641Z',
        },
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'c89a00b1-e6db-45ab-8b54-636fec3b5523',
              },
            ],
          },
        },
        insertOptions: [{ templateId: 'templateId1' }, { templateId: 'template2' }],
      };
      const svItem2: ItemResponse = {
        path: '/sv-item-2',
        displayName: 'SV Item 2',
        itemId: '1930bbeb-7805-471a-a3be-4858ac7cf696',
        name: 'sv-item-1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        access: adminPermissions,
        createdAt: {
          value: '20230428T111641Z',
        },
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'c89a00b1-e6db-45ab-8b54-636fec3b5523',
              },
            ],
          },
        },
        insertOptions: [{ templateId: 'template3' }],
      };

      const actualResult: ItemBulkOperationOutputResponse = {
        successful: true,
        errorMessage: null,
        items: [svItem1, svItem2],
      };

      const expectedResult: ItemBulkOperationOutput = {
        successful: true,
        errorMessage: null,
        items: [
          {
            path: '/sv-item-1',
            displayName: 'SV Item 1',
            itemId: '1930bbeb-7805-471a-a3be-4858ac7cf696',
            name: 'sv-item-1',
            version: 1,
            hasChildren: false,
            thumbnailUrl: mockThumbnailUrl,
            hasPresentation: true,
            access: adminPermissions,
            createdDate: '20230428T111641Z',
            isFolder: false,
            template: {
              templateId: 'tmp001',
              name: 'template 001',
              baseTemplates: {
                nodes: [
                  {
                    templateId: 'c89a00b1-e6db-45ab-8b54-636fec3b5523',
                  },
                ],
              },
            },
            insertOptions: [{ templateId: 'templateId1' }, { templateId: 'template2' }],
            parentId: undefined,
            updatedDate: undefined,
            children: undefined,
            ancestors: undefined,
            pageDesignId: undefined,
            standardValueItemId: undefined,
          },
          {
            path: '/sv-item-2',
            displayName: 'SV Item 2',
            itemId: '1930bbeb-7805-471a-a3be-4858ac7cf696',
            name: 'sv-item-1',
            version: 1,
            hasChildren: false,
            thumbnailUrl: mockThumbnailUrl,
            hasPresentation: true,
            access: adminPermissions,
            createdDate: '20230428T111641Z',
            isFolder: false,
            template: {
              templateId: 'tmp001',
              name: 'template 001',
              baseTemplates: {
                nodes: [
                  {
                    templateId: 'c89a00b1-e6db-45ab-8b54-636fec3b5523',
                  },
                ],
              },
            },
            insertOptions: [{ templateId: 'template3' }],
            parentId: undefined,
            updatedDate: undefined,
            children: undefined,
            ancestors: undefined,
            pageDesignId: undefined,
            standardValueItemId: undefined,
          },
        ],
      };
      pageTemplatesDalService.updateStandardValuesInsertOptions.and.returnValue(of(actualResult));

      // Act
      sut.updateStandardValuesInsertOptions(updates).subscribe((output) => {
        expect(output).toEqual(expectedResult);
      });

      // Assert
      expect(pageTemplatesDalService.updateStandardValuesInsertOptions).toHaveBeenCalledWith(expectedInput);
    });
  });

  describe('createItem', () => {
    it('should call createItem with the correct input', () => {
      // Arrange
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

      const createItemOutputResponse: ItemOperationOutputResponse = {
        successful: true,
        errorMessage: null,
        item: {
          path: '/path/to/item',
          displayName: 'item',
          itemId: 'itemId',
          name: 'name',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          access: adminPermissions,
          insertOptions: [],
          createdAt: {
            value: '20230428T111641Z',
          },
          updatedAt: {
            value: '20230429T111641Z',
          },
          template: {
            templateId: 'tmp001',
            name: 'template 001',
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
          ancestors: undefined,
          parent: undefined,
        },
      };

      const expectedItemOutput: ItemOperationOutput = {
        successful: true,
        errorMessage: null,
        item: {
          path: '/path/to/item',
          displayName: 'item',
          itemId: 'itemId',
          name: 'name',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
          ancestors: undefined,
          parentId: undefined,
          pageDesignId: undefined,
          template: {
            templateId: 'tmp001',
            name: 'template 001',
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
          standardValueItemId: undefined,
        },
      };
      pageTemplatesDalService.createItem.and.returnValue(of(createItemOutputResponse));

      // Act
      sut.createItem(name, parent, templateId, language).subscribe((output) => {
        expect(output).toEqual(expectedItemOutput);
      });

      // Assert
      expect(pageTemplatesDalService.createItem).toHaveBeenCalledWith(createItemInput);
    });
  });

  describe('copyItem', () => {
    it('should call copyItem with the correct input', () => {
      // Arrange
      const copyItemName = 'item-name';
      const itemId = 'itemId';
      const targetParentId = 'parentItemId';

      const copyItemInput = {
        copyItemName,
        itemId,
        targetParentId,
      };

      const copyItemOutputResponse: ItemOperationOutputResponse = {
        successful: true,
        errorMessage: null,
        item: {
          path: '/path/to/item',
          displayName: 'item',
          itemId: 'itemId',
          name: 'name',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          access: adminPermissions,
          insertOptions: [],
          createdAt: {
            value: '20230428T111641Z',
          },
          updatedAt: {
            value: '20230429T111641Z',
          },
          template: {
            templateId: 'tmp001',
            name: 'template 001',
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
          ancestors: undefined,
          parent: { itemId: 'parentId' },
        },
      };

      const expectedItemOutput: ItemOperationOutput = {
        successful: true,
        errorMessage: null,
        item: {
          path: '/path/to/item',
          displayName: 'item',
          itemId: 'itemId',
          name: 'name',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
          ancestors: undefined,
          parentId: 'parentId',
          pageDesignId: undefined,
          template: {
            templateId: 'tmp001',
            name: 'template 001',
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
          standardValueItemId: undefined,
        },
      };
      pageTemplatesDalService.copyItem.and.returnValue(of(copyItemOutputResponse));

      // Act
      sut.copyItem(copyItemName, itemId, targetParentId).subscribe((output) => {
        expect(output).toEqual(expectedItemOutput);
      });

      // Assert
      expect(pageTemplatesDalService.copyItem).toHaveBeenCalledWith(copyItemInput, false);

      // Act
      sut.copyItem(copyItemName, itemId, targetParentId, true).subscribe((output) => {
        expect(output).toEqual(expectedItemOutput);
      });

      // Assert
      expect(pageTemplatesDalService.copyItem).toHaveBeenCalledWith(copyItemInput, true);
    });
  });

  describe('renameItem', () => {
    it('should call renameItem with the correct input', () => {
      // Arrange
      const newName = 'item-name';
      const itemId = 'itemId';

      const renameItemInput = {
        newName,
        itemId,
      };

      const renameItemOutputResponse: ItemOperationOutputResponse = {
        successful: true,
        errorMessage: null,
        item: {
          path: '/path/to/item',
          displayName: 'item',
          itemId: 'itemId',
          name: 'name',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          access: adminPermissions,
          insertOptions: [],
          createdAt: {
            value: '20230428T111641Z',
          },
          updatedAt: {
            value: '20230429T111641Z',
          },
          template: {
            templateId: 'tmp001',
            name: 'template 001',
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
          ancestors: undefined,
          parent: undefined,
        },
      };

      const expectedItemOutput: ItemOperationOutput = {
        successful: true,
        errorMessage: null,
        item: {
          path: '/path/to/item',
          displayName: 'item',
          itemId: 'itemId',
          name: 'name',
          version: 1,
          hasChildren: false,
          thumbnailUrl: mockThumbnailUrl,
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: '20230428T111641Z',
          updatedDate: '20230429T111641Z',
          access: adminPermissions,
          children: undefined,
          ancestors: undefined,
          parentId: undefined,
          pageDesignId: undefined,
          template: {
            templateId: 'tmp001',
            name: 'template 001',
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
          standardValueItemId: undefined,
        },
      };
      pageTemplatesDalService.renameItem.and.returnValue(of(renameItemOutputResponse));

      // Act
      sut.renameItem(itemId, newName).subscribe((output) => {
        expect(output).toEqual(expectedItemOutput);
      });

      // Assert
      expect(pageTemplatesDalService.renameItem).toHaveBeenCalledWith(renameItemInput);
    });
  });

  describe('deleteItem', () => {
    it('should call deleteItem with the correct input', () => {
      // Arrange
      const itemId = 'itemId';

      const deleteItemInput = {
        itemId,
        permanently: false,
      };

      const deleteItemOutputResponse: ItemOperationOutputResponse = {
        successful: true,
        errorMessage: null,
        item: null,
      };

      const expectedItemOutput: ItemOperationOutput = {
        successful: true,
        errorMessage: null,
        item: null,
      };
      pageTemplatesDalService.deleteItem.and.returnValue(of(deleteItemOutputResponse));

      // Act
      sut.deleteItem(itemId, false).subscribe((output) => {
        expect(output).toEqual(expectedItemOutput);
      });

      // Assert
      expect(pageTemplatesDalService.deleteItem).toHaveBeenCalledWith(deleteItemInput);
    });
  });

  describe('configurePageDesign', () => {
    it('should call configurePageDesign with the correct input', () => {
      const siteName = 'example.com';
      const pageDesignsMappingInput: PageDesignsMappingInput[] = [
        { templateId: 'template-1', pageDesignId: 'page-design-1' },
        { templateId: 'template-2', pageDesignId: 'page-design-2' },
      ];
      const configurePageDesignsInput: ConfigurePageDesignsInput = {
        siteName,
        mapping: pageDesignsMappingInput,
      };
      const configurePageDesignsOutput: ConfigurePageDesignsOutput = {
        success: true,
      };

      pageTemplatesDalService.configurePageDesign.and.returnValue(of(configurePageDesignsOutput));

      sut.configurePageDesign(configurePageDesignsInput).subscribe((output) => {
        expect(output).toEqual(configurePageDesignsOutput);
      });

      expect(pageTemplatesDalService.configurePageDesign).toHaveBeenCalledWith(configurePageDesignsInput);
    });
  });

  describe('assignPageDesignPartials', () => {
    it('should call assignPageDesignPartials with the correct input', () => {
      const pageDesignId = 'page-design-id';
      const partialDesignIds: string[] = ['id1', 'id2', 'id3'];

      const expectedResult: AssignPageDesignPartialsOutput = {
        success: true,
      };

      pageTemplatesDalService.assignPageDesignPartials.and.returnValue(of(expectedResult));

      sut.assignPageDesignPartials(pageDesignId, partialDesignIds).subscribe((actualResult) => {
        expect(actualResult).toEqual(expectedResult);
      });

      expect(pageTemplatesDalService.assignPageDesignPartials).toHaveBeenCalledWith({
        pageDesignId,
        partialDesignIds: ['id1', 'id2', 'id3'],
      });
    });
  });

  describe('assignPageDesign', () => {
    it('should call assignPageDesign with the correct input', () => {
      const itemId = 'item-id';
      const pageDesignId = 'page-design-id';

      const expectedResult: AssignPageDesignOutput = {
        success: true,
      };

      pageTemplatesDalService.assignPageDesign.and.returnValue(of(expectedResult));

      sut.assignPageDesign(itemId, pageDesignId).subscribe((actualResult) => {
        expect(actualResult).toEqual(expectedResult);
      });

      expect(pageTemplatesDalService.assignPageDesign).toHaveBeenCalledWith({
        itemId,
        pageDesignId,
      });
    });
  });

  describe('updatePageInsertOptions', () => {
    it('should call updatePageInsertOptions with the correct input', () => {
      const itemId = 'item-id';
      const pageInsertOptions = [{ templateId: 'template-id1' }, { templateId: 'template-id2' }];

      const deleteItemOutputResponse: ItemOperationOutputResponse = {
        successful: true,
        errorMessage: null,
        item: null,
      };

      const expectedItemOutput: ItemOperationOutput = {
        successful: true,
        errorMessage: null,
        item: null,
      };

      pageTemplatesDalService.updatePageInsertOptions.and.returnValue(of(deleteItemOutputResponse));

      sut.updatePageInsertOptions(itemId, pageInsertOptions).subscribe((actualResult) => {
        expect(actualResult).toEqual(expectedItemOutput);
      });

      expect(pageTemplatesDalService.updatePageInsertOptions).toHaveBeenCalledWith({
        itemId,
        insertOptions: '{template-id1}|{template-id2}',
      });
    });
  });

  describe('getItemChildrenWithAncestors', () => {
    it('should return an Observable of item with its ancestors from DAL service result', () => {
      // Arrange
      const itemId = '123';
      const language = 'en';

      const rawItems: ItemResponse = {
        path: '/item-1',
        displayName: 'Item 1',
        itemId: '1930bbeb-7805-471a-a3be-4858ac7cf696',
        name: 'item-1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        access: adminPermissions,
        createdAt: {
          value: '20230428T111641Z',
        },
        updatedAt: {
          value: '20230428T111641Z',
        },
        template: {
          templateId: 'tmp001',
          name: 'template 001',
          baseTemplates: {
            nodes: [
              {
                templateId: 'c89a00b1-e6db-45ab-8b54-636fec3b5523',
              },
            ],
          },
        },
        children: {
          nodes: [
            {
              path: '/path/to/item1/child1',
              displayName: 'Child 1',
              itemId: 'dd9a00b1-e6db-45ab-8b54-636fec3b5566',
              name: 'child1',
              version: 1,
              hasChildren: false,
              thumbnailUrl: '/child1-thumbnail.jpg',
              hasPresentation: true,
              access: adminPermissions,
              insertOptions: [],
              createdAt: {
                value: '20230428T111641Z',
              },
              template: {
                templateId: 'tmp001',
                name: 'template 001',
                baseTemplates: {
                  nodes: [
                    {
                      templateId: 'c89a00b1-e6db-45ab-8b54-636fec3b5523',
                    },
                  ],
                },
              },
            },
            {
              path: '/path/to/item1/child2',
              displayName: 'Child 2',
              itemId: '789',
              name: 'child2',
              version: 1,
              hasChildren: false,
              thumbnailUrl: '',
              hasPresentation: false,
              access: adminPermissions,
              insertOptions: [],
              createdAt: {
                value: '20230428T111641Z',
              },
              template: {
                templateId: 'tmp001',
                name: 'template 001',
                baseTemplates: {
                  nodes: [
                    {
                      templateId: 'a87a00b1-e6db-45ab-8b54-636fec3b5523',
                    },
                  ],
                },
              },
            },
          ],
        },
        insertOptions: [],
        ancestors: [
          {
            displayName: 'Item 1',
            itemId: 'ee9a00b1-e6db-45ab-8b54-636fec3b5576',
          },
        ],
      };

      pageTemplatesDalService.getItemChildrenWithAncestors.and.returnValue(of(rawItems));

      // Act
      const result$ = sut.getItemChildrenWithAncestors(itemId, language);

      // Assert
      result$.subscribe((items: Item) => {
        expect(items.displayName).toBe('Item 1');
        expect(items.children?.length).toBe(2);
        expect(items.children?.[0].displayName).toBe('Child 1');
        expect(items.children?.[0].isFolder).toBeFalse();
        expect(items.children?.[1].displayName).toBe('Child 2');
        expect(items.children?.[1].isFolder).toBeTrue();
        expect(items.displayName).toBe('Item 1');
        expect(items.ancestors?.length).toBe(1);
      });
    });
  });

  describe('validateName', () => {
    it('should return true when name is valid', async () => {
      // Arrange
      const existingNames = [''];

      // Act
      const result = await sut.validateName('newFolderName', existingNames);

      // Assert
      expect(timedNotificationsService.pushNotification).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false and show name empty error notification when create folder item fails', async () => {
      // Arrange
      const existingNames = [''];

      // Act
      const result = await sut.validateName('', existingNames);

      // Assert
      const [{ id, text, severity }] = timedNotificationsService.pushNotification.calls.mostRecent().args;
      expect(timedNotificationsService.pushNotification).toHaveBeenCalledTimes(1);
      expect(text).toBe('VALIDATION.VALIDATE_NAME.EMPTY');
      expect(severity).toBe('error');
      expect(id).toBe('pageDesignRequestError');
      expect(result).toBe(false);
    });

    it('should return false and show name not allowed error notification when create folder item fails', async () => {
      // Arrange
      const existingNames = [''];

      // Act
      const result = await sut.validateName('#%¤%/%&¤&#', existingNames);

      // Assert
      const [{ id, text, severity }] = timedNotificationsService.pushNotification.calls.mostRecent().args;
      expect(timedNotificationsService.pushNotification).toHaveBeenCalledTimes(1);
      expect(text).toBe('VALIDATION.VALIDATE_NAME.NOT_ALLOWED_CHARACTER');
      expect(severity).toBe('error');
      expect(id).toBe('pageDesignRequestError');
      expect(result).toBe(false);
    });

    it('should return false and show name already used error notification when create folder item fails', async () => {
      // Arrange
      const existingNames = ['newFolderName'];

      // Act
      const result = await sut.validateName('newFolderName', existingNames);

      // Assert
      const [{ id, text, severity }] = timedNotificationsService.pushNotification.calls.mostRecent().args;
      expect(timedNotificationsService.pushNotification).toHaveBeenCalledTimes(1);
      expect(text).toBe('VALIDATION.VALIDATE_NAME.ALREADY_USED');
      expect(severity).toBe('error');
      expect(id).toBe('pageDesignRequestError');
      expect(result).toBe(false);
    });
  });

  describe('watchSelectedPartialDesignItems()', () => {
    it('should return empty array if there is no selected partial design', async () => {
      const selectedPartialDesignItems = await firstValueFrom(sut.watchSelectedPartialDesignItems());

      expect(selectedPartialDesignItems).toEqual([]);
    });

    it('should return selected partial designs', async () => {
      const selectedPartialDesign1: Item = {
        path: '/path/to/partial-design1',
        displayName: 'partial design 1',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'partial design 1',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: undefined,
        ancestors: undefined,
      };

      const selectedPartialDesign2: Item = {
        path: '/path/to/partial-design2',
        displayName: 'partial design 2',
        itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
        name: 'partial design 2',
        version: 1,
        hasChildren: false,
        thumbnailUrl: mockThumbnailUrl,
        hasPresentation: true,
        isFolder: false,
        insertOptions: [],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: undefined,
        ancestors: undefined,
      };

      const selectedItems: Item[] = [selectedPartialDesign1, selectedPartialDesign2];
      sut.setSelectedPartialDesignItems(selectedItems);

      const selectedPartialDesignItems = await firstValueFrom(sut.watchSelectedPartialDesignItems());
      expect(selectedPartialDesignItems).toEqual(selectedItems);
    });
  });
});
