/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { ItemChangeScope } from 'app/shared/client-state/item-change-service';
import { SiteRepositoryService } from 'app/shared/site-language/site-repository.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, of } from 'rxjs';
import { PageApiService } from '../page/page.api.service';
import { PageTestData } from '../page/page.test.data';
import { Page } from '../page/page.types';
import { ItemDalRestService } from './item.dal.rest.service';

describe(ItemDalRestService.name, () => {
  let sut: ItemDalRestService;
  let pageApiServiceSpy: jasmine.SpyObj<PageApiService>;
  let siteRepositoryServiceSpy: jasmine.SpyObj<SiteRepositoryService>;

  const pageResponse: Page = {
    id: 'pageId',
    name: 'Page',
    version: 1,
    createdBy: 'John Doe',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    icon: 'icon',
    revision: 'revision',
    templateId: 'templateId',
    url: 'url',
    versionName: 'version 1',
    template: {
      id: 'templateId',
      name: 'Template',
      path: '/template/path',
      baseTemplateIds: ['2bb25752-b3bc-4f13-b9cb-38b906d21a33', '77b1399f-5f30-4643-a054-59bbb1c7c62c'],
      displayName: 'Template display name',
    },
    workflow: {
      id: 'workflowId',
      displayName: 'Workflow',
      finalState: true,
      canEdit: true,
      warnings: [],
      commands: [],
      icon: 'workflow-icon',
    },
    publishing: {
      isPublishable: true,
      hasPublishableVersion: true,
      isAvailableToPublish: true,
      validFromDate: '2024-01-01',
      validToDate: '2024-01-02',
    },
    route: '/page/route',
    finalLayout: 'page-final-layout',
    sharedLayout: 'page-shared-layout',
    layoutEditingKind: 'FINAL',
    parentId: 'parentPageId',
    hasPresentation: true,
    hasChildren: true,
    permissions: {
      canAdmin: true,
      canWrite: true,
      canCreate: true,
      canDelete: true,
      canRename: true,
      canRead: true,
      canPublish: true,
    },
    locking: {
      canUnlock: true,
      isLocked: false,
      lockedBy: '',
      lockedByCurrentUser: false,
    },
    displayName: 'Page Display Name',
    language: 'en',
    insertOptions: [],
    hasVersions: true,
    updatedBy: '',
    path: '',
  };

  const versionsResponse: Page[] = [
    {
      id: 'versionId1',
      name: 'Version 1',
      createdBy: 'John Doe',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      icon: 'icon',
      revision: 'revision',
      templateId: 'templateId',
      url: 'url',
      versionName: 'version 1',
      version: 2,
      template: {
        id: 'templateId',
        name: 'Template',
        path: '/template/path',
        displayName: 'Template display name',
        baseTemplateIds: ['2bb25752-b3bc-4f13-b9cb-38b906d21a33', '77b1399f-5f30-4643-a054-59bbb1c7c62c'],
      },
      workflow: {
        id: 'workflowId',
        displayName: 'Workflow',
        finalState: true,
        canEdit: true,
        warnings: [],
        commands: [],
        icon: 'workflow-icon',
      },
      publishing: {
        isPublishable: true,
        hasPublishableVersion: true,
        isAvailableToPublish: true,
        validFromDate: '2024-01-01',
        validToDate: '2024-01-02',
      },
      route: '/version1/route',
      finalLayout: 'version1-final-layout',
      sharedLayout: 'version1-shared-layout',
      layoutEditingKind: 'FINAL',
      parentId: 'parentPageId',
      hasPresentation: true,
      hasChildren: true,
      permissions: {
        canAdmin: true,
        canWrite: true,
        canCreate: true,
        canDelete: true,
        canRename: true,
        canRead: true,
        canPublish: true,
      },
      locking: {
        canUnlock: true,
        isLocked: false,
        lockedBy: '',
        lockedByCurrentUser: false,
      },
      displayName: 'Version 1 Display Name',
      language: 'en',
      insertOptions: [],
      hasVersions: true,
      updatedBy: '',
      path: '',
    },
  ];

  const siteName = 'website';
  const language = 'en';
  const itemId = 'itemId';
  const itemVersion = 1;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule, HttpClientModule, StaticConfigurationServiceStubModule],
      providers: [
        {
          provide: PageApiService,
          useValue: jasmine.createSpyObj<PageApiService>({
            getPage: undefined,
            getPageVersions: undefined,
            getPageHierarchy: undefined,
            getPageAncestors: undefined,
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
          useValue: jasmine.createSpyObj<SiteRepositoryService>({
            getSiteId: undefined,
          }),
        },
        ItemDalRestService,
      ],
    });

    siteRepositoryServiceSpy = TestBedInjectSpy(SiteRepositoryService);
    siteRepositoryServiceSpy.getSiteId.and.returnValue('website');

    pageApiServiceSpy = TestBedInjectSpy(PageApiService);
    sut = TestBed.inject(ItemDalRestService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should fetch item and its versions', async () => {
    // Arrange
    pageApiServiceSpy.getPage.and.returnValue(of(pageResponse));
    pageApiServiceSpy.getPageVersions.and.returnValue(of(versionsResponse));

    // Act
    const result = await firstValueFrom(sut.getItem(itemId, language, siteName, itemVersion));

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe('pageId');
    expect(result.name).toBe('Page');
    expect(result.version).toBe(1);
    expect(result.createdBy).toBe('John Doe');
    expect(result.creationDate).toBe('2024-01-01');
    expect(result.updatedDate).toBe('2024-01-01');
    expect(result.template).toEqual({
      id: 'templateId',
      name: 'Template',
      displayName: 'Template display name',
      path: '/template/path',
      baseTemplateIds: ['2bb25752-b3bc-4f13-b9cb-38b906d21a33', '77b1399f-5f30-4643-a054-59bbb1c7c62c'],
    });
    expect(result.workflow).toEqual({
      id: 'workflowId',
      displayName: 'Workflow',
      finalState: true,
      canEdit: true,
      warnings: [],
      commands: [],
    });
    expect(result.publishing).toEqual({
      isPublishable: true,
      hasPublishableVersion: true,
      isAvailableToPublish: true,
      validFromDate: '2024-01-01',
      validToDate: '2024-01-02',
    });
    expect(result.presentationDetails).toBe('page-final-layout');
    expect(result.layoutEditingKind).toBe('FINAL');
    expect(result.isFolder).toBe(false);
    expect(result.hasChildren).toBe(true);
    expect(result.permissions).toEqual({
      canWrite: true,
      canCreate: true,
      canDelete: true,
      canRename: true,
      canPublish: true,
    });
    expect(result.locking).toEqual({
      isLocked: false,
      lockedByCurrentUser: false,
    });
    expect(result.displayName).toBe('Page Display Name');
    expect(result.language).toBe('en');
    expect(result.versions.length).toBe(1);
    expect(result.versions[0].id).toBe('versionId1');
    expect(result.versions[0].name).toBe('Version 1');
    expect(result.versions[0].version).toBe(2);
    expect(result.versions[0].createdBy).toBe('John Doe');
    expect(result.versions[0].creationDate).toBe('2024-01-01');
    expect(result.versions[0].updatedDate).toBe('2024-01-01');
    expect(result.versions[0].template).toEqual({
      id: 'templateId',
      name: 'Template',
      displayName: 'Template display name',
      path: '/template/path',
      baseTemplateIds: ['2bb25752-b3bc-4f13-b9cb-38b906d21a33', '77b1399f-5f30-4643-a054-59bbb1c7c62c'],
    });
    expect(result.versions[0].workflow).toEqual({
      id: 'workflowId',
      displayName: 'Workflow',
      finalState: true,
      canEdit: true,
      warnings: [],
      commands: [],
    });
    expect(result.versions[0].publishing).toEqual({
      isPublishable: true,
      hasPublishableVersion: true,
      isAvailableToPublish: true,
      validFromDate: '2024-01-01',
      validToDate: '2024-01-02',
    });
    expect(result.versions[0].presentationDetails).toBe('version1-final-layout');
    expect(result.versions[0].layoutEditingKind).toBe('FINAL');
    expect(result.versions[0].isFolder).toBe(false);
    expect(result.versions[0].hasChildren).toBe(true);
    expect(result.versions[0].permissions).toEqual({
      canWrite: true,
      canCreate: true,
      canDelete: true,
      canRename: true,
      canPublish: true,
    });
    expect(result.versions[0].locking).toEqual({
      isLocked: false,
      lockedByCurrentUser: false,
    });
    expect(result.versions[0].displayName).toBe('Version 1 Display Name');
    expect(result.versions[0].language).toBe('en');
  });

  it('should fetch item versions', async () => {
    // Arrange
    pageApiServiceSpy.getPage.and.returnValue(of(pageResponse));
    pageApiServiceSpy.getPageVersions.and.returnValue(of(versionsResponse));
    spyOn(sut, 'getItem').and.callThrough();

    // Act
    const result = await firstValueFrom(sut.getItemVersions(itemId, language, siteName, itemVersion));
    expect(sut.getItem).toHaveBeenCalledWith(itemId, language, siteName, itemVersion);

    // Assert
    expect(result).toBeDefined();
    expect(result.language).toBe('en');
    expect(result.versions.length).toBe(1);
  });

  it('should fetch item state with scopes', async () => {
    // Arrange
    const itemId = 'itemId';
    const language = 'en';
    const site = 'website';
    const itemVersion = 1;
    const scopes: ItemChangeScope[] = ['versions', 'workflow', 'layout'];

    const pageResponse: any = {
      id: 'pageId',
      displayName: 'Page',
      revision: 'revision',
      version: 1,
      versionName: 'versionName',
      finalLayout: 'page-final-layout',
      layoutEditingKind: 'FINAL',
      workflow: {
        id: 'workflowId',
        displayName: 'Workflow',
        finalState: true,
        canEdit: true,
        warnings: [],
        commands: [],
        icon: 'workflow-icon',
      },
      versions: [
        {
          id: 'versionId1',
          name: 'Version 1',
          createdBy: 'John Doe',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          icon: 'icon',
          revision: 'revision',
          templateId: 'templateId',
          url: 'url',
          versionName: 'version 1',
          version: 2,
          template: {
            id: 'templateId',
            name: 'Template',
            path: '/template/path',
            baseTemplateIds: ['2bb25752-b3bc-4f13-b9cb-38b906d21a33', '77b1399f-5f30-4643-a054-59bbb1c7c62c'],
          },
          workflow: {
            id: 'workflowId',
            displayName: 'Workflow',
            finalState: true,
            canEdit: true,
            warnings: [],
            commands: [],
            icon: 'workflow-icon',
          },
          publishing: {
            isPublishable: true,
            hasPublishableVersion: true,
            isAvailableToPublish: true,
            validFromDate: '2024-01-01',
            validToDate: '2024-01-02',
          },
          route: '/version1/route',
          finalLayout: 'version1-final-layout',
          sharedLayout: 'version1-shared-layout',
          layoutEditingKind: 'FINAL',
          parentId: 'parentPageId',
          hasPresentation: true,
          hasChildren: true,
          permissions: {
            canAdmin: true,
            canWrite: true,
            canCreate: true,
            canDelete: true,
            canRename: true,
            canRead: true,
            canPublish: true,
          },
          locking: {
            canUnlock: true,
            isLocked: false,
            lockedBy: '',
            lockedByCurrentUser: false,
          },
          displayName: 'Version 1 Display Name',
          language: 'en',
        },
      ],
    };

    pageApiServiceSpy.getPageState.and.returnValue(of(pageResponse));

    // Act
    const result = await firstValueFrom(sut.getItemState(itemId, language, site, itemVersion, scopes));

    // Assert
    expect(result.id).toBe('pageId');
    expect(result.displayName).toBe('Page');
    expect(result.revision).toBe('revision');
    expect(result.version).toBe(1);
    expect(result.versionName).toBe('versionName');
    expect(result.presentationDetails).toBe('page-final-layout');
    expect(result.layoutEditingKind).toBe('FINAL');
    expect(result.workflow).toEqual({
      id: 'workflowId',
      displayName: 'Workflow',
      finalState: true,
      canEdit: true,
      warnings: [],
      commands: [],
    });
    expect(result.versions.length).toBe(1);
    expect(result.versions[0].id).toBe('versionId1');
    expect(result.versions[0].name).toBe('Version 1');
  });

  it('should fetch item state without scopes', async () => {
    // Arrange
    const itemId = 'itemId';
    const language = 'en';
    const site = 'website';
    const itemVersion = 1;

    const pageResponse: any = {
      id: 'pageId',
      displayName: 'Page',
      revision: 'revision',
      version: 1,
      versionName: 'versionName',
      finalLayout: 'page-final-layout',
      layoutEditingKind: 'FINAL',
      // No versions, workflow included
    };

    pageApiServiceSpy.getPageState.and.returnValue(of(pageResponse));

    // Act
    const result = await firstValueFrom(sut.getItemState(itemId, language, site, itemVersion));

    // Assert
    expect(result.id).toBe('pageId');
    expect(result.displayName).toBe('Page');
    expect(result.revision).toBe('revision');
    expect(result.version).toBe(1);
    expect(result.versionName).toBe('versionName');
    expect(result.presentationDetails).toBe('page-final-layout');
    expect(result.layoutEditingKind).toBe('FINAL');
    expect(result.versions).toBeUndefined();
    expect(result.workflow).toBeUndefined();
  });

  it('should fetch item insert options', async () => {
    // Arrange
    const itemId = 'itemId';
    const kind = 'page';
    const language = 'en';
    const site = 'website';

    const insertOptionsResponse = [
      { id: 'optionId1', displayName: 'Option 1' },
      { id: 'optionId2', displayName: 'Option 2' },
    ];

    pageApiServiceSpy.getPageInsertOptions.and.returnValue(of(insertOptionsResponse));

    // Act
    const result = await firstValueFrom(sut.getItemInsertOptions(itemId, kind, language, site));

    // Assert
    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('optionId1');
    expect(result[0].displayName).toBe('Option 1');
  });

  it('should get item type for page with base template ids and ancestors templates', async () => {
    // Arrange
    const itemId = 'pageId';
    const language = 'en';
    const siteId = '123';
    const site = 'website';

    const pageResponse: Page = PageTestData.mockPage;
    const mockPageAncestors: Page[] = PageTestData.mockAncestors;

    pageApiServiceSpy.getPage.and.returnValue(of(pageResponse));
    pageApiServiceSpy.getPageAncestors.and.returnValue(of(mockPageAncestors));

    // Act
    const result = await firstValueFrom(sut.getItemType(itemId, site, siteId, language));

    // Assert
    expect(result).toEqual({
      id: 'pageId123',
      version: 1,
      kind: 'Page',
      baseTemplateIds: ['2bb25752-b3bc-4f13-b9cb-38b906d21a33', '77b1399f-5f30-4643-a054-59bbb1c7c62c'],
      ancestors: [{ template: { id: 'template789' } }],
    });
  });

  it('should fetch item display name', async () => {
    // Arrange
    const itemId = 'itemId';
    const language = 'en';
    const site = 'website';

    const pageResponse: any = {
      id: 'pageId',
      displayName: 'Page Display Name',
    };

    pageApiServiceSpy.getPage.and.returnValue(of(pageResponse));

    // Act
    const result = await firstValueFrom(sut.getItemDisplayName(itemId, language, site));

    // Assert
    expect(result).toBe('Page Display Name');
  });
});
