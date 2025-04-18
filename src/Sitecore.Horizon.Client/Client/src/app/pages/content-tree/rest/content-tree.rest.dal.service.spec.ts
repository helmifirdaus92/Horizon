/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { PageApiService } from 'app/shared/rest/page/page.api.service';
import { Page, PageOperationResponse, SavePageResponse, UpdatePageRequest } from 'app/shared/rest/page/page.types';
import { SiteRepositoryService } from 'app/shared/site-language/site-repository.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, of } from 'rxjs';
import { DISPLAY_NAME_FIELD_ID } from '../content-tree.service';
import { ContentTreeRestDalService } from './content-tree.rest.dal.service';

describe(ContentTreeRestDalService.name, () => {
  let sut: ContentTreeRestDalService;
  let pageApiServiceSpy: jasmine.SpyObj<PageApiService>;
  let siteRepositoryServiceSpy: jasmine.SpyObj<SiteRepositoryService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule, HttpClientModule, StaticConfigurationServiceStubModule],
      providers: [
        {
          provide: PageApiService,
          useValue: jasmine.createSpyObj<PageApiService>({
            getPage: undefined,
            getPageChildren: undefined,
            getPageHierarchy: undefined,
            getPageState: undefined,
            getPageInsertOptions: undefined,
            createPage: undefined,
            updatePage: undefined,
            duplicatePage: undefined,
            savePage: undefined,
            deletePage: undefined,
            renamePage: undefined,
          }),
        },
        {
          provide: SiteRepositoryService,
          useValue: jasmine.createSpyObj<SiteRepositoryService>({ getSiteId: undefined }),
        },
        ContentTreeRestDalService,
      ],
    });

    siteRepositoryServiceSpy = TestBedInjectSpy(SiteRepositoryService);
    siteRepositoryServiceSpy.getSiteId.and.returnValue('siteId');
    pageApiServiceSpy = TestBedInjectSpy(PageApiService);
    sut = TestBed.inject(ContentTreeRestDalService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('add a folder', () => {
    it('should add a folder', () => {
      const name = 'Test Folder';
      const templateId = 'templateId';
      const parentId = 'parentId';
      const language = 'en';
      const site = 'site';

      const response = {
        pageId: 'newPageId',
        path: 'path',
        displayName: name,
        name,
      };

      pageApiServiceSpy.createPage.and.returnValue(of(response));

      sut.addFolder(name, templateId, parentId, language, site).subscribe((result) => {
        expect(result.id).toBe(response.pageId);
        expect(result.displayName).toBe(response.displayName);
      });

      expect(pageApiServiceSpy.createPage).toHaveBeenCalledWith({
        parentId,
        pageName: name,
        templateId,
        language,
      });
    });
  });

  describe('create a page', () => {
    it('should add a page', () => {
      const name = 'Test Page';
      const templateId = 'templateId';
      const parentId = 'parentId';
      const language = 'en';
      const site = 'site';

      const response = {
        pageId: 'newPageId',
        path: 'path',
        displayName: name,
        name,
      };

      pageApiServiceSpy.createPage.and.returnValue(of(response));

      sut.addPage(name, templateId, parentId, language, site).subscribe((result) => {
        expect(result.id).toBe(response.pageId);
        expect(result.displayName).toBe(response.displayName);
      });

      expect(pageApiServiceSpy.createPage).toHaveBeenCalledWith({
        parentId,
        pageName: name,
        templateId,
        language,
      });
    });
  });

  describe('delete a page', () => {
    it('should delete an item', () => {
      const itemId = 'itemId';

      pageApiServiceSpy.deletePage.and.returnValue(of(true));

      sut.deleteItem(itemId).subscribe(() => {
        expect(pageApiServiceSpy.deletePage).toHaveBeenCalledWith(itemId, { permanently: true });
      });
    });
  });

  describe('change display name', () => {
    it('should change display name', () => {
      const pageId = 'pageId';
      const newDisplayName = 'New Display Name';
      const language = 'en';
      const site = 'site';

      const response = {
        id: pageId,
        displayName: newDisplayName,
      };

      const savePageResponse: PageOperationResponse = {
        pageId,
        path: 'path',
        displayName: newDisplayName,
        name: newDisplayName,
      };

      const requestBody: UpdatePageRequest = {
        language: 'en',
        fields: [{ name: '__Display name', value: newDisplayName }],
      };

      pageApiServiceSpy.updatePage.and.returnValue(of(savePageResponse));

      sut.changeDisplayName(pageId, newDisplayName, language, site).subscribe((result) => {
        expect(result.id).toBe(response.id);
        expect(result.displayName).toBe(response.displayName);
      });

      expect(pageApiServiceSpy.updatePage).toHaveBeenCalledWith(pageId, requestBody);
    });
  });

  describe('rename a page', () => {
    it('should rename page', () => {
      const pageId = 'pageId';
      const newDisplayName = 'New Display Name';
      const language = 'en';
      const site = 'site';

      const renameItem = {
        itemId: pageId,
        newName: 'New Name',
      };

      const response = {
        renameItem: {
          id: renameItem.itemId,
          name: renameItem.newName,
        },
        updateItem: null,
      };

      const renameResponse = {
        pageId: 'newPageId',
        path: 'path',
        displayName: newDisplayName,
        name: renameItem.newName,
      };

      const savePageResponse: SavePageResponse = {
        language,
        site,
        pageVersion: 1,
        revision: 'revision',
        fields: [{ id: DISPLAY_NAME_FIELD_ID, value: newDisplayName, containsStandardValue: false }],
        layout: undefined,
        originalLayout: undefined,
        errors: [],
        savedPage: {
          id: pageId,
          language,
          revision: 'revision',
          version: 1,
          fields: [{ id: DISPLAY_NAME_FIELD_ID, value: newDisplayName, containsStandardValue: false }],
        },
        validationErrors: [],
        warnings: [],
        newCreatedVersion: { pageId, displayName: newDisplayName, versionNumber: 1 },
      };

      pageApiServiceSpy.renamePage.and.returnValue(of(renameResponse));
      pageApiServiceSpy.savePage.and.returnValue(of(savePageResponse));

      sut.renamePage(renameItem, null, language, site).subscribe((result) => {
        expect(result.renameItem).toEqual(response.renameItem);
        expect(result.updateItem).toEqual(response.updateItem);
      });

      expect(pageApiServiceSpy.renamePage).toHaveBeenCalledWith(renameItem.itemId, { newName: renameItem.newName });
    });
  });

  describe('item children', () => {
    it('should fetch item children', async () => {
      const siteName = 'website';
      const language = 'en';
      const itemId = 'itemId';
      const siteId = '227bc0ff-6237-42b6-851f-49e68c1998e8';

      const pageResponse: Page[] = [
        {
          id: 'pageId',
          name: 'Page',
          route: 'page-route',
          createdAt: '2024-04-29',
          hasPresentation: true,
          templateId: 'templateId',
          updatedAt: '2024-04-29',
          workflow: undefined,
          parentId: 'parentId',
          version: 1,
          versionName: 'Version 1',
          revision: 'Revision 1',
          displayName: 'Page Display Name',
          icon: 'page-icon',
          url: 'page-url',
          hasChildren: true,
          language: 'en',
          template: {
            id: 'templateId',
            name: 'Template',
            path: 'template-path',
            displayName: 'Template display name',
            baseTemplateIds: [],
          },
          createdBy: 'John Doe',
          permissions: {
            canWrite: true,
            canDelete: true,
            canRename: true,
            canCreate: true,
            canPublish: true,
            canAdmin: true,
            canRead: true,
          },
          locking: {
            lockedByCurrentUser: false,
            isLocked: false,
            canUnlock: true,
            lockedBy: '',
          },
          publishing: {
            hasPublishableVersion: true,
            isPublishable: true,
            validFromDate: '2024-04-29',
            validToDate: '2024-04-30',
            isAvailableToPublish: true,
          },
          finalLayout: 'page-final-layout',
          sharedLayout: 'page-shared-layout',
          layoutEditingKind: 'FINAL',
          insertOptions: [],
          hasVersions: true,
          updatedBy: 'John Doe',
          path: 'page-path',
        },
      ];

      pageApiServiceSpy.getPageChildren.and.returnValue(of(pageResponse));
      siteRepositoryServiceSpy.getSiteId.and.returnValue(siteId);

      const result = (await firstValueFrom(sut.fetchItemChildren(siteName, language, itemId)))?.children;
      const child = result ? result[0] : undefined;

      // Assertions
      expect(child!.id).toBe('pageId');
      expect(child!.name).toBe('Page');
      expect(child!.version).toBe(1);
      expect(child!.versionName).toBe('Version 1');
      expect(child!.revision).toBe('Revision 1');
      expect(child!.updatedDate).toBe('2024-04-29');
      expect(child!.displayName).toBe('Page Display Name');
      expect(child!.icon).toBe('page-icon');
      expect(child!.updatedBy).toBe('John Doe');
      expect(child!.route).toBe('page-route');
      expect(child!.path).toBe('page-path');
      expect(child!.hasChildren).toBe(true);
      expect(child!.language).toBe('en');
      expect(child!.template).toEqual({
        id: 'templateId',
        name: 'Template',
        displayName: 'Template display name',
        path: 'template-path',
        baseTemplateIds: [],
      });
      expect(child!.fields).toEqual([]);
      expect(child!.isFolder).toBe(false);
      expect(child!.ancestors).toEqual([]);
      expect(child!.workflow).toBeNull();
      expect(child!.isLatestPublishableVersion).toBe(true);
      expect(child!.creationDate).toBe('2024-04-29');
      expect(child!.createdBy).toBe('John Doe');
      expect(child!.insertOptions).toEqual([]);
      expect(child!.permissions).toEqual({
        canWrite: true,
        canDelete: true,
        canRename: true,
        canCreate: true,
        canPublish: true,
      });
      expect(child!.locking).toEqual({
        lockedByCurrentUser: false,
        isLocked: false,
      });
      expect(child!.publishing).toEqual({
        hasPublishableVersion: true,
        isPublishable: true,
        validFromDate: '2024-04-29',
        validToDate: '2024-04-30',
        isAvailableToPublish: true,
      });

      expect(siteRepositoryServiceSpy.getSiteId).toHaveBeenCalledWith('website');
      expect(pageApiServiceSpy.getPageChildren).toHaveBeenCalledWith(itemId, siteId, language);
    });
  });
});
