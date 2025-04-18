/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@sitecore/ng-spd-lib';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { PageTemplatesService } from '../page-templates.service';
import {
  Item,
  ItemWithSite,
  PAGE_DESIGN_FOLDER_TEMPLATE_ID,
  PAGE_DESIGN_TEMPLATE_ID,
  PARTIAL_DESIGN_FOLDER_TEMPLATE_ID,
  PARTIAL_DESIGN_TEMPLATE_ID,
} from '../page-templates.types';
import { PageTemplatesItemsNavigationBaseService } from './page-templates-items-navigation-base.service';
import { adminPermissions } from './page-templates-test-data';

export const expectedChildrenWithAncestors = {
  ancestors: [
    {
      displayName: 'design',
      itemId: '1a27243c-2d19-4285-925c-ff73ffbefc32',
    },
    {
      displayName: 'folder-1',
      itemId: '1a27243c-2d19-4285-925c',
    },
  ],
  children: [
    {
      path: '/path/to/item',
      displayName: 'Item Display Name',
      itemId: 'xyz',
      name: 'Item Name',
      version: 1,
      hasChildren: true,
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      hasPresentation: true,
      isFolder: false,
      insertOptions: [],
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      access: adminPermissions,
      ancestors: undefined,
    },
    {
      path: '/path/to/child-item',
      displayName: 'Child Item Display Name',
      itemId: '456',
      name: 'Child Item Name',
      version: 1,
      hasChildren: false,
      thumbnailUrl: 'https://example.com/child-thumbnail.jpg',
      hasPresentation: false,
      isFolder: true,
      insertOptions: [],
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      access: adminPermissions,
      children: [],
      ancestors: undefined,
    },
  ],
  createdDate: '',
  displayName: 'New folder1234',
  hasChildren: false,
  hasPresentation: false,
  insertOptions: [],
  isFolder: true,
  itemId: 'folderItem',
  name: '',
  version: 1,
  path: '',
  thumbnailUrl: '',
  updatedDate: '',
  access: adminPermissions,
};

export class PageTemplatesServiceMock {
  getItemChildrenWithAncestors(
    _itemId: string,
    _language: string,
    _includeTemplateIDs?: string[],
    _includeSubChildren = false,
  ): Observable<Item> {
    return of(expectedChildrenWithAncestors);
  }

  getPartialDesignsRoots(siteName: string, language: string): Observable<ItemWithSite[]> {
    return of([
      {
        path: '/path/to/item',
        displayName: 'Item Display Name' + language,
        itemId: 'rootId',
        name: 'Item Name',
        version: 1,
        hasChildren: true,
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        hasPresentation: true,
        isFolder: false,
        insertOptions: [
          {
            templateId: 'partialDesignFolderTemplateId',
            baseTemplates: {
              nodes: [
                {
                  templateId: PARTIAL_DESIGN_FOLDER_TEMPLATE_ID,
                },
                {
                  templateId: '',
                },
              ],
            },
          },
          {
            templateId: 'partialDesignItemTemplateId',
            baseTemplates: {
              nodes: [
                {
                  templateId: PARTIAL_DESIGN_TEMPLATE_ID,
                },
                {
                  templateId: '123',
                },
              ],
            },
          },
        ],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: [
          {
            path: '/path/to/child-item',
            displayName: 'Child Item Display Name',
            itemId: '456',
            name: 'Child Item Name',
            version: 1,
            hasChildren: false,
            thumbnailUrl: 'https://example.com/child-thumbnail.jpg',
            hasPresentation: false,
            isFolder: true,
            insertOptions: [],
            createdDate: '20230428T111641Z',
            updatedDate: '20230429T111641Z',
            access: adminPermissions,
            children: [],
          },
        ],

        siteName,
      },
    ]);
  }

  getPageDesignsRoots(siteName: string, language: string): Observable<ItemWithSite[]> {
    return of([
      {
        path: '/path/to/item',
        displayName: 'Item Display Name' + language,
        itemId: 'rootId',
        name: 'Item Name',
        version: 1,
        hasChildren: true,
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        hasPresentation: true,
        isFolder: false,
        insertOptions: [
          {
            templateId: 'pageDesignFolderTemplateId',
            baseTemplates: {
              nodes: [
                {
                  templateId: PAGE_DESIGN_FOLDER_TEMPLATE_ID,
                },
                {
                  templateId: '',
                },
              ],
            },
          },
          {
            templateId: 'pageDesignItemTemplateId',
            baseTemplates: {
              nodes: [
                {
                  templateId: PAGE_DESIGN_TEMPLATE_ID,
                },
                {
                  templateId: '123',
                },
              ],
            },
          },
        ],
        createdDate: '20230428T111641Z',
        updatedDate: '20230429T111641Z',
        access: adminPermissions,
        children: [
          {
            path: '/path/to/child-item',
            displayName: 'Child Item Display Name',
            itemId: '456',
            name: 'Child Item Name',
            version: 1,
            hasChildren: false,
            thumbnailUrl: 'https://example.com/child-thumbnail.jpg',
            hasPresentation: false,
            isFolder: true,
            insertOptions: [],
            createdDate: '20230428T111641Z',
            updatedDate: '20230429T111641Z',
            access: adminPermissions,
            children: [],
          },
        ],
        siteName,
      },
    ]);
  }

  getPageDesigsRootWithNoChildren(siteName: string): Observable<ItemWithSite[]> {
    return of([
      {
        ancestors: [],
        children: [],
        createdDate: '',
        displayName: 'Page Designs',
        hasChildren: false,
        hasPresentation: false,
        insertOptions: [
          {
            baseTemplates: {
              nodes: [
                {
                  templateId: PAGE_DESIGN_FOLDER_TEMPLATE_ID,
                },
                {
                  templateId: '',
                },
              ],
            },
            templateId: 'pageDesignFolderTemplateId',
          },
          {
            baseTemplates: {
              nodes: [
                {
                  templateId: PAGE_DESIGN_TEMPLATE_ID,
                },
                {
                  templateId: '123',
                },
              ],
            },
            templateId: 'pageDesignItemTemplateId',
          },
        ],
        isFolder: false,
        itemId: '69d85e8e-d5e3-434c-895a-d839562bc6b3',
        name: 'Page Designs',
        version: 1,
        path: '',
        siteName,
        thumbnailUrl: '',
        updatedDate: '',
        access: adminPermissions,
      },
    ]);
  }

  getPartialDesigsRootWithNoChildren(siteName: string): Observable<ItemWithSite[]> {
    return of([
      {
        ancestors: [],
        children: [],
        createdDate: '',
        displayName: 'Partial Designs',
        hasChildren: false,
        hasPresentation: false,
        insertOptions: [
          {
            templateId: 'partialDesignFolderTemplateId',
            baseTemplates: {
              nodes: [
                {
                  templateId: PARTIAL_DESIGN_FOLDER_TEMPLATE_ID,
                },
                {
                  templateId: '',
                },
              ],
            },
          },
          {
            templateId: 'partialDesignItemTemplateId',
            baseTemplates: {
              nodes: [
                {
                  templateId: PARTIAL_DESIGN_TEMPLATE_ID,
                },
                {
                  templateId: '123',
                },
              ],
            },
          },
        ],
        isFolder: false,
        itemId: '69d85e8e-d5e3-434c-895a-d839562bc6b3',
        name: 'Partial Designs',
        version: 1,
        path: '',
        siteName,
        thumbnailUrl: '',
        updatedDate: '',
        access: adminPermissions,
      },
    ]);
  }
}

describe(PageTemplatesItemsNavigationBaseService.name, () => {
  let sut: PageTemplatesItemsNavigationBaseService;
  let contextService: ContextServiceTesting;
  let paramMapSubject: BehaviorSubject<ParamMap>;
  let router: jasmine.SpyObj<Router>;
  let pageTemplatesService: PageTemplatesServiceMock;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;

  beforeEach(() => {
    paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({ folder_id: null }));

    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, ContextServiceTestingModule, ButtonModule],
      providers: [
        PageTemplatesItemsNavigationBaseService,
        {
          provide: PageTemplatesService,
          useClass: PageTemplatesServiceMock,
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', ['pushNotification']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>({
            navigate: Promise.resolve(true),
          }),
        },

        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
      ],
    });

    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);
    pageTemplatesService = TestBed.inject(PageTemplatesService) as PageTemplatesServiceMock;
    router = TestBedInjectSpy(Router);
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideDefaultTestContext();
    sut = TestBed.inject(PageTemplatesItemsNavigationBaseService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('watchItems', () => {
    it('should set item to empty and show error message if service returns an error on fetching folder items', fakeAsync(() => {
      // Arrange
      spyOn(pageTemplatesService, 'getItemChildrenWithAncestors').and.returnValue(
        throwError(() => new Error('Test error')),
      );
      const params$ = of(convertToParamMap({ folder_id: 'folderItem' }));

      // Act
      sut.watchItems(params$);
      contextService.provideDefaultTestContext();
      tick();

      // Assert
      sut.items$.subscribe((items: ItemWithSite[]) => {
        expect(items).toEqual([]);
      });
      sut.isLoading$.subscribe((isLoading: boolean) => {
        expect(isLoading).toBe(false);
      });

      const [{ id, text, severity }] = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args;
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
      expect(text).toBe('PAGE_DESIGNS.WORKSPACE.BAD_REQUEST_ERROR_MESSAGE');
      expect(severity).toBe('error');
      expect(id).toBe('pageTemplateRequestError');
      flush();
    }));
  });

  describe('navigateToChildFolder', () => {
    it('should navigate to child folder', () => {
      // Arrange
      const folderIdToNavigate = 'test-folder';

      // Act
      sut.navigateToFolder(folderIdToNavigate);

      // Assert
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { folder_id: folderIdToNavigate, site_type: 'current' },
        queryParamsHandling: 'merge',
      });
    });
  });

  describe('navigateToAncestorFolder', () => {
    it('should navigate to ancestor folder', () => {
      // Arrange
      const ancestor = {
        itemId: 'ancestor-id',
        displayName: 'ancestor-display-name',
      };

      // Act
      sut.navigateToFolder(ancestor.itemId);

      // Assert
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { folder_id: ancestor.itemId, site_type: 'current' },
        queryParamsHandling: 'merge',
      });
    });

    it('should set folder_id param to null if ancestor is root', () => {
      // Arrange
      const ancestor = {
        itemId: 'root',
        displayName: 'overview',
      };

      // Act
      sut.navigateToFolder(ancestor.itemId);

      // Assert
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { folder_id: null, site_type: 'current' },
        queryParamsHandling: 'merge',
      });
    });
  });

  describe('changeSiteType', () => {
    it('should navigate to current site type', () => {
      // Arrange
      const siteType = 'current';

      // Act
      sut.changeSiteType(siteType);

      // Assert
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { folder_id: null, site_type: siteType },
        queryParamsHandling: 'merge',
      });
    });

    it('should navigate to shared site type', () => {
      // Arrange
      const siteType = 'shared';

      // Act
      sut.changeSiteType(siteType);

      // Assert
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { folder_id: null, site_type: siteType },
        queryParamsHandling: 'merge',
      });
    });
  });
});
