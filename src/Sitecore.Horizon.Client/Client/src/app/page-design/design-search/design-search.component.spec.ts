/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule, LoadingIndicatorModule, PopoverModule, SearchInputModule } from '@sitecore/ng-spd-lib';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { Site, SiteService } from 'app/shared/site-language/site-language.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of, Subject } from 'rxjs';
import { PageDesignsNavigationService } from '../page-designs/page-designs-navigation.service';
import { Ancestor, FOLDER_ITEM_ID, Item, ItemResponse } from '../page-templates.types';
import { PartialDesignsNavigationService } from '../partial-designs/partial-designs-navigation.service';
import { adminPermissions } from '../shared/page-templates-test-data';
import { DesignSearchComponent } from './design-search.component';
import { DesignSearchDalService } from './design-search.dal.service';

const Initial_Context = {
  itemId: 'itemId1',
  language: 'lang1',
  siteName: 'website1',
};

const mockAncestors: Ancestor[] = [
  {
    displayName: 'Content',
    itemId: '0000001234578',
  },
  {
    displayName: 'Page Designs',
    itemId: '00000123',
  },
  {
    displayName: 'site1',
    itemId: '227bc0ff-6237-42b6-851f-49e68c1998e8',
  },
];

const mockPageDesignSearchResult = (designAncestors = mockAncestors): ItemResponse[] => [
  {
    path: '',
    displayName: 'Page Designs',
    itemId: 'c32a5dd1-d51a-49ba-8e83-cee96950e2be',
    name: 'Page Designs',
    version: 1,
    hasChildren: true,
    thumbnailUrl: '',
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
            templateId: 'daaf41fd-96db-4892-be99-f62f16d036c4',
          },
        ],
      },
    },
  },
  {
    path: '',
    displayName: 'design1',
    itemId: 'id1',
    name: 'design1',
    version: 1,
    hasChildren: true,
    thumbnailUrl: '',
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
            templateId: 'e6db-45ab-8b54-636fec3b5523',
          },
        ],
      },
    },
    ancestors: designAncestors,
  },
  {
    path: '',
    displayName: 'design2',
    itemId: 'id2',
    name: 'design2',
    version: 1,
    hasChildren: true,
    thumbnailUrl: '',
    hasPresentation: true,
    access: adminPermissions,
    createdAt: {
      value: '20240428T111641Z',
    },
    template: {
      templateId: 'tmp003',
      name: 'template 003',
      baseTemplates: {
        nodes: [
          {
            templateId: '41ab-4d01-9eb0-67441b7c2450',
          },
        ],
      },
    },
    parent: { itemId: 'parentId' },
    ancestors: designAncestors,
  },
  {
    path: '',
    displayName: 'Design Folder',
    itemId: 'folder1',
    name: 'Design Folder',
    version: 1,
    hasChildren: false,
    thumbnailUrl: '',
    hasPresentation: false,
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
            templateId: FOLDER_ITEM_ID,
          },
        ],
      },
    },
    ancestors: designAncestors,
  },
];

const mockPartialDesignSearchResult: ItemResponse[] = [
  {
    path: '',
    displayName: 'Partial Designs',
    itemId: '17977bec-f601-42f2-8933-284be282485d',
    name: 'Partial Designs',
    version: 1,
    hasChildren: true,
    thumbnailUrl: '',
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
            templateId: '6a4620bb-19f5-4995-837a-7baa61231c52',
          },
        ],
      },
    },
  },
  {
    path: '',
    displayName: 'header',
    itemId: 'id1',
    name: 'header',
    version: 1,
    hasChildren: true,
    thumbnailUrl: '',
    hasPresentation: true,
    access: adminPermissions,
    parent: {
      itemId: '00000012345',
    },
    createdAt: {
      value: '20230428T111641Z',
    },
    template: {
      templateId: 'tmp001',
      name: 'template 001',
      baseTemplates: {
        nodes: [
          {
            templateId: 'e6db-45ab-8b54-636fec3b5523',
          },
        ],
      },
    },
  },
  {
    path: '',
    displayName: 'sub header',
    itemId: 'id2',
    name: 'footer',
    version: 1,
    hasChildren: true,
    thumbnailUrl: '',
    hasPresentation: true,
    access: adminPermissions,
    createdAt: {
      value: '20240428T111641Z',
    },
    template: {
      templateId: 'tmp003',
      name: 'template 003',
      baseTemplates: {
        nodes: [
          {
            templateId: '41ab-4d01-9eb0-67441b7c2450',
          },
        ],
      },
    },
  },
  {
    path: '',
    displayName: 'header Folder',
    itemId: 'folder1',
    name: 'header Folder',
    version: 1,
    hasChildren: false,
    thumbnailUrl: '',
    hasPresentation: false,
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
            templateId: FOLDER_ITEM_ID,
          },
        ],
      },
    },
  },
];
const testSite: Site = {
  id: '227bc0ff-6237-42b6-851f-49e68c1998e8',
  hostId: 'hostId 1',
  collectionId: '337bc0ff-6237-42b6-851f-49e68c1998e8',
  name: 'site1',
  displayName: 'site1',
  language: 'en',
  startItemId: '',
  supportedLanguages: ['en'],
  properties: {
    isSxaSite: true,
    tagsFolderId: 'id001',
    isLocalDatasourcesEnabled: true,
  },
};

const mappedDesignItem = (designAncestors = mockAncestors) => {
  return {
    displayName: 'test',
    itemId: '17977bec',
    name: 'test',
    parentId: 'parentId',
    ancestors: designAncestors,
  } as Item;
};

describe(DesignSearchComponent.name, () => {
  let sut: DesignSearchComponent;
  let fixture: ComponentFixture<DesignSearchComponent>;
  let pageDesignsNavigationServiceSpy: jasmine.SpyObj<PageDesignsNavigationService>;
  let partialDesignsNavigationServiceSpy: jasmine.SpyObj<PartialDesignsNavigationService>;
  let contextService: ContextServiceTesting;
  let siteServiceSpy: jasmine.SpyObj<SiteService>;
  let router: jasmine.SpyObj<Router>;
  const searchResult = new Subject<{ isSuccessful: boolean; items: ItemResponse[] }>();

  const designSearchDalServiceMock = {
    search: jasmine.createSpy('search').and.returnValue(searchResult),
  };

  const inputEl = () =>
    fixture.debugElement.query(By.css('ng-spd-search-input input')).nativeElement as HTMLInputElement;

  const searchText = (searchQuery = 'test') => {
    inputEl().value = searchQuery;
    inputEl().dispatchEvent(new Event('keyup'));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SearchInputModule,
        PopoverModule,
        ContextServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        LoadingIndicatorModule,
        NoopAnimationsModule,
        ListModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [DesignSearchComponent],
      providers: [
        {
          provide: PageDesignsNavigationService,
          useValue: jasmine.createSpyObj<PageDesignsNavigationService>('PageDesignsNavigationService', [
            'designRoots$',
          ]),
        },
        {
          provide: PartialDesignsNavigationService,
          useValue: jasmine.createSpyObj<PartialDesignsNavigationService>('PartialDesignsNavigationService', [
            'designRoots$',
          ]),
        },
        {
          provide: DesignSearchDalService,
          useValue: designSearchDalServiceMock,
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('SiteService', ['getContextSite']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>({
            navigate: Promise.resolve(true),
          }),
        },
      ],
    }).compileComponents();

    pageDesignsNavigationServiceSpy = TestBedInjectSpy(PageDesignsNavigationService);
    partialDesignsNavigationServiceSpy = TestBedInjectSpy(PartialDesignsNavigationService);
    siteServiceSpy = TestBedInjectSpy(SiteService);
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(Initial_Context);
    router = TestBedInjectSpy(Router);

    fixture = TestBed.createComponent(DesignSearchComponent);
    sut = fixture.componentInstance;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('ngOnInit', () => {
    describe('page design search', () => {
      beforeEach(waitForAsync(() => {
        pageDesignsNavigationServiceSpy.designRoots$ = of([
          { itemId: 'c32a5dd1-d51a-49ba-8e83-cee96950e2be', siteName: 'site1' },
        ]);
        sut.designType = 'pagedesign';
        sut.ngOnInit();
        fixture.detectChanges();
      }));

      it('should set PageDesignsNavigationService as design search service', () => {
        expect(sut.designNavigationService).toEqual(pageDesignsNavigationServiceSpy);
      });

      it('should call page design item search when searchInput and designRoots emit value', fakeAsync(() => {
        // Arrange
        searchText();
        tick(500);

        // Assert
        expect(designSearchDalServiceMock.search).toHaveBeenCalledWith(
          'test',
          ['c32a5dd1-d51a-49ba-8e83-cee96950e2be'],
          'pagedesign',
        );
        flush();
      }));

      it('should map page designItems and page designFolders from the search result', fakeAsync(() => {
        // Arrange
        searchText('design');
        tick(500);

        // Act
        searchResult.next({
          isSuccessful: true,
          items: mockPageDesignSearchResult(),
        });
        fixture.detectChanges();

        // Assert
        expect(sut.designItems.length).toBe(2);
        expect(sut.designFolders.length).toBe(1);
        flush();
      }));

      it('should exclude page design root item from the search design list', () => {
        // Arrange
        searchText('page');

        // Act
        searchResult.next({
          isSuccessful: true,
          items: [mockPageDesignSearchResult()[0]],
        });
        fixture.detectChanges();

        // Assert
        expect(sut.designItems.length).toBe(0);
      });
    });

    describe('partial design search', () => {
      beforeEach(waitForAsync(() => {
        sut.designType = 'partialdesign';
        partialDesignsNavigationServiceSpy.designRoots$ = of([
          { itemId: '17977bec-f601-42f2-8933-284be282485d', siteName: 'site1' },
        ]);
        sut.ngOnInit();
        fixture.detectChanges();
      }));

      it('should set PartialDesignsNavigationService as design search service', () => {
        expect(sut.designNavigationService).toEqual(partialDesignsNavigationServiceSpy);
      });

      it('should call partial design item search when searchInput and designRoots emit value', async () => {
        // Arrange
        searchText();
        await fixture.whenStable();

        // Assert
        expect(designSearchDalServiceMock.search).toHaveBeenCalledWith(
          'test',
          ['17977bec-f601-42f2-8933-284be282485d'],
          'partialdesign',
        );
      });

      it('should map partial designItems and partial designFolders from the search result', fakeAsync(() => {
        // Arrange
        searchText('header');
        tick(500);

        // Act
        searchResult.next({
          isSuccessful: true,
          items: mockPartialDesignSearchResult,
        });
        fixture.detectChanges();

        // Assert
        expect(sut.designItems.length).toBe(2);
        expect(sut.designFolders.length).toBe(1);
        flush();
      }));

      it('should exclude partial design root item from the search design list', () => {
        // Arrange
        searchText('page');

        // Act
        searchResult.next({
          isSuccessful: true,
          items: [mockPartialDesignSearchResult[0]],
        });
        fixture.detectChanges();

        // Assert
        expect(sut.designItems.length).toBe(0);
      });
    });
  });

  describe('Context site change', () => {
    it('should set active site itemId as currentItemId', async () => {
      // Arrange
      contextService.setTestSite('site1');
      siteServiceSpy.getContextSite.and.returnValue(testSite);

      // Act
      fixture.detectChanges();

      // Assert
      expect(sut.currentSiteRootItemId).toEqual('227bc0ff-6237-42b6-851f-49e68c1998e8');
    });

    it('should set search string to null', () => {
      // Arrange
      contextService.setTestSite('site1');

      // Act
      const input = inputEl();

      // Assert
      expect(input.value).toEqual('');
    });
  });

  describe('Context language change', () => {
    it('should set search string to null', () => {
      // Arrange
      contextService.setTestLang('fn');

      // Act
      const input = inputEl();

      // Assert
      expect(input.value).toEqual('');
    });
  });

  describe('onFolderItemClick', () => {
    it('should navigate to folder item with site_type = `current` if current site is on a folder ancestors array', () => {
      // Arrange
      siteServiceSpy.getContextSite.and.returnValue(testSite);
      fixture.detectChanges();

      // Act
      const folder = { ...mockPageDesignSearchResult()[3], isFolder: true } as Item;
      sut.onFolderItemClick(folder);
      fixture.detectChanges();

      // Assert
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { folder_id: 'folder1', site_type: 'current' },
        queryParamsHandling: 'merge',
      });
    });

    it('should navigate to folder item with site_type = `shared` if current site is not on a folder ancestors array', () => {
      // Arrange
      siteServiceSpy.getContextSite.and.returnValue(testSite);
      fixture.detectChanges();

      // Act
      const ancestors = [
        {
          displayName: 'site1',
          itemId: '00000345',
        },
        {
          displayName: 'Page Designs',
          itemId: '12345000000',
        },
      ];
      const folder = { ...mockPageDesignSearchResult(ancestors)[3], isFolder: true } as Item;
      sut.onFolderItemClick(folder);
      fixture.detectChanges();

      // Assert
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { folder_id: 'folder1', site_type: 'shared' },
        queryParamsHandling: 'merge',
      });
    });
  });

  describe('designItemClick', () => {
    it('should navigate to design item with site_type = `current` if current site is on a folder ancestors array', () => {
      // Arrange
      siteServiceSpy.getContextSite.and.returnValue(testSite);
      fixture.detectChanges();

      // Act
      sut.onDesignItemClick(mappedDesignItem());
      fixture.detectChanges();

      // Assert
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { folder_id: 'parentId', site_type: 'current' },
        queryParamsHandling: 'merge',
      });
    });

    it('should navigate to design item with site_type = `shared` if current site is not on a folder ancestors array', () => {
      // Arrange
      siteServiceSpy.getContextSite.and.returnValue(testSite);
      fixture.detectChanges();

      // Act
      const ancestors = [
        {
          displayName: 'site1',
          itemId: '00000345',
        },
        {
          displayName: 'Page Designs',
          itemId: '12345000000',
        },
      ];
      sut.onDesignItemClick(mappedDesignItem(ancestors));
      fixture.detectChanges();

      // Assert
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { folder_id: 'parentId', site_type: 'shared' },
        queryParamsHandling: 'merge',
      });
    });
  });
});
