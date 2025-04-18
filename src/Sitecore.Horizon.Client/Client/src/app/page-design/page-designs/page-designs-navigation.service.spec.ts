/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@sitecore/ng-spd-lib';
import {
  ContextServiceTesting,
  ContextServiceTestingModule,
  DEFAULT_TEST_CONTEXT,
} from 'app/shared/client-state/context.service.testing';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { PageTemplatesService } from '../page-templates.service';
import {
  AncestorWithSite,
  Item,
  ItemWithSite,
  PAGE_DESIGN_FOLDER_TEMPLATE_ID,
  PAGE_DESIGN_TEMPLATE_ID,
} from '../page-templates.types';
import {
  expectedChildrenWithAncestors,
  PageTemplatesServiceMock,
} from '../shared/page-templates-items-navigation-base.service.spec';
import { adminPermissions } from '../shared/page-templates-test-data';
import { PageDesignsNavigationService } from './page-designs-navigation.service';

describe(PageDesignsNavigationService.name, () => {
  let sut: PageDesignsNavigationService;
  let contextService: ContextServiceTesting;
  let pageTemplatesService: PageTemplatesServiceMock;
  let paramMapSubject: BehaviorSubject<ParamMap>;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;

  beforeEach(() => {
    paramMapSubject = new BehaviorSubject<ParamMap>(convertToParamMap({ folder_id: null }));

    TestBed.configureTestingModule({
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        ButtonModule,
        RouterTestingModule,
      ],
      providers: [
        PageDesignsNavigationService,
        {
          provide: PageTemplatesService,
          useClass: PageTemplatesServiceMock,
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', ['pushNotification']),
        },
        { provide: ActivatedRoute, useValue: paramMapSubject.asObservable() },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
      ],
    });

    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);
    contextService = TestBed.inject(ContextServiceTesting);
    pageTemplatesService = TestBed.inject(PageTemplatesService) as PageTemplatesServiceMock;
    sut = TestBed.inject(PageDesignsNavigationService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('watchItems', () => {
    it('should fetch page design items and set site root and template ids info on context changes', fakeAsync(() => {
      // Arrange
      const expectedItems = [
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
          siteName: 'sitecore1',
        },
      ];

      const expectedCurrentRootItemId = 'rootId';
      const expectedSitePageDesignTemplateId = 'pageDesignItemTemplateId';
      const expectedsitePageDesignFolderTemplateId = 'pageDesignFolderTemplateId';

      const pageTemplatesServiceSpy = spyOn(pageTemplatesService, 'getPageDesignsRoots').and.callThrough();

      // Act
      sut.watchItems(paramMapSubject);
      contextService.provideDefaultTestContext();
      tick();

      // Assert
      expect(pageTemplatesServiceSpy).toHaveBeenCalledWith(
        DEFAULT_TEST_CONTEXT.siteName,
        DEFAULT_TEST_CONTEXT.language,
      );
      sut.items$.subscribe((items: ItemWithSite[]) => {
        expect(items).toEqual(expectedItems);
      });
      sut.isLoading$.subscribe((isLoading: boolean) => {
        expect(isLoading).toBe(false);
      });
      sut.currentRootItem$.subscribe((currentRootItem: Item | ItemWithSite | undefined) => {
        expect(currentRootItem?.itemId).toBe(expectedCurrentRootItemId);
      });
      sut.siteItemTemplateId$.subscribe((sitePageDesignTemplateId: string | undefined) => {
        expect(sitePageDesignTemplateId).toBe(expectedSitePageDesignTemplateId);
      });
      sut.siteFolderTemplateId$.subscribe((sitePageDesignFolderTemplateId: string | undefined) => {
        expect(sitePageDesignFolderTemplateId).toBe(expectedsitePageDesignFolderTemplateId);
      });
      flush();
    }));

    it('should fetch page design root only and set site root and template ids info if it is child item', fakeAsync(() => {
      // Arrange
      const pageTemplatesServiceSpy = spyOn(pageTemplatesService, 'getPageDesigsRootWithNoChildren').and.callThrough();

      sut.designRoots$ = of([]);
      const params$ = of(convertToParamMap({ folder_id: 'folderItem' }));
      const expectedSitePageDesignTemplateId = 'pageDesignItemTemplateId';
      const expectedSitePageDesignFolderTemplateId = 'pageDesignFolderTemplateId';

      // Act
      sut.watchItems(params$);
      contextService.provideDefaultTestContext();
      tick();

      expect(pageTemplatesServiceSpy).toHaveBeenCalledWith(DEFAULT_TEST_CONTEXT.siteName);

      sut.currentRootItem$.subscribe((currentRootItem: Item | ItemWithSite | undefined) => {
        expect(currentRootItem?.itemId).toBe('folderItem');
      });
      sut.siteItemTemplateId$.subscribe((sitePartialDesignTemplateId: string | undefined) => {
        expect(sitePartialDesignTemplateId).toBe(expectedSitePageDesignTemplateId);
      });
      sut.siteFolderTemplateId$.subscribe((sitePartialDesignFolderTemplateId: string | undefined) => {
        expect(sitePartialDesignFolderTemplateId).toBe(expectedSitePageDesignFolderTemplateId);
      });
      flush();
    }));

    it('should fetch page design folder item and update breadcrumbs if it is folder item', fakeAsync(() => {
      // Arrange
      const pageTemplatesServiceSpy = spyOn(pageTemplatesService, 'getItemChildrenWithAncestors').and.callThrough();

      const params$ = of(convertToParamMap({ folder_id: 'folderItem' }));
      sut['_designRoots$'].next([{ itemId: '1a27243c-2d19-4285-925c', siteName: 'website1' }]);

      // Act
      sut.watchItems(params$);
      contextService.provideDefaultTestContext();
      tick();

      const itemResult = expectedChildrenWithAncestors.children?.map((child) => ({ ...child, siteName: 'website1' }));

      expect(pageTemplatesServiceSpy).toHaveBeenCalledWith(
        'folderItem',
        DEFAULT_TEST_CONTEXT.language,
        [PAGE_DESIGN_FOLDER_TEMPLATE_ID, PAGE_DESIGN_TEMPLATE_ID],
        false,
      );
      sut.items$.subscribe((items: ItemWithSite[]) => {
        expect(items).toEqual(itemResult);
      });
      sut.breadCrumbItems$.subscribe((breadCrumbs: AncestorWithSite[]) => {
        expect(breadCrumbs.length).toBe(2);
      });
      flush();
    }));

    it('should set item to empty and show error message if service returns an error on fetching root items', fakeAsync(() => {
      // Arrange
      spyOn(pageTemplatesService, 'getPageDesignsRoots').and.returnValue(throwError(() => new Error('Test error')));
      const params$ = of(convertToParamMap({ folder_id: '' }));

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
});
